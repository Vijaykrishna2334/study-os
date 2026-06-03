import { NextRequest, NextResponse } from "next/server";
import { geminiText } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const SYSTEM = `You are an expert resume writer for AI/ML roles. Given the candidate's original resume and a job description, create a perfectly tailored version. Keep all real facts. Rewrite to match the JD. Output ONLY the complete markdown resume — no preamble, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    const { title, company, description, matchedSkills, gaps } = await req.json();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" }, take: 1 });
    const baseResume = resumes[0];
    let resumeSource = "generated";
    let baseContent = "";

    if (baseResume?.summary?.startsWith("[UPLOADED_RESUME_V2]")) {
      resumeSource = "uploaded";
      baseContent = baseResume.summary.replace("[UPLOADED_RESUME_V2]\n", "").trim();
    } else {
      const h = baseResume ? JSON.parse(baseResume.headerJSON || "{}") : {
        name:"Pedhapati Vijay Krishna", email:"vijaykrishna2334@gmail.com",
        phone:"+91 9182583307", location:"East Godavari, AP",
        linkedin:"linkedin.com/in/vijaykrishna", github:"github.com/vijaykrishna"
      };
      const mastered = await prisma.topic.findMany({ where:{ confidence:{gte:4} }, select:{title:true} });
      baseContent = `Name: ${h.name}\nEmail: ${h.email} | Phone: ${h.phone}\nLocation: ${h.location}\nLinkedIn: ${h.linkedin} | GitHub: ${h.github}\nMastered Topics: ${mastered.map((t:any)=>t.title).join(", ").slice(0,2000)}`;
    }

    const prompt = resumeSource === "uploaded"
      ? `Tailor this resume for: ${title} at ${company||"the company"}\nJob Description: ${description||title}\nEmphasize: ${matchedSkills?.join(", ")||"AI/ML"}\nGaps to address: ${gaps?.join(", ")||"none"}\n\n=== ORIGINAL RESUME ===\n${baseContent}\n\nCreate tailored markdown resume. Keep all real facts. Rewrite summary and bullets for JD relevance. Output ONLY markdown.`
      : `Create tailored resume for: ${title} at ${company||"the company"}\nJD: ${description||title}\nCandidate info:\n${baseContent}\nCreate complete markdown resume with: Summary, Technical Skills, Experience (metric bullets), Projects, Education, Certifications.`;

    const resume = await geminiText(prompt, SYSTEM, { pro: true, maxTokens: 3000 });
    return NextResponse.json({ ok: true, resume, source: resumeSource });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
