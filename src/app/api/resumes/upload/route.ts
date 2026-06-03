import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const mimeType = file.type || "";
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (mimeType === "text/plain" || file.name.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");

    } else if (mimeType === "application/pdf" || file.name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      extractedText = data.text;

    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;

    } else {
      return NextResponse.json({ 
        error: "Unsupported format. Upload PDF, DOCX, or TXT." 
      }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length < 30) {
      return NextResponse.json({ 
        error: "File appears empty. Try a different file." 
      }, { status: 400 });
    }

    const marker = "[UPLOADED_RESUME_V2]\n" + extractedText.trim();
    const resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" }, take: 1 });

    if (resumes.length > 0) {
      await prisma.resume.update({
        where: { id: resumes[0].id },
        data: { summary: marker, name: "Uploaded — " + file.name, updatedAt: new Date() },
      });
    } else {
      await prisma.resume.create({
        data: { name: "Uploaded — " + file.name, targetRole: "AI/ML Engineer", summary: marker, headerJSON: "{}" },
      });
    }

    return NextResponse.json({ ok: true, length: extractedText.length, preview: extractedText.slice(0, 300) + "…" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({ orderBy: { updatedAt: "desc" }, take: 1 });
    const uploaded = resumes.length > 0 && resumes[0].summary?.startsWith("[UPLOADED_RESUME_V2]");
    return NextResponse.json({
      hasUploadedResume: !!uploaded,
      resumeName: uploaded ? resumes[0].name : null,
      preview: uploaded ? resumes[0].summary?.slice(22, 200) : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
