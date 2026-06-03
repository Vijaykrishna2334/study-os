import Link from "next/link";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";
import { PHASE_TITLES, TIER_META } from "@/lib/tiers";
import MarkdownView from "@/components/MarkdownView";
import ProgressPanel from "@/components/ProgressPanel";
import GeminiPanel from "@/components/GeminiPanel";
import PracticeLinks from "@/components/PracticeLinks";
import CodePlayground from "@/components/CodePlayground";
import MasteryPath from "@/components/MasteryPath";


export const dynamic = "force-dynamic";

export default async function TopicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({ where: { id }, include: { enrichment: true } });
  if (!topic) notFound();

  let content = "";
  let readError = "";
  try {
    content = readFileSync(topic.filePath, "utf8");
  } catch (e: any) {
    readError = `Could not read file at ${topic.filePath}: ${e.message}`;
  }

  const siblings = await prisma.topic.findMany({
    where: { phase: topic.phase },
    orderBy: { order: "asc" },
    select: { id: true, code: true, title: true, order: true },
  });
  const idx = siblings.findIndex((s) => s.id === topic.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const allTopics = await prisma.topic.findMany({ select: { id: true, code: true, title: true } });
  const codeMap: Record<string, { id: string; code: string; title: string }> = {};
  allTopics.forEach((t) => { codeMap[t.code] = t; });

  const meta = TIER_META[topic.tier as "A"|"B"|"C"|"D"];

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <div className="text-xs text-text-muted flex items-center gap-2 flex-wrap">
        <Link href="/topics" className="hover:text-accent-light">Topics</Link>
        <span>›</span>
        <Link href={`/topics?phase=${topic.phase}`} className="hover:text-accent-light">Phase {topic.phase} · {PHASE_TITLES[topic.phase]}</Link>
        <span>›</span>
        <span className="text-text-secondary font-mono">{topic.code}</span>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold gradient-text leading-tight">{topic.title}</h1>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ${meta.ring} ${meta.color}`}>Tier {topic.tier} · {meta.label}</span>
            <span className="text-[10px] uppercase tracking-widest text-text-muted">{topic.code}</span>
            {topic.quizPassed && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✓ Quiz cleared</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {prev && <Link href={`/topics/${prev.id}`} className="btn-ghost text-xs">← {prev.code}</Link>}
          {next && <Link href={`/topics/${next.id}`} className="btn-ghost text-xs">{next.code} →</Link>}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">


          {/* Existing notes */}
          <div className="glass p-6">
            {readError ? (
              <div className="text-rose-400 text-sm">{readError}</div>
            ) : (
              <MarkdownView content={content} />
            )}
          </div>

          {/* NEW — Mastery Path: prereqs, quiz, problems, project, video, mind-map */}
          <MasteryPath
            topicId={topic.id}
            topicCode={topic.code}
            topicTitle={topic.title}
            initial={topic.enrichment as any}
            quizBestScore={topic.quizBestScore}
            codeMap={codeMap}
          />

          <GeminiPanel topicId={topic.id} topicTitle={topic.title} topicCode={topic.code} />
          <PracticeLinks code={topic.code} phase={topic.phase} />
          <CodePlayground title={`${topic.code} — ${topic.title}`} initialLang="python" />
        </div>
        <div>
          <ProgressPanel topic={{
            id: topic.id,
            read: topic.read, rederived: topic.rederived, artifact: topic.artifact,
            taughtBack: topic.taughtBack, mocked: topic.mocked,
            confidence: topic.confidence, notes: topic.notes,
          }} />
        </div>
      </div>
    </div>
  );
}
