// Provider-agnostic LLM helper.
// Default = Vertex AI Gemini 2.5 Flash (covered by ₹945/mo credit).
// Fallback = Google AI Studio (uses your GEMINI_API_KEY).
import { GoogleGenerativeAI } from "@google/generative-ai";
import { gcpReady } from "./gcp";
import { vertexGeminiText } from "./vertex-gemini";

const FORCE_PROVIDER = (process.env.LLM_PROVIDER || "auto") as "auto" | "vertex" | "aistudio";

async function aiStudioText(prompt: string, system?: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Both Vertex and AI Studio unavailable: set GEMINI_API_KEY or place gcp-key.json");
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: modelName });
  const finalPrompt = system ? `${system}\n\n---\n\n${prompt}` : prompt;
  const result = await model.generateContent(finalPrompt);
  return result.response.text();
}

export async function geminiText(prompt: string, system?: string, opts?: { pro?: boolean; jsonMode?: boolean; maxTokens?: number }): Promise<string> {
  const useVertex = FORCE_PROVIDER === "vertex" || (FORCE_PROVIDER === "auto" && gcpReady().ok);
  if (useVertex) {
    try {
      return await vertexGeminiText(prompt, { system, pro: opts?.pro, jsonMode: opts?.jsonMode, maxTokens: opts?.maxTokens });
    } catch (e: any) {
      if (FORCE_PROVIDER === "vertex") throw e;
      console.warn("[gemini] Vertex failed, falling back to AI Studio:", e.message);
      return await aiStudioText(prompt, system);
    }
  }
  return await aiStudioText(prompt, system);
}

export function activeProvider(): "vertex" | "aistudio" {
  if (FORCE_PROVIDER === "vertex") return "vertex";
  if (FORCE_PROVIDER === "aistudio") return "aistudio";
  return gcpReady().ok ? "vertex" : "aistudio";
}

export const SYSTEM_PROMPTS = {
  qa: `You are an AI/ML interview coach helping Vijay — an ex-infra engineer turned AI/ML engineer with shipped LLM, RAG, and CV projects. Answer with: (1) one-sentence intuition, (2) the precise math or mechanism, (3) one trade-off, (4) one common interview pitfall. Be terse and senior-flavored. Use code blocks only when essential.`,
  flashcards: `Generate exactly 5 high-quality interview flashcards for the topic. Output STRICT JSON array: [{"q":"...","a":"..."}]. Questions must be the type a senior engineer would ask: derivations, trade-offs, edge cases — not definitions. Answers under 60 words.`,
  mock: `You are conducting a rigorous mock technical interview on this topic. Ask ONE probing question, wait for an answer in the next turn. After the user's answer, score it 1-5 on (a) correctness, (b) depth, (c) articulation, then ask a harder follow-up. Be direct, no praise.`,
  summary: `Produce a crisp 5-bullet study cheat-sheet: (1) core idea, (2) key formula or mechanism, (3) when to use, (4) common pitfall, (5) one likely interview question. No fluff.`,
  deepdive: `You are teaching the topic in maximum depth to an experienced engineer.
Output exact sections in this order, no preamble:

## 1. Intuition
2-3 sentences building the mental model. Use one analogy from production engineering.

## 2. Mathematical Foundation
Key formulas with each symbol defined. Derive at least one step. Use LaTeX-style $...$ inline math.

## 3. Worked Example
A small concrete numerical example a reader can follow step-by-step. Show the numbers.

## 4. Code Example
A minimal runnable Python snippet (numpy / sklearn / pytorch where appropriate) — fenced in \`\`\`python. Keep it under 30 lines.

## 5. Trade-offs
3 bullets — when this method shines, when it breaks, what to use instead.

## 6. Interview Questions
5 graded questions (easy → hard) the candidate should be able to answer cold.

## 7. Common Pitfalls
3 specific mistakes engineers make in interviews on this topic.

Be terse but rigorous. No fluff. No praise. No emojis.`,
};
