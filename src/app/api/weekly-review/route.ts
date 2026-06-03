import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";

function weekStartKey(d = new Date()): string {
  const day = d.getDay(); // 0..6, Sun..Sat
  const diff = day === 0 ? 6 : day - 1; // Monday=0 offset
  const monday = new Date(d.getTime() - diff * 86400000);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

const SYSTEM = `You are a senior AI/ML career mentor writing a Sunday review for Vijay. Tone: terse, direct, no praise. Output sections in this exact order in markdown:

## This week
3-5 bullets on what was actually completed. Use numbers.

## Concerns
2-3 bullets on what stagnated or shows shaky retention. Be specific (cite topic codes).

## Next week — exactly what to do
Day-by-day plan Mon-Sun. Each day: 1-3 topic codes + 1 DSA pattern + 1 sys-design + behavioral angle. Keep total under 250 words.

## One contrarian recommendation
A single bold suggestion (skip something, switch order, take a rest, pivot focus). Justify briefly.`;

export async function POST(req: NextRequest) {
  try {
    const { force } = await req.json().catch(() => ({}));
    const weekStart = weekStartKey();

    const existing = await prisma.weeklyReview.findUnique({ where: { weekStart } });
    if (existing && !force) return NextResponse.json({ ok: true, cached: true, review: existing });

    // Gather last 7 days of activity
    const sevenAgo = new Date(Date.now() - 7 * 86400000);
    const sevenAgoKey = `${sevenAgo.getFullYear()}-${String(sevenAgo.getMonth() + 1).padStart(2, "0")}-${String(sevenAgo.getDate()).padStart(2, "0")}`;
    const days = await prisma.studyDay.findMany({ where: { date: { gte: sevenAgoKey } }, orderBy: { date: "asc" } });
    const minutes = days.reduce((s, d) => s + d.minutes, 0);
    const reads   = days.reduce((s, d) => s + d.reads, 0);
    const quizzes = days.reduce((s, d) => s + d.quizzes, 0);
    const artifacts = days.reduce((s, d) => s + d.artifacts, 0);
    const mocks = days.reduce((s, d) => s + d.mocks, 0);

    const masteredTotal = await prisma.topic.count({ where: { confidence: { gte: 4 } } });
    const recentMastered = await prisma.topic.findMany({
      where: { confidence: { gte: 4 }, lastTouched: { gte: sevenAgo } },
      select: { code: true, title: true, phase: true, tier: true },
    });
    const inFlight = await prisma.topic.findMany({
      where: { confidence: { gt: 0, lt: 4 }, lastTouched: { gte: sevenAgo } },
      select: { code: true, title: true, tier: true, confidence: true },
      orderBy: { lastTouched: "desc" },
      take: 20,
    });
    const stale = await prisma.topic.findMany({
      where: { confidence: { gte: 4 }, lastTouched: { lt: new Date(Date.now() - 14 * 86400000) } },
      select: { code: true, title: true },
      take: 10,
    });

    const prompt = `## Activity (last 7 days)
- Minutes studied: ${minutes}
- Notes read: ${reads}
- Quizzes attempted: ${quizzes}
- Artifacts shipped: ${artifacts}
- Mocks completed: ${mocks}
- Topics mastered (total): ${masteredTotal}

## Topics mastered THIS week
${recentMastered.map((t) => `${t.code} ${t.title} [${t.tier}]`).join("\n") || "(none)"}

## In-flight (confidence 1-3, recent)
${inFlight.map((t) => `${t.code} ${t.title} (${t.confidence}/5) [${t.tier}]`).join("\n") || "(none)"}

## Stale mastery (>14 days no touch, may decay)
${stale.map((t) => `${t.code} ${t.title}`).join("\n") || "(none)"}

Now write the review.`;

    const markdown = await geminiText(prompt, SYSTEM);

    const saved = await prisma.weeklyReview.upsert({
      where: { weekStart },
      create: {
        weekStart, summary: markdown, recommendations: "",
        hoursStudied: Math.round(minutes / 60), topicsMastered: masteredTotal,
      },
      update: {
        summary: markdown, hoursStudied: Math.round(minutes / 60), topicsMastered: masteredTotal,
      },
    });
    return NextResponse.json({ ok: true, cached: false, review: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const reviews = await prisma.weeklyReview.findMany({ orderBy: { weekStart: "desc" }, take: 12 });
  return NextResponse.json({ reviews });
}
