import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/analytics — aggregated study stats (no API calls)
export async function GET() {
  try {
    const [topics, studyDays, settings] = await Promise.all([
      prisma.topic.findMany({
        select: {
          id: true, phase: true, tier: true, confidence: true,
          read: true, artifact: true, quizPassed: true,
          xpEarned: true, studyMinutes: true, lastTouched: true,
          updatedAt: true,
        },
      }),
      prisma.studyDay.findMany({ orderBy: { date: "asc" } }),
      prisma.userSettings.findUnique({ where: { id: "singleton" } }),
    ]);

    const totalXP = settings?.totalXP ?? 0;
    const level = Math.floor(totalXP / 500) + 1;

    // Mastered per phase
    const byPhase: Record<number, { total: number; mastered: number }> = {};
    for (const t of topics) {
      if (!byPhase[t.phase]) byPhase[t.phase] = { total: 0, mastered: 0 };
      byPhase[t.phase].total++;
      if (t.confidence >= 4) byPhase[t.phase].mastered++;
    }

    // Confidence distribution
    const confDist = [0,1,2,3,4,5].map(c => ({
      label: c === 0 ? "Not started" : c === 5 ? "Expert" : `Level ${c}`,
      count: topics.filter(t => t.confidence === c).length,
    }));

    // Last 30 days study activity
    const last30 = studyDays.slice(-30).map(d => ({
      date: d.date,
      minutes: d.minutes,
      topics: d.topicsTouched,
      quizzes: d.quizzes,
    }));

    // Total stats
    const totalMinutes = topics.reduce((s, t) => s + t.studyMinutes, 0);
    const mastered = topics.filter(t => t.confidence >= 4).length;
    const quizPassed = topics.filter(t => t.quizPassed).length;
    const artifacts = topics.filter(t => t.artifact).length;

    return NextResponse.json({
      totalXP, level,
      totalTopics: topics.length,
      mastered, quizPassed, artifacts,
      totalMinutes,
      byPhase,
      confDist,
      last30,
      streakDays: studyDays.filter(d => d.topicsTouched > 0).length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
