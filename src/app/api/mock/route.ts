import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";

const SYSTEM = `You are a rigorous senior ML interviewer at a top AI company. Conduct a focused mock interview on the given topic.
Style: terse, probing, no praise. Always one question per turn.

Behavior:
- Turn 1 (no history): open with ONE rigorous, depth-revealing question. No preamble.
- Subsequent turns: First, score the candidate's last answer on (a) Correctness /5, (b) Depth /5, (c) Articulation /5 in a one-line scorecard like "Score — C:4 D:3 A:4". Then give ONE sentence of pointed feedback. Then ask ONE harder follow-up.
- After 5 user turns, end with a final verdict: hire / lean-hire / no-hire and 2-line rationale.
- Never reveal answers; force the candidate to derive.`;

export async function POST(req: NextRequest) {
  try {
    const { topicId, history } = await req.json() as { topicId: string; history: { role: "interviewer"|"you"; text: string }[] };
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) return NextResponse.json({ error: "topic not found" }, { status: 404 });

    let notes = "";
    try { notes = readFileSync(topic.filePath, "utf8").slice(0, 5000); } catch {}

    const transcript = history.map((h) => `${h.role === "interviewer" ? "INTERVIEWER" : "CANDIDATE"}: ${h.text}`).join("\n\n");
    const prompt = `Topic: ${topic.title} (${topic.code}) · Phase ${topic.phase} · Tier ${topic.tier}

--- Reference notes (do NOT reveal verbatim) ---
${notes}

--- Transcript so far ---
${transcript || "(none — open the interview)"}

Now produce ONLY your next interviewer turn.`;

    const text = await geminiText(prompt, SYSTEM);
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
