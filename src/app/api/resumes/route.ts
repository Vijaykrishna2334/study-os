import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_HEADER = JSON.stringify({
  name: "Pedhapati Vijay Krishna",
  email: "vijaykrishna2334@gmail.com",
  phone: "+91 9182583307",
  location: "East Godavari, AP",
  linkedin: "linkedin.com/in/vijaykrishna",
  github: "github.com/vijaykrishna",
});
const DEFAULT_SUMMARY = "AI/ML Engineer who transitioned from 5 years of infrastructure into full-stack Machine Learning and Deep Learning — building LLM applications, RAG pipelines, and multi-modal AI systems with Python, LangChain, and Gemini API.";

export async function GET() {
  let resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" } });
  if (!resumes.length) {
    await prisma.resume.create({
      data: {
        name: "Default", targetRole: "AI/ML Engineer",
        headerJSON: DEFAULT_HEADER, summary: DEFAULT_SUMMARY,
      },
    });
    resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" } });
  }
  return NextResponse.json({ resumes });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await prisma.resume.create({
      data: {
        name: body.name || "New Resume",
        targetRole: body.targetRole || "",
        headerJSON: body.headerJSON || DEFAULT_HEADER,
        summary: body.summary || DEFAULT_SUMMARY,
        bulletsJSON: body.bulletsJSON || "[]",
        experienceJSON: body.experienceJSON || "[]",
        skillsJSON: body.skillsJSON || "[]",
        educationJSON: body.educationJSON || "[]",
        projectsJSON: body.projectsJSON || "[]",
      },
    });
    return NextResponse.json({ ok: true, resume: r });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const r = await prisma.resume.update({ where: { id }, data: patch });
    return NextResponse.json({ ok: true, resume: r });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
