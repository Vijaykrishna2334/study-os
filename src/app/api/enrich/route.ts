import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEnrichment } from "@/lib/enrichment";

export async function POST(req: NextRequest) {
  try {
    const { topicId, force } = await req.json();
    const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { enrichment: true } });
    if (!topic) return NextResponse.json({ error: "topic not found" }, { status: 404 });

    if (topic.enrichment && topic.enrichment.generatedAt && !force) {
      return NextResponse.json({ ok: true, cached: true, enrichment: topic.enrichment });
    }

    const all = await prisma.topic.findMany({ select: { code: true } });
    const bundle = await generateEnrichment(
      { code: topic.code, title: topic.title, phase: topic.phase, filePath: topic.filePath },
      all.map((a) => a.code),
    );

    const saved = await prisma.topicEnrichment.upsert({
      where: { topicId: topic.id },
      create: {
        topicId: topic.id,
        prereqCodes:  JSON.stringify(bundle.prereqCodes),
        followCodes:  JSON.stringify(bundle.followCodes),
        quiz:         JSON.stringify(bundle.quiz),
        problemSet:   JSON.stringify(bundle.problemSet),
        projectBrief: bundle.projectBrief,
        videoQuery:   bundle.videoQuery,
        mindMap:      bundle.mindMap,
        cheatSheet:   bundle.cheatSheet,
        generatedAt:  new Date(),
        model:        process.env.VERTEX_GEMINI_MODEL || "gemini-2.5-flash",
      },
      update: {
        prereqCodes:  JSON.stringify(bundle.prereqCodes),
        followCodes:  JSON.stringify(bundle.followCodes),
        quiz:         JSON.stringify(bundle.quiz),
        problemSet:   JSON.stringify(bundle.problemSet),
        projectBrief: bundle.projectBrief,
        videoQuery:   bundle.videoQuery,
        mindMap:      bundle.mindMap,
        cheatSheet:   bundle.cheatSheet,
        generatedAt:  new Date(),
        model:        process.env.VERTEX_GEMINI_MODEL || "gemini-2.5-flash",
      },
    });

    return NextResponse.json({ ok: true, cached: false, enrichment: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
