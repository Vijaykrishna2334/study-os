import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/interview-plan/[id]/day — toggle a day complete/incomplete
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { date, complete } = await req.json(); // date: "YYYY-MM-DD"

    const plan = await prisma.interviewPlan.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const completed: string[] = JSON.parse(plan.completedDays);
    const newCompleted = complete
      ? [...new Set([...completed, date])]
      : completed.filter(d => d !== date);

    const updated = await prisma.interviewPlan.update({
      where: { id },
      data: { completedDays: JSON.stringify(newCompleted) },
    });

    return NextResponse.json({ ok: true, completedDays: newCompleted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
