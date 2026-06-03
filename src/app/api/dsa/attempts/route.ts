import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logStudyDay } from "@/lib/study-day";

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  const attempt = await prisma.dSAAttempt.findFirst({ where: { problemSlug: slug }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ attempt });
}

export async function POST(req: NextRequest) {
  try {
    const { slug, passed, passedTests, totalTests, code, ms, language } = await req.json();
    const saved = await prisma.dSAAttempt.create({
      data: { problemSlug: slug, passed: !!passed, passedTests: passedTests | 0, totalTests: totalTests | 0, code: code || "", ms: ms | 0, language: language || "python" },
    });
    await logStudyDay({ minutes: Math.max(1, Math.round((ms || 0) / 60000)), quizzes: passed ? 1 : 0 });
    return NextResponse.json({ ok: true, attempt: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
