import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { geminiText, SYSTEM_PROMPTS } from "@/lib/gemini";

const MAX_NOTES_CHARS = 6000;

export async function POST(req: NextRequest) {
  try {
    const { topicId, mode, prompt } = await req.json();
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) return NextResponse.json({ error: "topic not found" }, { status: 404 });

    let notes = "";
    try { notes = readFileSync(topic.filePath, "utf8").slice(0, MAX_NOTES_CHARS); } catch {}

    const ctx = `Topic: ${topic.title} (${topic.code})\nPhase: ${topic.phase}\nTier: ${topic.tier}\n\n--- Study notes excerpt ---\n${notes}`;

    let system = SYSTEM_PROMPTS.qa;
    let userPrompt = prompt || "Give me the most important interview points for this topic.";

    if (mode === "cheatsheet") {
      system = SYSTEM_PROMPTS.summary;
      userPrompt = `Topic context below. Produce the 5-bullet cheat-sheet.\n\n${ctx}`;
    } else if (mode === "deepdive") {
      system = SYSTEM_PROMPTS.deepdive;
      userPrompt = `Topic context below.\n\n${ctx}`;
    } else if (mode === "flashcards") {
      system = SYSTEM_PROMPTS.flashcards;
      userPrompt = `Topic context below.\n\n${ctx}`;
    } else if (mode === "mock") {
      system = SYSTEM_PROMPTS.mock;
      userPrompt = `Topic context below. Ask one rigorous opening question.\n\n${ctx}`;
    } else {
      userPrompt = `${ctx}\n\n--- User question ---\n${userPrompt}`;
    }

    const text = await geminiText(userPrompt, system);

    if (mode === "flashcards") {
      // Best-effort parse and store
      try {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const arr = JSON.parse(match[0]) as { q: string; a: string }[];
          await prisma.flashcard.createMany({
            data: arr.slice(0, 10).map((c) => ({ topicId: topic.id, question: c.q, answer: c.a })),
          });
        }
      } catch {}
    }

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
