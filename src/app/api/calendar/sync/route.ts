// Pushes the next 14 days of study blocks to the user's Google Calendar.
// Idempotent: tracks event IDs in CalendarEvent table; updates existing events on re-sync.
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { loadAuthorisedClient } from "@/lib/google-oauth";

export async function POST() {
  try {
    const auth = await loadAuthorisedClient();
    if (!auth) return NextResponse.json({ error: "Google not connected. Visit /settings." }, { status: 400 });

    const calendar = google.calendar({ version: "v3", auth: auth.client });
    const calendarId = auth.account.calendarId || "primary";
    const settings = await prisma.userSettings.findUnique({ where: { id: "singleton" } });

    const studyStart = settings?.studyStartHour ?? 9;
    const studyHours = settings?.studyDurationHours ?? 3;
    const dsaStart   = settings?.dsaStartHour ?? 14;
    const behStart   = settings?.behavioralStartHour ?? 19;
    const tz         = settings?.timezone || "Asia/Kolkata";

    const queue = await prisma.topic.findMany({
      where: { OR: [{ tier: "A", confidence: 0 }, { confidence: { gt: 0, lt: 4 } }] },
      orderBy: [{ tier: "asc" }, { phase: "asc" }, { order: "asc" }],
      take: 28,
    });
    if (!queue.length) return NextResponse.json({ error: "Nothing in queue to schedule" });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    let qi = 0;
    const results: any[] = [];

    for (let d = 0; d < 14; d++) {
      const day = new Date(today.getTime() + d * 86400000);
      const dateStr = day.toISOString().slice(0, 10);
      const t1 = queue[qi++ % queue.length];
      const t2 = queue[qi++ % queue.length];

      const slots = [
        { kind: "study", hour: studyStart, durationHours: studyHours,
          title: `📘 Deep study · ${t1.code} ${t1.title}`,
          description: `Tier ${t1.tier} · Phase ${t1.phase}\n\nGoal: read → re-derive → build artifact → quiz.\n\nOpen at: http://localhost:3000/topics/${t1.id}`,
          topicCode: t1.code },
        { kind: "dsa", hour: dsaStart, durationHours: 1,
          title: `💻 DSA · pattern of the day`,
          description: "Pick one pattern (two-pointer, sliding window, BFS/DFS, DP). 3 problems.",
          topicCode: "" },
        { kind: "behavioral", hour: behStart, durationHours: 0.5,
          title: `🎤 Behavioral · STAR card`,
          description: `Topic to weave in: ${t2.code} ${t2.title}.\nUse: situation → task → action → result.`,
          topicCode: t2.code },
      ];

      for (const s of slots) {
        const startMs = day.getTime() + s.hour * 3600 * 1000;
        const endMs = startMs + s.durationHours * 3600 * 1000;
        const startISO = new Date(startMs).toISOString();
        const endISO   = new Date(endMs).toISOString();

        // Look up an existing event for this day+kind
        const existing = await prisma.calendarEvent.findFirst({
          where: {
            kind: s.kind,
            startsAt: { gte: day, lt: new Date(day.getTime() + 86400000) },
          },
        });

        const eventBody = {
          summary: s.title,
          description: s.description,
          start: { dateTime: startISO, timeZone: tz },
          end:   { dateTime: endISO,   timeZone: tz },
          reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 10 }] },
        };

        if (existing) {
          const upd = await calendar.events.update({ calendarId, eventId: existing.externalId, requestBody: eventBody });
          await prisma.calendarEvent.update({
            where: { id: existing.id },
            data: { title: s.title, topicCode: s.topicCode, startsAt: new Date(startISO), endsAt: new Date(endISO) },
          });
          results.push({ date: dateStr, kind: s.kind, action: "updated", id: upd.data.id });
        } else {
          const ins = await calendar.events.insert({ calendarId, requestBody: eventBody });
          await prisma.calendarEvent.create({
            data: {
              externalId: ins.data.id || "",
              title: s.title, kind: s.kind, topicCode: s.topicCode,
              startsAt: new Date(startISO), endsAt: new Date(endISO),
            },
          });
          results.push({ date: dateStr, kind: s.kind, action: "created", id: ins.data.id });
        }
      }
    }

    await prisma.userSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", calendarSyncEnabled: true },
      update: { calendarSyncEnabled: true },
    });

    return NextResponse.json({ ok: true, total: results.length, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE() {
  // Disconnect — revokes token + deletes account row
  try {
    const auth = await loadAuthorisedClient();
    if (auth) {
      try { await auth.client.revokeCredentials(); } catch {}
    }
    await prisma.connectedAccount.deleteMany({ where: { provider: "google" } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
