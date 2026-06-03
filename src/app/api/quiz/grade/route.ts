import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logStudyDay } from "@/lib/study-day";

export async function POST(req: NextRequest) {
  try {
    const { topicId, answers } = await req.json() as { topicId: string; answers: number[] };
    const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { enrichment: true } });
    if (!topic || !topic.enrichment) return NextResponse.json({ error: "no quiz available" }, { status: 404 });

    const quiz: { q: string; options: string[]; correctIndex: number; explain: string }[] = JSON.parse(topic.enrichment.quiz || "[]");
    if (!quiz.length) return NextResponse.json({ error: "empty quiz" }, { status: 400 });

    let correct = 0;
    const review = quiz.map((q, i) => {
      const picked = answers[i];
      const ok = picked === q.correctIndex;
      if (ok) correct++;
      return { q: q.q, picked, correctIndex: q.correctIndex, correct: ok, explain: q.explain };
    });
    const score = Math.round((correct / quiz.length) * 100);
    const passed = score >= 80;

    const data: any = { quizBestScore: Math.max(topic.quizBestScore, score), lastTouched: new Date() };
    if (passed) data.quizPassed = true;
    await prisma.topic.update({ where: { id: topic.id }, data });
    await logStudyDay({ quizzes: 1 });

    return NextResponse.json({ ok: true, score, passed, review });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
