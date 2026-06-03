import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const apps = await prisma.application.findMany({ orderBy: { appliedAt: "desc" } });
  // Funnel metrics
  const counts = { applied: 0, screen: 0, technical: 0, onsite: 0, offer: 0, rejected: 0, withdrew: 0 } as Record<string, number>;
  for (const a of apps) counts[a.status] = (counts[a.status] || 0) + 1;
  return NextResponse.json({ apps, counts, total: apps.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, role, source, jdUrl, jdText, salaryRange, location, remote, notes, fitScore, status } = body;
    if (!company || !role) return NextResponse.json({ error: "company and role required" }, { status: 400 });
    const app = await prisma.application.create({
      data: {
        company, role,
        source: source || "manual",
        jdUrl: jdUrl || "",
        jdText: jdText || "",
        status: status || "applied",
        salaryRange: salaryRange || "",
        location: location || "",
        remote: !!remote,
        notes: notes || "",
        fitScore: fitScore | 0,
      },
    });
    return NextResponse.json({ ok: true, app });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const allowed = ["company","role","source","jdUrl","jdText","status","appliedAt","nextActionAt","nextAction","salaryRange","location","remote","notes","fitScore"] as const;
    const data: any = {};
    for (const k of allowed) if (k in patch) data[k] = patch[k];
    if (data.appliedAt) data.appliedAt = new Date(data.appliedAt);
    if (data.nextActionAt) data.nextActionAt = new Date(data.nextActionAt);
    const app = await prisma.application.update({ where: { id }, data });
    return NextResponse.json({ ok: true, app });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
