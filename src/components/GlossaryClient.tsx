"use client";
import { useMemo, useState } from "react";
import type { GlossaryEntry } from "@/lib/glossary";

const TAG_COLOR: Record<string, string> = {
  metric: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "deep-learning": "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  ml: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "ml-theory": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  nlp: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  llm: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  rag: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  agents: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  optim: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  math: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  info: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  cv: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  systems: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  mlops: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  multimodal: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  rl: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  ssl: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  prob: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  prompting: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  rlhf: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  tools: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  ai: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
};

export default function GlossaryClient({ initial }: { initial: GlossaryEntry[] }) {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");

  const allTags = useMemo(() => {
    const s = new Set<string>();
    initial.forEach((e) => e.tags.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [initial]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return initial.filter((e) => {
      if (activeTag && !e.tags.includes(activeTag)) return false;
      if (!ql) return true;
      return (
        e.term.toLowerCase().includes(ql) ||
        e.def.toLowerCase().includes(ql) ||
        e.tags.some((t) => t.toLowerCase().includes(ql))
      );
    });
  }, [initial, q, activeTag]);

  return (
    <div className="space-y-5">
      <div className="glass p-4 space-y-3 sticky top-0 z-10">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${initial.length} terms…  e.g. "attention", "PEFT", "RAG"`}
          className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60"
        />
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setActiveTag("")} className={`text-[10px] px-2.5 py-1 rounded-full border transition ${!activeTag ? "bg-accent/20 border-accent/40 text-accent-light" : "border-white/10 text-text-secondary hover:bg-white/5"}`}>All</button>
          {allTags.map((t) => (
            <button key={t} onClick={() => setActiveTag(t === activeTag ? "" : t)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition ${activeTag === t ? "bg-accent/20 border-accent/40 text-accent-light" : (TAG_COLOR[t] || "border-white/10 text-text-secondary")}`}>{t}</button>
          ))}
        </div>
        <div className="text-[11px] text-text-muted">{filtered.length} of {initial.length}</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((e) => (
          <div key={e.term} className="glass p-4 hover-lift hover:border-accent/30">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-sm font-bold gradient-text">{e.term}</div>
              <div className="flex gap-1 flex-wrap">
                {e.tags.map((t) => (
                  <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${TAG_COLOR[t] || "border-white/10 text-text-muted"}`}>{t}</span>
                ))}
              </div>
            </div>
            <div className="text-xs text-text-secondary leading-relaxed">{e.def}</div>
            {e.related && e.related.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {e.related.map((r) => (
                  <button key={r} onClick={() => setQ(r)} className="text-[10px] text-accent-light hover:underline">{r}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
