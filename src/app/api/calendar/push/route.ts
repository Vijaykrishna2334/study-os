import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const CALENDAR_ID = "vijaykrishna2334@gmail.com"; // user's calendar
const KEY_FILE    = process.env.GOOGLE_APPLICATION_CREDENTIALS!;

async function getCalendar() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

// POST /api/calendar/push — push interview plan to Google Calendar
export async function POST(req: NextRequest) {
  try {
    const { planId, studyHour = 9 } = await req.json(); // studyHour = start hour (default 9am)

    // Fetch the plan
    const plan = await prisma.interviewPlan.findFirst({
      where: planId ? { id: planId } : { active: true },
      orderBy: { createdAt: "desc" },
    });
    if (!plan) return NextResponse.json({ error: "No active plan found" }, { status: 404 });

    const schedule: Record<string, string[]> = JSON.parse(plan.scheduleJSON);
    const topicIds = [...new Set(Object.values(schedule).flat())] as string[];
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: { id: true, code: true, title: true, tier: true },
    });
    const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));

    const cal = await getCalendar();
    const created: string[] = [];
    const errors: string[] = [];

    for (const [dateStr, ids] of Object.entries(schedule)) {
      const dayTopics = ids.map(id => topicMap[id]).filter(Boolean);
      if (dayTopics.length === 0) continue;

      const title = `📚 Study: ${dayTopics.map(t => t.code).join(", ")}`;
      const description = dayTopics
        .map(t => `• [${t.tier}] ${t.code} — ${t.title}\n  http://167.71.226.211/topics/${t.id}`)
        .join("\n\n");

      // 2 hours per session
      const start = new Date(`${dateStr}T${String(studyHour).padStart(2,"0")}:00:00+05:30`);
      const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);

      try {
        const event = await cal.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: {
            summary: title,
            description,
            start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
            end:   { dateTime: end.toISOString(),   timeZone: "Asia/Kolkata" },
            colorId: "7", // teal
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: 30 }],
            },
          },
        });

        // Save to DB
        await prisma.calendarEvent.upsert({
          where: { externalId: event.data.id! },
          create: {
            externalId: event.data.id!,
            topicCode:  dayTopics.map(t => t.code).join(","),
            kind:       "study",
            startsAt:   start,
            endsAt:     end,
            title,
          },
          update: { title, startsAt: start, endsAt: end },
        });

        created.push(dateStr);
      } catch (err: any) {
        errors.push(`${dateStr}: ${err.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      created: created.length,
      errors: errors.length,
      message: `✅ ${created.length} study events pushed to your Google Calendar!`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/calendar/push — remove all study events from calendar
export async function DELETE() {
  try {
    const events = await prisma.calendarEvent.findMany({ where: { kind: "study" } });
    const cal = await getCalendar();
    let removed = 0;

    for (const ev of events) {
      try {
        await cal.events.delete({ calendarId: CALENDAR_ID, eventId: ev.externalId });
        await prisma.calendarEvent.delete({ where: { id: ev.id } });
        removed++;
      } catch {}
    }

    return NextResponse.json({ ok: true, removed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
