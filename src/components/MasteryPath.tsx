"use client";
import { useState } from "react";
import Link from "next/link";
import MarkdownView from "./MarkdownView";
import QuizPlayer from "./QuizPlayer";

type Enrichment = {
  prereqCodes: string;
  followCodes: string;
  quiz: string;
  problemSet: string;
  projectBrief: string;
  videoQuery: string;
  videoUrl: string;
  mindMap: string;
  cheatSheet: string;
  generatedAt: string | null;
};

type TopicLite = { code: string; title: string };

export default function MasteryPath({
  topicId, topicCode, topicTitle, initial, quizBestScore, codeMap,
}: {
  topicId: string;
  topicCode: string;
  topicTitle: string;
  initial: Enrichment | null;
  quizBestScore: number;
  codeMap: Record<string, TopicLite & { id: string }>;
}) {
  const [e, setE] = useState<Enrichment | null>(initial);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function activate(force = false) {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/enrich", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, force }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "enrichment failed");
      setE(d.enrichment);
    } catch (er: any) { setErr(er.message); } finally { setLoading(false); }
  }

  if (!e || !e.generatedAt) {
    return (
      <div className="glass p-6 space-y-4 ring-1 ring-accent/30 bg-accent/[0.04]">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent-light">Mastery Path · Not yet activated</div>
          <h2 className="text-xl font-bold mt-1">Turn this topic into active learning.</h2>
          <p className="text-sm text-text-secondary mt-1">
            One click → Gemini generates prerequisites · 6-question quiz · 6 problems (numeric + code + concept) · project brief + rubric · YouTube curated video · mermaid mind-map · cheat-sheet.
            Saved forever in DB after first generation.
          </p>
        </div>
        {err && <div className="text-sm text-rose-300">{err}</div>}
        <button onClick={() => activate(false)} disabled={loading} className="btn-primary disabled:opacity-40">
          {loading ? "Gemini is building your mastery path…" : "Activate Mastery Path"}
        </button>
      </div>
    );
  }

  const prereqCodes: string[] = safeJson(e.prereqCodes, []);
  const followCodes: string[] = safeJson(e.followCodes, []);
  const quiz: any[] = safeJson(e.quiz, []);
  const problems: any[] = safeJson(e.problemSet, []);
  const videoEmbed = ytEmbedFromQuery(e.videoUrl, e.videoQuery);

  return (
    <div className="space-y-6">
      {/* Prereq + Follow */}
      <div className="glass p-5">
        <div className="text-xs uppercase tracking-widest text-text-muted mb-3">Prerequisite map</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-2">Master FIRST</div>
            <CodeChips codes={prereqCodes} codeMap={codeMap} empty="Foundational — no prereqs" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-2">Then study NEXT</div>
            <CodeChips codes={followCodes} codeMap={codeMap} empty="Leaf node — nothing builds directly on this" />
          </div>
        </div>
      </div>

      {/* Cheat sheet */}
      {e.cheatSheet && (
        <div className="glass p-5">
          <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Cheat sheet</div>
          <MarkdownView content={e.cheatSheet} />
        </div>
      )}

      {/* Video */}
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-widest text-text-muted">Curated video</div>
          {e.videoQuery && (
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(e.videoQuery)}`} target="_blank" rel="noopener noreferrer"
               className="text-xs text-accent-light hover:underline">Open YouTube search ↗</a>
          )}
        </div>
        {videoEmbed ? (
          <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
            <iframe src={videoEmbed} className="w-full h-full" allow="encrypted-media" allowFullScreen />
          </div>
        ) : (
          <div className="text-sm text-text-secondary">
            <div className="font-medium text-text-primary mb-1">Suggested search query</div>
            "{e.videoQuery}"
          </div>
        )}
      </div>

      {/* Quiz */}
      {quiz.length > 0 && (
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="text-xs uppercase tracking-widest text-text-muted">Quiz · verify you understood</div>
              <div className="text-sm text-text-secondary">{quiz.length} questions. Score ≥ 80% to clear this topic.</div>
            </div>
            <button onClick={() => activate(true)} className="btn-ghost text-xs">Regenerate</button>
          </div>
          <QuizPlayer topicId={topicId} quiz={quiz} bestScore={quizBestScore} />
        </div>
      )}

      {/* Problem set */}
      {problems.length > 0 && (
        <div className="glass p-5">
          <div className="text-xs uppercase tracking-widest text-text-muted mb-3">Practice problems</div>
          <div className="space-y-3">
            {problems.map((p, i) => <ProblemCard key={i} idx={i} p={p} />)}
          </div>
        </div>
      )}

      {/* Project brief */}
      {e.projectBrief && (
        <div className="glass p-5">
          <div className="text-xs uppercase tracking-widest text-text-muted mb-3">Mini project · prove mastery</div>
          <MarkdownView content={e.projectBrief} />
        </div>
      )}

      {/* Mind map */}
      {e.mindMap && (
        <details className="glass p-5">
          <summary className="cursor-pointer text-xs uppercase tracking-widest text-text-muted">Mermaid mind-map (toggle)</summary>
          <pre className="mt-3 bg-black/40 rounded-lg p-3 text-[11px] overflow-x-auto text-text-secondary">{e.mindMap}</pre>
        </details>
      )}
    </div>
  );
}

function CodeChips({ codes, codeMap, empty }: { codes: string[]; codeMap: Record<string, any>; empty: string }) {
  if (!codes.length) return <div className="text-xs text-text-muted italic">{empty}</div>;
  return (
    <div className="flex flex-wrap gap-2">
      {codes.map((c) => {
        const t = codeMap[c];
        return t ? (
          <Link key={c} href={`/topics/${t.id}`}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-accent/15 hover:border-accent/30 hover:text-accent-light transition">
            <span className="font-mono text-text-muted mr-2">{c}</span>{t.title}
          </Link>
        ) : (
          <span key={c} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-text-muted">{c}</span>
        );
      })}
    </div>
  );
}

function ProblemCard({ idx, p }: { idx: number; p: { type: string; q: string; answer: string; hint: string } }) {
  const [revealed, setRevealed] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const palette: Record<string, string> = {
    numeric: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    code:    "bg-amber-500/15 text-amber-300 border-amber-500/30",
    concept: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  };
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-widest ${palette[p.type] || "bg-white/10 text-text-secondary border-white/10"}`}>{p.type}</span>
        <span className="text-text-muted text-xs">P{idx + 1}</span>
      </div>
      <div className="text-sm text-text-primary leading-relaxed">{p.q}</div>
      <div className="flex gap-2 flex-wrap text-[11px]">
        <button onClick={() => setHintShown((s) => !s)} className="btn-ghost text-[11px] px-3 py-1">{hintShown ? "Hide hint" : "Show hint"}</button>
        <button onClick={() => setRevealed((s) => !s)} className="btn-ghost text-[11px] px-3 py-1">{revealed ? "Hide answer" : "Reveal answer"}</button>
      </div>
      {hintShown && p.hint && <div className="text-xs text-text-secondary italic">💡 {p.hint}</div>}
      {revealed && (
        <div className="text-xs text-text-secondary border-t border-white/8 pt-2 mt-1">
          {p.type === "code"
            ? <pre className="bg-black/40 rounded p-3 overflow-x-auto"><code>{p.answer}</code></pre>
            : <div className="whitespace-pre-wrap">{p.answer}</div>}
        </div>
      )}
    </div>
  );
}

function safeJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}

function ytEmbedFromQuery(url: string, query: string): string | null {
  if (url) {
    const id = url.match(/v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  return null;
}
