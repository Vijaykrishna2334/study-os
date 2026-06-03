import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// SM-2 spaced repetition update.
// quality: 0..5  (3+ = correct)
export async function POST(req: NextRequest) {
  try {
    const { id, quality } = await req.json();
    const card = await prisma.flashcard.findUnique({ where: { id } });
    if (!card) return NextResponse.json({ error: "not found" }, { status: 404 });

    let { easiness, interval, reps } = card;
    const q = Math.max(0, Math.min(5, quality));
    if (q < 3) { reps = 0; interval = 1; }
    else {
      reps += 1;
      if (reps === 1) interval = 1;
      else if (reps === 2) interval = 6;
      else interval = Math.round(interval * easiness);
      easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (easiness < 1.3) easiness = 1.3;
    }
    const nextDue = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

    const updated = await prisma.flashcard.update({
      where: { id },
      data: { easiness, interval, reps, nextDue },
    });
    return NextResponse.json({ ok: true, card: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
