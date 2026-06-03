// Vertex AI Gemini client. Replaces Google AI Studio path for the four topic-page features.
import { VertexAI } from "@google-cloud/vertexai";
import { GCP_PROJECT, GCP_LOCATION, gcpReady } from "./gcp";

let cached: VertexAI | null = null;

function client(): VertexAI {
  if (cached) return cached;
  const r = gcpReady();
  if (!r.ok) throw new Error(`Vertex AI not ready: ${r.reason}`);
  cached = new VertexAI({ project: GCP_PROJECT, location: GCP_LOCATION });
  return cached;
}

export const DEFAULT_MODEL = process.env.VERTEX_GEMINI_MODEL || "gemini-2.5-flash";
export const PRO_MODEL = process.env.VERTEX_GEMINI_PRO_MODEL || "gemini-2.5-pro";

export async function vertexGeminiText(
  prompt: string,
  opts?: { system?: string; pro?: boolean; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const model = (opts?.pro ? PRO_MODEL : DEFAULT_MODEL);
  const gen = client().getGenerativeModel({
    model,
    systemInstruction: opts?.system ? { role: "system", parts: [{ text: opts.system }] } : undefined,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: opts?.maxTokens || 2048,
      ...(opts?.jsonMode ? { responseMimeType: "application/json" } : {}),
    } as any,
  });
  const result = await gen.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const cand = result.response?.candidates?.[0];
  const text = cand?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("") || "";
  return text;
}
