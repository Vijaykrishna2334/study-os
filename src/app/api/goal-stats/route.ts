import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function todayStr() { return new Date().toISOString().slice(0, 10); }

// GET — today's log + overall goal stats
export async function GET() {
  try {
    const today = todayStr();
    const TARGET_DATE = new Date("2026-07-23T00:00:00+05:30");
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((TARGET_DATE.getTime() - now.getTime()) / 86400000));

    const [todayLog, allLogs, totalApps, totalGigs] = await Promise.all([
      prisma.dailyLog.findUnique({ where: { date: today } }),
      prisma.dailyLog.findMany(),
      prisma.application.count(),
      prisma.freelanceGig.count(),
    ]);

    const totalJobsApplied  = allLogs.reduce((s, l) => s + l.jobsApplied, 0);
    const totalLinkedinPosts = allLogs.reduce((s, l) => s + l.linkedinPosts, 0);
    const totalFreelance    = allLogs.reduce((s, l) => s + l.freelanceProposals, 0);
    const earnedINR = (await prisma.freelanceGig.findMany({ where: { status: "completed" } }))
      .reduce((s, g) => s + g.amountINR, 0);

    return NextResponse.json({
      daysLeft,
      targetDate: "2026-07-23",
      today: todayLog ?? { date: today, jobsApplied: 0, linkedinPosts: 0, freelanceProposals: 0, topicsStudied: 0 },
      totals: { jobsApplied: totalJobsApplied, linkedinPosts: totalLinkedinPosts, freelanceProposals: totalFreelance, earnedINR, totalApps, totalGigs },
      // Daily targets
      targets: { jobsApplied: 5, linkedinPosts: 1, freelanceProposals: 1, topicsStudied: 4 },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — increment a daily counter
export async function POST(req: NextRequest) {
  try {
    const { field, value = 1 } = await req.json();
    const today = todayStr();
    const allowed = ["jobsApplied","linkedinPosts","freelanceProposals","topicsStudied"];
    if (!allowed.includes(field)) return NextResponse.json({ error: "Invalid field" }, { status: 400 });

    const log = await prisma.dailyLog.upsert({
      where: { date: today },
      create: { date: today, [field]: value },
      update: { [field]: { increment: value } },
    });
    return NextResponse.json({ ok: true, log });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
