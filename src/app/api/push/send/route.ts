// Fan-out: send a push to every subscribed device. Can be called manually OR by /api/push/tick (cron-like).
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureConfigured, webpush } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    ensureConfigured();
    const body = await req.json().catch(() => ({}));

    // Build payload based on current Today queue
    const tierAtodo = await prisma.topic.count({ where: { tier: "A", confidence: 0 } });
    const inFlight  = await prisma.topic.count({ where: { confidence: { gt: 0, lt: 4 } } });
    const settings  = await prisma.userSettings.findUnique({ where: { id: "singleton" } });

    const payload = {
      title: body.title || "Study OS — Daily reminder",
      body:  body.body  || (settings?.notifyMessage || `${tierAtodo} Tier-A topics waiting · ${inFlight} in flight. Open Today.`),
      url:   body.url   || "/today",
    };

    const subs = await prisma.pushSubscription.findMany();
    if (!subs.length) return NextResponse.json({ ok: true, sent: 0, note: "no subscribers" });

    const results = await Promise.allSettled(subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
        return { endpoint: s.endpoint, ok: true };
      } catch (e: any) {
        // 410/404 = stale subscription, delete
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } });
          return { endpoint: s.endpoint, ok: false, deleted: true };
        }
        return { endpoint: s.endpoint, ok: false, error: e.message };
      }
    }));

    const sent = results.filter((r) => r.status === "fulfilled" && (r as any).value.ok).length;
    return NextResponse.json({ ok: true, sent, total: subs.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
