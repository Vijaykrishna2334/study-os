import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const days = await prisma.studyDay.findMany({ orderBy: { date: "desc" }, take: 365 });
  // Compute current streak (consecutive days ending today or yesterday).
  const set = new Set(days.map((d) => d.date));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (set.has(key)) streak++;
    else if (i > 0) break;
    else continue;
  }
  return NextResponse.json({ streak, days });
}
