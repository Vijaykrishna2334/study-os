import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logStudyDay } from "@/lib/study-day";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const before = await prisma.topic.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "topic not found" }, { status: 404 });

    const allowed = ["read", "rederived", "artifact", "taughtBack", "mocked", "confidence", "notes"] as const;
    const data: Record<string, any> = { lastTouched: new Date() };
    for (const k of allowed) if (k in patch) data[k] = patch[k];

    const updated = await prisma.topic.update({ where: { id }, data });

    const bump: any = { topicsTouched: 1, minutes: 5 };
    if (!before.read     && updated.read)     bump.reads = 1;
    if (!before.artifact && updated.artifact) bump.artifacts = 1;
    if (!before.mocked   && updated.mocked)   bump.mocks = 1;
    await logStudyDay(bump);

    return NextResponse.json({ ok: true, topic: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
