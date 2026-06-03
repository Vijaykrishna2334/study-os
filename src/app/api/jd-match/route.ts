import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";

const SYSTEM = `You are a senior AI/ML hiring manager. Given (a) a job description and (b) a list of topics the candidate has mastered (confidence ≥ 4) plus weaker topics (confidence < 4), produce STRICT JSON:
{
  "jdTitle": "...",
  "fitScore": 0-100,
  "matchedCodes": ["..."],         // codes from the mastered list that DIRECTLY map to the JD
  "gapCodes":    ["..."],          // codes from the weak list the candidate must close to be a strong fit (max 8)
  "bullets":     ["..."],          // 4-6 resume bullets tailored to this JD, each ≤ 25 words, leading with a metric where possible
  "rationale":   "..."             // 2-3 sentences explaining fit + biggest gap
}
Output ONLY the JSON. No preamble. No markdown fence.`;

export async function POST(req: NextRequest) {
  try {
    const { jdText } = await req.json() as { jdText: string };
    if (!jdText || jdText.length < 80) return NextResponse.json({ error: "paste full JD text" }, { status: 400 });

    const hash = createHash("sha256").update(jdText.slice(0, 4000)).digest("hex").slice(0, 24);
    const cached = await prisma.jDMatch.findUnique({ where: { jdHash: hash } });
    if (cached) return NextResponse.json({ ok: true, cached: true, match: cached });

    const mastered = await prisma.topic.findMany({ where: { confidence: { gte: 4 } }, select: { code: true, title: true } });
    const weak     = await prisma.topic.findMany({ where: { confidence: { lt:  4 } }, select: { code: true, title: true } });

    const prompt = `## Job Description
${jdText.slice(0, 4000)}

## Mastered topics (confidence ≥ 4)
${mastered.map((t) => `${t.code} ${t.title}`).join("\n").slice(0, 2500) || "(none yet)"}

## Weak topics (confidence < 4)
${weak.map((t) => `${t.code} ${t.title}`).join("\n").slice(0, 2500)}

Produce the JSON.`;

    const raw = await geminiText(prompt, SYSTEM, { jsonMode: true, maxTokens: 4096 });
    const json = extractJson(raw);
    if (!json) return NextResponse.json({ error: "Gemini returned non-JSON" }, { status: 500 });

    const saved = await prisma.jDMatch.create({
      data: {
        jdHash: hash,
        jdTitle: json.jdTitle || "Untitled JD",
        jdText: jdText.slice(0, 8000),
        fitScore: clampInt(json.fitScore, 0, 100),
        matchedCodes: JSON.stringify(Array.isArray(json.matchedCodes) ? json.matchedCodes : []),
        gapCodes: JSON.stringify(Array.isArray(json.gapCodes) ? json.gapCodes : []),
        bullets: JSON.stringify(Array.isArray(json.bullets) ? json.bullets : []),
      },
    });
    return NextResponse.json({ ok: true, cached: false, match: saved, rationale: json.rationale });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function extractJson(raw: string): any | null {
  try { return JSON.parse(raw.trim()); } catch {}
  // Walk character-by-character tracking brace depth (skip inside strings)
  let inStr = false, escaped = false, depth = 0, start = -1;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (escaped) { escaped = false; continue; }
    if (c === "\\" && inStr) { escaped = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{") { if (depth === 0) start = i; depth++; }
    else if (c === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        try { return JSON.parse(raw.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}
function clampInt(v: any, lo: number, hi: number) { const n = Number(v) | 0; return Math.max(lo, Math.min(hi, n)); }
