import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const SYSTEM = `You are a senior AI/ML hiring manager. Compare a candidate's resume against a job description and score the fit.
Return STRICT JSON only — no markdown, no code fences, no explanation:
{"score":0-10,"label":"Strong Fit|Good Fit|Moderate Fit|Weak Fit","matched":["skill that matches JD"],"gaps":["requirement not in resume"],"highlights":["strongest match sentence","biggest gap sentence"]}
Score 9-10=near-perfect. 8=strong. 7=good. 5-6=moderate. <5=weak. Output ONLY the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const { title, company, description } = await req.json();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" }, take: 1 });
    const baseResume = resumes[0];

    let resumeText = "";
    if (baseResume?.summary?.startsWith("[UPLOADED_RESUME_V2]")) {
      resumeText = baseResume.summary.replace("[UPLOADED_RESUME_V2]\n", "").trim()
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
    } else if (baseResume) {
      const header = JSON.parse(baseResume.headerJSON || "{}");
      resumeText = `${header.name || "Candidate"}\n${baseResume.summary || ""}\nSkills: ${baseResume.skillsJSON || ""}`.slice(0, 3000);
    }

    if (!resumeText) {
      return NextResponse.json({ error: "No resume uploaded. Please upload your resume first." }, { status: 400 });
    }

    const prompt = `Job Title: ${title}
Company: ${company || "Unknown"}
Job Description: ${(description || title).slice(0, 2000)}

Candidate Resume:
${resumeText.slice(0, 3000)}

Score this resume against the job and return ONLY the JSON.`;

    const raw = await geminiText(prompt, SYSTEM, { maxTokens: 2048 });

    // Robust extraction: find first { and last } regardless of markdown wrapping
    const start = raw.indexOf("{");
    const end   = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) {
      console.error("[quick-score] no JSON braces found. raw:", raw.slice(0, 300));
      return NextResponse.json({ error: "parse error" }, { status: 500 });
    }

    let result: any;
    try {
      result = JSON.parse(raw.slice(start, end + 1));
    } catch (e: any) {
      console.error("[quick-score] JSON.parse failed:", e.message);
      return NextResponse.json({ error: "parse error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
