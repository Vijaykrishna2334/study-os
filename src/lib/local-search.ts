// Local keyword search over SQLite topics — used as fallback when Vertex AI Search is unavailable.
import { readFileSync, existsSync } from "node:fs";
import { prisma } from "@/lib/prisma";

export interface SearchHit {
  id: string;
  code: string;
  title: string;
  phase: number;
  uri: string;
  snippet: string;
}

function extractSnippet(content: string, query: string, maxLen = 300): string {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const lines = content.split("\n").filter((l) => l.trim().length > 10);
  for (const word of words) {
    const idx = lines.findIndex((l) => l.toLowerCase().includes(word));
    if (idx >= 0) {
      return lines.slice(Math.max(0, idx - 1), idx + 3).join(" ").replace(/[#*_`>]/g, "").slice(0, maxLen);
    }
  }
  return lines.slice(1, 4).join(" ").replace(/[#*_`>]/g, "").slice(0, maxLen);
}

export async function localSearch(query: string, limit = 8): Promise<SearchHit[]> {
  const words = query.trim().split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return [];

  const topics = await prisma.topic.findMany({
    where: {
      OR: words.map((w) => ({
        OR: [
          { title: { contains: w } },
          { code: { contains: w } },
        ],
      })),
    },
    orderBy: { order: "asc" },
    take: limit * 2,
  });

  const hits: SearchHit[] = [];
  for (const t of topics) {
    let snippet = "";
    if (t.filePath && existsSync(t.filePath)) {
      try {
        const content = readFileSync(t.filePath, "utf8");
        snippet = extractSnippet(content, query);
      } catch {}
    }
    hits.push({
      id: t.id,
      code: t.code,
      title: t.title,
      phase: t.phase,
      uri: t.filePath || "",
      snippet,
    });
    if (hits.length >= limit) break;
  }

  return hits;
}

export async function loadTopicContent(code: string, maxLen = 2000): Promise<string | null> {
  const topic = await prisma.topic.findUnique({ where: { code } });
  if (!topic?.filePath || !existsSync(topic.filePath)) return null;
  try {
    return readFileSync(topic.filePath, "utf8").slice(0, maxLen);
  } catch {
    return null;
  }
}
