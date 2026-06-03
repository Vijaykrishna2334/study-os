import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED = [
  { slug: "llm-rag",  name: "LLM/RAG Signature",      description: "QLoRA fine-tune + RAG eval report" },
  { slug: "agents",   name: "Agents Signature",        description: "LangGraph multi-agent demo" },
  { slug: "cv",       name: "Computer Vision",         description: "Floor-Plan-to-3D extended with SAM/ControlNet" },
  { slug: "mlops",    name: "MLOps Production",        description: "Docker + CI + MLflow + Langfuse stack" },
];

export async function GET() {
  let repos = await prisma.portfolioRepo.findMany({ orderBy: { createdAt: "asc" } });
  if (!repos.length) {
    for (const s of SEED) await prisma.portfolioRepo.create({ data: { ...s, url: "" } });
    repos = await prisma.portfolioRepo.findMany({ orderBy: { createdAt: "asc" } });
  }
  return NextResponse.json({ repos });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const allowed = ["name", "url", "description", "status", "readme", "stars"] as const;
    const data: Record<string, any> = { lastChecked: new Date() };
    for (const k of allowed) if (k in patch) data[k] = patch[k];
    const updated = await prisma.portfolioRepo.update({ where: { id }, data });
    return NextResponse.json({ ok: true, repo: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
