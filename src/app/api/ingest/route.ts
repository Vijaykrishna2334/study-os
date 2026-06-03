import { NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { tierFor } from "@/lib/tiers";

export async function POST() {
  const root = process.env.STUDY_ROOT || "d:/project/study";
  let count = 0;
  let order = 0;
  for (let i = 1; i <= 12; i++) {
    const dir = join(root, `Phase ${i}`);
    let files: string[] = [];
    try { if (statSync(dir).isDirectory()) files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".md")).sort(); } catch { continue; }
    for (const f of files) {
      const filePath = join(dir, f);
      const code = (f.match(/^(P\d+[\w]*)/)?.[1]) || f.replace(/\.md$/i, "");
      const fallback = f.replace(/^P\d+[\w]*_/, "").replace(/\.md$/i, "").replace(/_/g, " ");
      let title = fallback;
      try {
        const txt = readFileSync(filePath, "utf8");
        const h1 = txt.match(/^#\s+(.+)$/m);
        if (h1) title = h1[1].replace(/[*_#`]/g, "").trim();
      } catch {}
      const tier = tierFor(code);
      order++;
      await prisma.topic.upsert({
        where: { code },
        create: { code, phase: i, title, filePath, tier, order },
        update: { phase: i, title, filePath, tier, order },
      });
      count++;
    }
  }
  return NextResponse.json({ ok: true, count });
}
