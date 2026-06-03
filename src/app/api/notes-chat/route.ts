import { NextRequest, NextResponse } from "next/server";
import { searchClient, servingConfigPath } from "@/lib/agent-builder";
import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { geminiText } from "@/lib/gemini";
import { localSearch } from "@/lib/local-search";

const SYSTEM = `You are a senior AI/ML interview coach with deep expertise.
Answer based on the study notes provided. Be concise (4-8 lines), precise, and interview-ready.
If the notes cover the topic, cite the source topic name. If not covered, say so briefly and answer from general knowledge.
Format: plain text, no markdown headers.`;

export async function POST(req: NextRequest) {
  try {
    const { query, history } = await req.json() as { query: string; history?: { role: "user"|"assistant"; text: string }[] };
    if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

    // Step 1: retrieve relevant docs via Vertex AI Search (standard edition — no LLM add-on needed)
    let refs: { title: string; code: string; uri: string }[] = [];
    let contextChunks: string[] = [];

    try {
      const [resp] = await searchClient().search({
        servingConfig: servingConfigPath(),
        query,
        pageSize: 6,
        contentSearchSpec: {
          snippetSpec: { returnSnippet: true, maxSnippetCount: 2 } as any,
        } as any,
      }, { autoPaginate: false });

      const hits = resp as any[];
      refs = hits.map((r: any) => {
        const struct = r.document?.structData?.fields || {};
        return {
          title: struct?.title?.stringValue || "",
          code:  struct?.code?.stringValue  || "",
          uri:   r.document?.content?.uri   || "",
        };
      }).filter((r) => r.code);

      // Step 2: load actual markdown content for top 4 hits
      for (const ref of refs.slice(0, 4)) {
        try {
          const topic = await prisma.topic.findUnique({ where: { code: ref.code } });
          if (topic?.filePath) {
            const content = readFileSync(topic.filePath, "utf8").slice(0, 2000);
            contextChunks.push(`=== ${ref.title} (${ref.code}) ===\n${content}`);
          }
        } catch {}
      }
    } catch { /* vertex search failed */ }

    // Fall back to local search when Vertex returns 0 results or fails
    if (refs.length === 0) {
      try {
        const hits = await localSearch(query, 4);
        refs = hits.map((h) => ({ title: h.title, code: h.code, uri: h.uri }));
        contextChunks = [];
        for (const h of hits.slice(0, 4)) {
          const content = h.uri ? readFileSync(h.uri, "utf8").slice(0, 2000) : "";
          if (content) contextChunks.push(`=== ${h.title} (${h.code}) ===\n${content}`);
        }
      } catch {}
    }

    // Step 3: build conversation history string
    const historyStr = (history || []).slice(-4)
      .map((h) => `${h.role === "user" ? "You" : "Coach"}: ${h.text}`)
      .join("\n\n");

    // Step 4: call Gemini directly with retrieved context
    const prompt = `${historyStr ? `Previous conversation:\n${historyStr}\n\n` : ""}Study notes context:\n${contextChunks.join("\n\n") || "(no specific notes retrieved)"}\n\nQuestion: ${query}`;

    const text = await geminiText(prompt, SYSTEM);

    // Step 5: generate related questions
    const related: string[] = [];
    try {
      const relatedRaw = await geminiText(
        `Given the question "${query}", suggest 3 short follow-up interview questions on the same topic. Return as a JSON array of strings only.`,
      );
      const match = relatedRaw.match(/\[[\s\S]*\]/);
      if (match) related.push(...JSON.parse(match[0]).slice(0, 3));
    } catch {}

    return NextResponse.json({ text, refs, related });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
