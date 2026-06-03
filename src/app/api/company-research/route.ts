import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";

const SYSTEM = `You are a senior AI/ML candidate's research assistant. Given a company name, produce STRICT JSON about the company tailored to interview prep. Be accurate; if unsure about a fact, omit it rather than invent.

{
  "overview": "1-2 paragraph honest company description with size, focus, location",
  "products": ["3-6 flagship products or business lines"],
  "leadership": ["3-5 names with titles (CEO, CTO, key AI leaders) — only if you're confident"],
  "recentNews": "2-3 sentence summary of recent (2024-2026) news / pivots / launches",
  "interviewProcess": "What the interview loop usually looks like at this company (rounds, format, length)",
  "commonQuestions": ["6-10 specific questions actually asked in their interviews (cite type: behavioural / coding / system design / ML depth)"],
  "cultureNotes": "Honest culture observations from public sources (Glassdoor patterns, employee posts) — 3-5 sentences",
  "techStack": "Engineering stack — languages, frameworks, infra they're known to use"
}
No preamble. No markdown fence. JSON only.`;

function slugify(name: string): string { return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const slug = u.searchParams.get("slug");
  if (slug) {
    const cr = await prisma.companyResearch.findUnique({ where: { slug } });
    return NextResponse.json({ research: cr });
  }
  const list = await prisma.companyResearch.findMany({ orderBy: { generatedAt: "desc" }, take: 50 });
  return NextResponse.json({ list });
}

export async function POST(req: NextRequest) {
  try {
    const { name, force } = await req.json();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const slug = slugify(name);
    if (!force) {
      const cached = await prisma.companyResearch.findUnique({ where: { slug } });
      if (cached && cached.overview) return NextResponse.json({ ok: true, cached: true, research: cached });
    }
    const raw = await geminiText(`Company: ${name}. Produce the JSON.`, SYSTEM, { jsonMode: true, maxTokens: 4096 });
    let parsed: any = {};
    try { const m = raw.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); } catch {}

    const saved = await prisma.companyResearch.upsert({
      where: { slug },
      create: {
        slug, name,
        overview: parsed.overview || "",
        productsJSON: JSON.stringify(parsed.products || []),
        leadershipJSON: JSON.stringify(parsed.leadership || []),
        recentNews: parsed.recentNews || "",
        interviewProcess: parsed.interviewProcess || "",
        commonQuestions: JSON.stringify(parsed.commonQuestions || []),
        cultureNotes: parsed.cultureNotes || "",
        techStack: parsed.techStack || "",
      },
      update: {
        name,
        overview: parsed.overview || "",
        productsJSON: JSON.stringify(parsed.products || []),
        leadershipJSON: JSON.stringify(parsed.leadership || []),
        recentNews: parsed.recentNews || "",
        interviewProcess: parsed.interviewProcess || "",
        commonQuestions: JSON.stringify(parsed.commonQuestions || []),
        cultureNotes: parsed.cultureNotes || "",
        techStack: parsed.techStack || "",
        generatedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, cached: false, research: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
