import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// XP values for each action
const XP_TABLE: Record<string, number> = {
  read:       10,
  rederived:  20,
  artifact:   50,
  taughtBack: 40,
  mocked:     60,
  quiz:       30,
  streak:     20,
};

// POST /api/xp — award XP for an action
export async function POST(req: NextRequest) {
  try {
    const { topicId, action } = await req.json();
    const xp = XP_TABLE[action] ?? 10;

    // Award XP to the topic
    if (topicId) {
      await prisma.topic.update({
        where: { id: topicId },
        data: { xpEarned: { increment: xp } },
      });
    }

    // Add to total XP in settings
    const settings = await prisma.userSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", totalXP: xp },
      update: { totalXP: { increment: xp } },
    });

    const level = Math.floor(settings.totalXP / 500) + 1;
    const xpInLevel = settings.totalXP % 500;

    return NextResponse.json({ ok: true, totalXP: settings.totalXP, level, xpInLevel, gained: xp });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/xp — get current XP + level
export async function GET() {
  try {
    const settings = await prisma.userSettings.findUnique({ where: { id: "singleton" } });
    const totalXP = settings?.totalXP ?? 0;
    const level = Math.floor(totalXP / 500) + 1;
    const xpInLevel = totalXP % 500;
    return NextResponse.json({ totalXP, level, xpInLevel, xpToNext: 500 - xpInLevel });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
