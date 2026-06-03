// Generates an .ics calendar feed of upcoming study blocks for the next 14 days.
// Subscribe in Google/Outlook/Apple Calendar via: webcal://<host>/api/calendar/ics
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function fmt(dt: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}${p(dt.getUTCMonth() + 1)}${p(dt.getUTCDate())}T${p(dt.getUTCHours())}${p(dt.getUTCMinutes())}00Z`;
}

function eventBlock(uid: string, start: Date, end: Date, summary: string, description: string): string {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@study-os`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${summary.replace(/\n/g, " ")}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
  ].join("\r\n");
}

export async function GET() {
  // Pick the next 14 days × 3 blocks (deep study 09:00-12:00, DSA 14:00-15:00, behavioral 19:30-20:00)
  const queue = await prisma.topic.findMany({
    where: { OR: [{ tier: "A", confidence: 0 }, { confidence: { gt: 0, lt: 4 } }] },
    orderBy: [{ tier: "asc" }, { phase: "asc" }, { order: "asc" }],
    take: 28,
  });
  let qi = 0;
  const events: string[] = [];
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const day = new Date(today.getTime() + i * 86400000);
    const t1 = queue[qi++ % queue.length];
    const t2 = queue[qi++ % queue.length];

    const deep = new Date(day);    deep.setUTCHours(3, 30, 0, 0);    // 09:00 IST = 03:30 UTC
    const deepEnd = new Date(deep.getTime() + 3 * 3600 * 1000);
    const dsa  = new Date(day);    dsa.setUTCHours(8, 30, 0, 0);     // 14:00 IST
    const dsaEnd = new Date(dsa.getTime() + 1 * 3600 * 1000);
    const beh  = new Date(day);    beh.setUTCHours(14, 0, 0, 0);     // 19:30 IST
    const behEnd = new Date(beh.getTime() + 30 * 60 * 1000);

    events.push(eventBlock(
      `deep-${day.toISOString().slice(0,10)}`, deep, deepEnd,
      `Deep study · ${t1?.code || ""} ${t1?.title || ""}`,
      `Tier ${t1?.tier} · Phase ${t1?.phase}\\nGoal: read → re-derive → build artifact → quiz.`,
    ));
    events.push(eventBlock(
      `dsa-${day.toISOString().slice(0,10)}`, dsa, dsaEnd,
      "DSA · pattern of the day",
      "Pick one pattern (two-pointer, sliding window, BFS, DP). 3 problems.",
    ));
    events.push(eventBlock(
      `beh-${day.toISOString().slice(0,10)}`, beh, behEnd,
      `Behavioral · STAR card`,
      `Topic to weave in: ${t2?.code || ""} ${t2?.title || ""}.`,
    ));
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Study OS//Vijay//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Study OS — AI/ML Mastery",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="study-os.ics"',
      "Cache-Control": "no-store",
    },
  });
}
