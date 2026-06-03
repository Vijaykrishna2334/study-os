// Fetch an arXiv paper's abstract + metadata, summarise via Gemini, save to DB.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";

const SUMMARY_SYSTEM = `You are an AI/ML research distiller. Given the arXiv abstract of a paper, output STRICT JSON:
{
  "tldr": "1-sentence punchline",
  "problem": "what problem the paper attacks (2-3 sentences)",
  "key_idea": "the novel idea / mechanism (3-5 sentences with math if relevant)",
  "results": "headline numbers or claims (2-4 sentences with specific metrics where stated)",
  "limitations": "honest weaknesses or open questions (2-3 sentences)",
  "why_it_matters": "industry impact + which downstream techniques use this (2-3 sentences)",
  "interview_questions": ["3 sharp questions a senior engineer would be asked about this paper"]
}
No preamble, no markdown fence, just the JSON.`;

function extractArxivId(input: string): string | null {
  const t = input.trim();
  // Accept full URL or bare id
  const urlMatch = t.match(/arxiv\.org\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5})/i);
  if (urlMatch) return urlMatch[1];
  const bare = t.match(/^(\d{4}\.\d{4,5})$/);
  return bare ? bare[1] : null;
}

async function fetchArxivAtom(id: string) {
  const r = await fetch(`https://export.arxiv.org/api/query?id_list=${id}`, { cache: "no-store" });
  const xml = await r.text();
  const title    = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, " ").trim() || "";
  const summary  = xml.match(/<entry>[\s\S]*?<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, " ").trim() || "";
  const authors  = [...xml.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/g)].map((m) => m[1].trim()).join(", ");
  const published = xml.match(/<entry>[\s\S]*?<published>([\s\S]*?)<\/published>/)?.[1] || "";
  return { title, summary, authors, published };
}

export async function POST(req: NextRequest) {
  try {
    const { input, force } = await req.json();
    const id = extractArxivId(input || "");
    if (!id) return NextResponse.json({ error: "Paste an arXiv URL (e.g. https://arxiv.org/abs/1706.03762) or bare id (1706.03762)." }, { status: 400 });

    const cached = await prisma.savedPaper.findUnique({ where: { arxivId: id } });
    if (cached && !force && cached.summary) return NextResponse.json({ ok: true, cached: true, paper: cached });

    const { title, summary, authors, published } = await fetchArxivAtom(id);
    if (!summary) return NextResponse.json({ error: `arXiv returned no abstract for ${id}.` }, { status: 404 });

    const raw = await geminiText(`Title: ${title}\nAuthors: ${authors}\nPublished: ${published}\n\nAbstract:\n${summary}`, SUMMARY_SYSTEM, { jsonMode: true, maxTokens: 2048 });
    let parsed: any = {};
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    } catch {}
    const summaryJson = JSON.stringify(parsed || {});

    const saved = await prisma.savedPaper.upsert({
      where: { arxivId: id },
      create: { arxivId: id, title, authors, abstract: summary, summary: summaryJson },
      update: {                 title, authors, abstract: summary, summary: summaryJson },
    });
    return NextResponse.json({ ok: true, cached: false, paper: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const papers = await prisma.savedPaper.findMany({ orderBy: { savedAt: "desc" }, take: 50 });
  return NextResponse.json({ papers });
}
