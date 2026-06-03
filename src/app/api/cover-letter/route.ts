import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";

const SYSTEM = `You are writing a cover letter in Vijay's voice. Tone must match the user's selection. Style: direct, specific, metric-led. No filler ("I am writing to apply for…"), no buzzwords, no generic enthusiasm. Avoid clichés ("passionate about", "self-motivated", "team player").

Structure:
- 1st paragraph: a strong hook — connect 1 specific accomplishment Vijay has to a specific need in the JD.
- 2nd paragraph: 2-3 concrete proof points (numbers from his work — interior design 92% satisfaction, 40% cost cut, sub-2s latency, 80% manual ops eliminated, 30% RTO reduction).
- 3rd paragraph: why THIS company specifically (use the JD signals).
- Closing: short, confident; ask for the conversation.

Length: 250-350 words. Plain text only. No "Dear Hiring Manager" templates — just the body.`;

export async function GET() {
  const list = await prisma.coverLetter.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ list });
}

export async function POST(req: NextRequest) {
  try {
    const { company, role, jdText, hook, tone } = await req.json();
    if (!company || !role || !jdText) return NextResponse.json({ error: "company, role, jdText required" }, { status: 400 });

    const userPrompt = `Company: ${company}
Role: ${role}
Tone: ${tone || "professional"}
Personal hook (optional, lead with this if compelling): ${hook || "(none provided)"}

Vijay's background:
- 5 years infra engineering (Reliance Jio + L&T)
- 9 months freelance AI/ML: 4 shipped products (CRM auto, document AI, architectural CV, multi-agent content)
- Current: Gen AI Intern at NextMile (Jan 2026+) — NimbusPost integration, 200+ daily orders, 80% manual entry eliminated, 30% RTO reduction
- Previous: AI/ML intern at WhatanAidea (Sep-Dec 2025) — interior design system, 500+ renders at 92% satisfaction, Gemini Pro/Flash routing cutting cost 40%
- Tech: Python, LangChain, LangGraph, Gemini API, OpenAI, FastAPI, Next.js, PyTorch, Vertex AI, ChromaDB, Pinecone
- Projects: EliteBuilders (AI judge platform), Telecom AI Assistant (RAG, sub-2s latency, 95%+ resolution), Floor Plan to 3D (Mask R-CNN), Aria (3D AI companion)

Job description:
${jdText.slice(0, 4000)}

Write the cover letter body.`;

    const body = await geminiText(userPrompt, SYSTEM);

    const saved = await prisma.coverLetter.create({
      data: { company, role, jdText: jdText.slice(0, 8000), hook: hook || "", body, tone: tone || "professional" },
    });
    return NextResponse.json({ ok: true, letter: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const letter = await prisma.coverLetter.update({ where: { id }, data: patch });
    return NextResponse.json({ ok: true, letter });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.coverLetter.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
