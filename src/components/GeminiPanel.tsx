"use client";
import { useState } from "react";
import MarkdownView from "./MarkdownView";

type Mode = "ask" | "deepdive" | "cheatsheet" | "flashcards" | "mock";

const TABS: { key: Mode; label: string }[] = [
  { key: "ask",        label: "Ask" },
  { key: "deepdive",   label: "Deep Dive" },
  { key: "cheatsheet", label: "Cheat-sheet" },
  { key: "flashcards", label: "Flashcards" },
  { key: "mock",       label: "Mock Q" },
];

export default function GeminiPanel({ topicId, topicTitle, topicCode }: { topicId: string; topicTitle: string; topicCode: string }) {
  const [mode, setMode] = useState<Mode>("ask");
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run(prompt?: string) {
    setLoading(true); setErr(""); setAnswer("");
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, mode, prompt: prompt ?? q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gemini failed");
      setAnswer(data.text);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">AI Brain · Gemini</div>
          <div className="text-sm text-text-secondary">{topicCode} · {topicTitle}</div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setMode(t.key); setAnswer(""); setErr(""); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                mode === t.key
                  ? "bg-accent/20 border-accent/40 text-accent-light"
                  : "border-white/10 text-text-secondary hover:bg-white/5"
              }`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {mode === "ask" && (
        <div className="space-y-2">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Ask anything about ${topicTitle}…  e.g. "Derive backprop", "Why √d scaling?", "Pitfalls in interviews"`}
            className="w-full h-24 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:border-accent/60"
          />
          <button onClick={() => run()} disabled={loading || !q.trim()} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Thinking…" : "Ask Gemini"}
          </button>
        </div>
      )}

      {mode !== "ask" && (
        <button onClick={() => run()} disabled={loading} className="btn-primary disabled:opacity-40">
          {loading ? "Generating…" : (
            mode === "deepdive"   ? "Generate full deep dive (intuition → math → code → interview Qs)" :
            mode === "cheatsheet" ? "Generate 5-bullet cheat-sheet" :
            mode === "flashcards" ? "Generate 5 flashcards" :
            "Generate next mock question"
          )}
        </button>
      )}

      {err && <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{err}</div>}

      {answer && (
        <div className="bg-black/30 border border-white/8 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
          <MarkdownView content={answer} />
        </div>
      )}
    </div>
  );
}
