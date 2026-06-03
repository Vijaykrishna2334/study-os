// "Cron-lite": call this endpoint frequently (e.g. from the app's poll loop or an external scheduler).
// It checks whether today's notification has been sent; if not and current time >= scheduled time, sends + records.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function lastNotifiedDay(): Promise<string | null> {
  const meta = await prisma.userSettings.findUnique({ where: { id: "singleton" } });
  if (!meta) return null;
  // Encode last notification day inside notifyMessage's tail "##DAY:YYYY-MM-DD##" marker
  const m = meta.notifyMessage.match(/##DAY:(\d{4}-\d{2}-\d{2})##$/);
  return m ? m[1] : null;
}
async function markNotifiedToday() {
  const today = dayKey();
  const s = await prisma.userSettings.findUnique({ where: { id: "singleton" } });
  const baseMsg = (s?.notifyMessage || "Daily study queue is ready. Open Today.").replace(/\s*##DAY:[^#]+##$/, "");
  await prisma.userSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", notifyMessage: `${baseMsg} ##DAY:${today}##` },
    update: { notifyMessage: `${baseMsg} ##DAY:${today}##` },
  });
}

export async function POST() {
  const settings = await prisma.userSettings.findUnique({ where: { id: "singleton" } });
  if (!settings || !settings.notifyEnabled) return NextResponse.json({ skipped: "notifications disabled" });

  const now = new Date();
  const todayKey = dayKey(now);
  const last = await lastNotifiedDay();
  if (last === todayKey) return NextResponse.json({ skipped: "already sent today" });

  const scheduledMins = settings.notifyHour * 60 + settings.notifyMinute;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  if (nowMins < scheduledMins) return NextResponse.json({ skipped: "before scheduled time", scheduledMins, nowMins });

  // Fire via /api/push/send
  const base = process.env.APP_ORIGIN || "http://localhost:3000";
  const res = await fetch(`${base}/api/push/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  const data = await res.json();
  if (data.ok) await markNotifiedToday();
  return NextResponse.json({ ok: true, send: data });
}
