import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.userSettings.upsert({
    where: { id: "singleton" }, create: { id: "singleton" }, update: {},
  });
  const google = await prisma.connectedAccount.findUnique({ where: { provider: "google" } });
  const subCount = await prisma.pushSubscription.count();
  return NextResponse.json({
    settings,
    google: google ? { connected: true, email: google.email, calendarId: google.calendarId } : { connected: false },
    pushSubscribers: subCount,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const patch = await req.json();
    const allowed = [
      "notifyEnabled","notifyHour","notifyMinute","notifyMessage",
      "calendarSyncEnabled","studyStartHour","studyDurationHours","dsaStartHour","behavioralStartHour","timezone",
    ] as const;
    const data: any = {};
    for (const k of allowed) if (k in patch) data[k] = patch[k];
    const settings = await prisma.userSettings.upsert({
      where: { id: "singleton" }, create: { id: "singleton", ...data }, update: data,
    });
    return NextResponse.json({ ok: true, settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
