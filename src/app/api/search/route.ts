import { NextRequest, NextResponse } from "next/server";
import { searchClient, servingConfigPath } from "@/lib/agent-builder";
import { localSearch } from "@/lib/local-search";

export async function POST(req: NextRequest) {
  try {
    const { query, pageSize = 10 } = await req.json();
    if (!query || typeof query !== "string") return NextResponse.json({ error: "query required" }, { status: 400 });

    // Try Vertex AI Search first
    try {
      const [resp] = await searchClient().search({
        servingConfig: servingConfigPath(),
        query,
        pageSize,
        contentSearchSpec: {
          snippetSpec: { returnSnippet: true, maxSnippetCount: 1 } as any,
        } as any,
      }, { autoPaginate: false });

      const results = (resp as any[]).map((r: any) => {
        const doc = r.document;
        const struct = doc?.structData?.fields || {};
        const derived = doc?.derivedStructData?.fields || {};
        const snippets = derived?.snippets?.listValue?.values?.map(
          (v: any) => v.structValue?.fields?.snippet?.stringValue
        ).filter(Boolean) || [];
        return {
          id: doc?.id,
          code: struct?.code?.stringValue,
          title: struct?.title?.stringValue,
          phase: struct?.phase?.numberValue,
          uri: doc?.content?.uri || derived?.link?.stringValue,
          snippet: snippets[0] || "",
          source: "vertex",
        };
      }).filter((r) => r.code);

      if (results.length > 0) {
        return NextResponse.json({ results, total: results.length, source: "vertex" });
      }
    } catch {
      // fall through to local search
    }

    // Local SQLite fallback
    const hits = await localSearch(query, pageSize);
    const results = hits.map((h) => ({ ...h, source: "local" }));
    return NextResponse.json({ results, total: results.length, source: "local" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
