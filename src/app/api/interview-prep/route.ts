import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";

const SYSTEM = `You are a senior AI/ML interview coach helping Vijay prepare for an upcoming interview. Given the company, role, round type, and days remaining, produce a focused day-by-day prep plan in STRICT JSON:

{
  "plan": "markdown plan with sections for each day (Day 1, Day 2, ... Day N before the interview, then 'Interview Day morning'). Each day: 3-5 specific actions. Use the candidate's mastered topics (Tier-A confidence >= 4) where possible; fill gaps from the weaker topics. Reference 'P-codes' the candidate has in their app, e.g. P3_1_4 for Transformers.",
  "tasks": [
    {"day": 1, "task": "Re-derive attention math (P3_1_4) on paper, time-boxed 20 min", "category": "drill"},
    {"day": 1, "task": "Run /mock on P3_1_4 for 2 turns; record what tripped you up", "category": "mock"},
    {"day": 2, "task": "...", "category": "drill|mock|system|behavioral|company|rest"}
  ]
}

Rules:
- Number of days = ceil((interviewDate - today) / 1 day). Plan from Day 1 (today) to interview day.
- Last day = light review only (no new topics).
- Behavioral round: focus on STAR cards, company research, narrative. Less drill.
- System design round: ML system design templates (RAG at scale, serving, A/B testing).
- Technical round: derivations + coding (DSA Grinder problems).
- Onsite: balance all four (drill, mock, system, behavioral).
- Output ONLY the JSON, no fence.`;

export async function GET() {
  const list = await prisma.interviewPrep.findMany({ orderBy: { interviewDate: "asc" } });
  return NextResponse.json({ list });
}

export async function POST(req: NextRequest) {
  try {
    const { company, role, interviewDate, roundType, force } = await req.json();
    if (!company || !role || !interviewDate) return NextResponse.json({ error: "company, role, interviewDate required" }, { status: 400 });

    const days = Math.max(1, Math.ceil((new Date(interviewDate).getTime() - Date.now()) / 86400000));

    const mastered = await prisma.topic.findMany({
      where: { confidence: { gte: 4 } },
      select: { code: true, title: true, tier: true },
      take: 80,
    });
    const weak = await prisma.topic.findMany({
      where: { tier: { in: ["A", "B"] }, confidence: { lt: 4 } },
      select: { code: true, title: true, tier: true, confidence: true },
      orderBy: { confidence: "asc" },
      take: 30,
    });

    const prompt = `Company: ${company}
Role: ${role}
Round type: ${roundType}
Interview date: ${interviewDate}
Days until interview (inclusive): ${days}

Mastered topics (use freely as drill material):
${mastered.map((t) => `${t.code} ${t.title} [${t.tier}]`).join("\n") || "(none mastered yet)"}

Weak / not-yet-mastered Tier-A/B topics (prioritise closing these):
${weak.map((t) => `${t.code} ${t.title} [${t.tier}] (conf ${t.confidence})`).join("\n")}

Produce the JSON plan for this ${days}-day window.`;

    const raw = await geminiText(prompt, SYSTEM, { jsonMode: true, maxTokens: 8192 });
    let parsed: any = {};
    try { parsed = JSON.parse(raw.trim()); } catch {
      try { const m = raw.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); } catch {}
    }

    const saved = await prisma.interviewPrep.create({
      data: {
        company, role,
        interviewDate: new Date(interviewDate),
        roundType: roundType || "technical",
        plan: parsed.plan || "",
        tasksJSON: JSON.stringify(parsed.tasks || []),
      },
    });
    return NextResponse.json({ ok: true, prep: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const prep = await prisma.interviewPrep.update({ where: { id }, data: patch });
    return NextResponse.json({ ok: true, prep });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.interviewPrep.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
