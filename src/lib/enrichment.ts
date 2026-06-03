// Generates the per-topic "Mastery Path": prereqs, quiz, problem set, project brief, video query, mind map, cheat-sheet.
// Single Gemini call returns a STRICT JSON object so the UI can render every section deterministically.
import { geminiText } from "./gemini";
import { readFileSync } from "node:fs";

const SYSTEM = `You are a top-tier AI/ML curriculum designer building an interactive "Mastery Path" for a senior-track engineer.
Given a topic's existing study notes and the master list of all 334 topic codes, produce a single STRICT JSON object that converts the passive notes into active learning. Output ONLY the JSON, no preamble, no markdown fence.

Schema (every field required, no extras):
{
  "prereqCodes": ["P3_1_1", "..."],          // 1-5 topic codes from the master list that must be mastered FIRST. Empty array if foundational.
  "followCodes": ["P3_1_4", "..."],          // 1-5 topic codes that build ON this. Empty if leaf.
  "quiz": [
    { "q": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explain": "why this is correct in <40 words" }
  ],                                          // EXACTLY 6 questions. Mix conceptual (2), mathematical (2), trade-off/edge-case (2). No trivial definition lookups.
  "problemSet": [
    { "type": "numeric", "q": "...", "answer": "...", "hint": "..." },
    { "type": "code",    "q": "...", "answer": "python snippet (≤20 lines)", "hint": "..." },
    { "type": "concept", "q": "...", "answer": "short paragraph", "hint": "..." }
  ],                                          // EXACTLY 6 problems: 2 numeric, 2 code, 2 concept. Code answers must be runnable Python.
  "projectBrief": "## Goal\\n... ## Deliverables\\n... ## Rubric\\n...",  // ≤300 word markdown. A concrete buildable mini-project that proves mastery.
  "videoQuery": "best YouTube search query to find a 10-30 min explainer on this exact topic",
  "mindMap": "mermaid graph TD code, ≤15 nodes, showing the concept hierarchy",
  "cheatSheet": "- bullet1\\n- bullet2\\n- bullet3\\n- bullet4\\n- bullet5"
}

Constraints:
- Quiz questions must be at the level a Senior AI/ML interviewer would ask. No fluff.
- prereqCodes/followCodes MUST be valid codes from the provided master list.
- Numeric answers must be exact numbers; concept answers ≤ 80 words.
- No emojis, no headers outside the JSON values, no markdown around the object.`;

export type EnrichmentBundle = {
  prereqCodes: string[];
  followCodes: string[];
  quiz: { q: string; options: string[]; correctIndex: number; explain: string }[];
  problemSet: { type: "numeric" | "code" | "concept"; q: string; answer: string; hint: string }[];
  projectBrief: string;
  videoQuery: string;
  mindMap: string;
  cheatSheet: string;
};

export async function generateEnrichment(
  topic: { code: string; title: string; phase: number; filePath: string },
  allCodes: string[]
): Promise<EnrichmentBundle> {
  let notes = "";
  try { notes = readFileSync(topic.filePath, "utf8").slice(0, 8000); } catch {}

  const codeIndex = allCodes.slice(0, 400).join(", ");

  const prompt = `## Topic
Code: ${topic.code}
Title: ${topic.title}
Phase: ${topic.phase}

## Existing notes (excerpt)
${notes}

## Master code list (use only these for prereqCodes/followCodes)
${codeIndex}

Produce the JSON object exactly per the schema in the system instructions.`;

  const raw = await geminiText(prompt, SYSTEM);
  const json = extractJson(raw);
  if (!json) throw new Error("Gemini returned non-JSON for enrichment");
  return normalize(json, allCodes);
}

function extractJson(raw: string): any | null {
  const cleaned = raw.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function normalize(o: any, allCodes: string[]): EnrichmentBundle {
  const valid = new Set(allCodes);
  const filterCodes = (a: any) => Array.isArray(a) ? a.filter((c) => typeof c === "string" && valid.has(c)).slice(0, 6) : [];
  const safeQuiz = Array.isArray(o.quiz) ? o.quiz.filter((q: any) =>
    q && typeof q.q === "string" && Array.isArray(q.options) && q.options.length === 4 && typeof q.correctIndex === "number"
  ).slice(0, 8) : [];
  const safeProblems = Array.isArray(o.problemSet) ? o.problemSet.filter((p: any) =>
    p && typeof p.q === "string" && ["numeric", "code", "concept"].includes(p.type)
  ).slice(0, 8) : [];
  return {
    prereqCodes: filterCodes(o.prereqCodes),
    followCodes: filterCodes(o.followCodes),
    quiz: safeQuiz,
    problemSet: safeProblems,
    projectBrief: typeof o.projectBrief === "string" ? o.projectBrief : "",
    videoQuery: typeof o.videoQuery === "string" ? o.videoQuery : "",
    mindMap: typeof o.mindMap === "string" ? o.mindMap : "",
    cheatSheet: typeof o.cheatSheet === "string" ? o.cheatSheet : "",
  };
}
