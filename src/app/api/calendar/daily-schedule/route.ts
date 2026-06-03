import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const CALENDAR_ID = "vijaykrishna2334@gmail.com";
const KEY_FILE    = process.env.GOOGLE_APPLICATION_CREDENTIALS!;
const TZ          = "Asia/Kolkata";

async function getCalendar() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

// Build datetime string for a given date + hour + minute
function dt(dateStr: string, hour: number, minute = 0) {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${dateStr}T${h}:${m}:00+05:30`;
}

interface DayBlock {
  summary: string;
  description: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  colorId: string; // Google calendar color
}

// Fixed daily blocks (non-study)
const FIXED_BLOCKS: DayBlock[] = [
  {
    summary: "📧 NextMile — Emails + Nimbus Check",
    description: "✅ Check all new emails\n✅ Check Nimbus service status\n✅ Note any pending queries\n✅ Reply urgent messages",
    startHour: 9, startMin: 0, endHour: 9, endMin: 30,
    colorId: "5", // banana yellow
  },
  {
    summary: "📜 NextMile — Certificate Prep + Queries",
    description: "✅ Certificate preparation work\n✅ Solve pending queries\n✅ Document progress\n✅ Update task tracker",
    startHour: 9, startMin: 30, endHour: 10, endMin: 30,
    colorId: "5", // banana yellow
  },
  {
    summary: "💼 LinkedIn Post + Job Search",
    description: "✅ Post something on LinkedIn (tip, learning, project update)\n✅ Search new job openings (ML Engineer, AI Engineer, Data Scientist)\n✅ Save interesting JDs",
    startHour: 12, startMin: 30, endHour: 13, endMin: 0,
    colorId: "9", // blueberry
  },
  {
    summary: "🔍 Apply to Jobs",
    description: "✅ Apply to 3-5 jobs from saved JDs\n✅ Tailor resume if needed\n✅ Track applications in app",
    startHour: 13, startMin: 0, endHour: 14, endMin: 0,
    colorId: "9", // blueberry
  },
  {
    summary: "🍽️ Lunch Break",
    description: "Rest and recharge. Step away from screen.",
    startHour: 14, startMin: 0, endHour: 15, endMin: 0,
    colorId: "8", // graphite
  },
  {
    summary: "☕ Snack Break",
    description: "Short break. Stretch, hydrate.",
    startHour: 17, startMin: 0, endHour: 17, endMin: 30,
    colorId: "8", // graphite
  },
  {
    summary: "🔍 Job Applications + LinkedIn Engage",
    description: "✅ Apply to more jobs\n✅ Reply to LinkedIn comments\n✅ Connect with recruiters\n✅ Follow target companies",
    startHour: 17, startMin: 30, endHour: 19, endMin: 30,
    colorId: "9", // blueberry
  },
  {
    summary: "📧 NextMile Evening — Emails + Nimbus Check",
    description: "✅ Check evening emails\n✅ Nimbus service final check\n✅ Resolve end-of-day queries\n✅ Plan tomorrow's tasks",
    startHour: 20, startMin: 0, endHour: 21, endMin: 0,
    colorId: "5", // banana yellow
  },
  {
    summary: "🍽️ Dinner",
    description: "Dinner and wind down. No screens ideally.",
    startHour: 22, startMin: 0, endHour: 23, endMin: 0,
    colorId: "8", // graphite
  },
];

// POST /api/calendar/daily-schedule — push full daily schedule
export async function POST(req: NextRequest) {
  try {
    const { days = 30, startDate } = await req.json();

    const cal = await getCalendar();

    // Get interview plan for study topics
    const plan = await prisma.interviewPlan.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    let schedule: Record<string, string[]> = {};
    let topicMap: Record<string, any> = {};

    if (plan) {
      schedule = JSON.parse(plan.scheduleJSON);
      const allIds = [...new Set(Object.values(schedule).flat())] as string[];
      const topics = await prisma.topic.findMany({
        where: { id: { in: allIds } },
        select: { id: true, code: true, title: true, tier: true },
      });
      topicMap = Object.fromEntries(topics.map(t => [t.id, t]));
    }

    const start = new Date(startDate || new Date().toISOString().slice(0, 10) + "T00:00:00+05:30");
    start.setHours(0, 0, 0, 0);

    let created = 0;
    let errors  = 0;

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      // Skip if Sunday (optional rest day — remove this if you want 7-day schedule)
      // if (d.getDay() === 0) continue;

      // ── Fixed blocks ──────────────────────────────────────────────────────
      for (const block of FIXED_BLOCKS) {
        try {
          await cal.events.insert({
            calendarId: CALENDAR_ID,
            requestBody: {
              summary: block.summary,
              description: block.description,
              start: { dateTime: dt(dateStr, block.startHour, block.startMin), timeZone: TZ },
              end:   { dateTime: dt(dateStr, block.endHour,   block.endMin),   timeZone: TZ },
              colorId: block.colorId,
              reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 10 }] },
            },
          });
          created++;
        } catch { errors++; }
      }

      // ── Study Session 1: 10:30–12:30 ──────────────────────────────────────
      const dayTopics = (schedule[dateStr] ?? []).map((id: string) => topicMap[id]).filter(Boolean);
      const studyDesc1 = dayTopics.length > 0
        ? `Today's topics:\n${dayTopics.slice(0, Math.ceil(dayTopics.length/2)).map((t: any) => `• [${t.tier}] ${t.code} — ${t.title}\n  http://167.71.226.211/topics/${t.id}`).join("\n\n")}`
        : "Open Study OS → http://167.71.226.211/topics\nPick topics and mark your progress.";

      try {
        await cal.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: {
            summary: dayTopics.length > 0
              ? `📚 Study: ${dayTopics.slice(0, Math.ceil(dayTopics.length/2)).map((t: any) => t.code).join(", ")}`
              : "📚 Study Session 1",
            description: studyDesc1,
            start: { dateTime: dt(dateStr, 10, 30), timeZone: TZ },
            end:   { dateTime: dt(dateStr, 12, 30), timeZone: TZ },
            colorId: "7", // sage/teal
            reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 15 }] },
          },
        });
        created++;
      } catch { errors++; }

      // ── Study Session 2: 15:00–17:00 ──────────────────────────────────────
      const studyDesc2 = dayTopics.length > 0
        ? `Afternoon topics:\n${dayTopics.slice(Math.ceil(dayTopics.length/2)).map((t: any) => `• [${t.tier}] ${t.code} — ${t.title}\n  http://167.71.226.211/topics/${t.id}`).join("\n\n")}`
        : "Continue from morning session.\nhttp://167.71.226.211/topics";

      try {
        await cal.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: {
            summary: dayTopics.length > 0
              ? `📚 Study: ${dayTopics.slice(Math.ceil(dayTopics.length/2)).map((t: any) => t.code).join(", ") || "Review"}`
              : "📚 Study Session 2",
            description: studyDesc2,
            start: { dateTime: dt(dateStr, 15, 0), timeZone: TZ },
            end:   { dateTime: dt(dateStr, 17, 0), timeZone: TZ },
            colorId: "7",
            reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 15 }] },
          },
        });
        created++;
      } catch { errors++; }

      // ── Evening Study: 21:00–22:00 ─────────────────────────────────────────
      try {
        await cal.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: {
            summary: "📚 Evening Study + Review",
            description: "✅ Review today's topics\n✅ Update confidence levels in Study OS\n✅ Note any doubts\n✅ Check tomorrow's schedule\n\nhttp://167.71.226.211",
            start: { dateTime: dt(dateStr, 21, 0), timeZone: TZ },
            end:   { dateTime: dt(dateStr, 22, 0), timeZone: TZ },
            colorId: "7",
            reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 10 }] },
          },
        });
        created++;
      } catch { errors++; }
    }

    return NextResponse.json({
      ok: true,
      created,
      errors,
      days,
      message: `✅ ${created} events pushed across ${days} days in your Google Calendar!`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
