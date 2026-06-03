"use client";
import { useEffect, useState } from "react";

type Paper = { id: string; arxivId: string; title: string; authors: string; abstract: string; summary: string; savedAt: string };
type Parsed = { tldr?: string; problem?: string; key_idea?: string; results?: string; limitations?: string; why_it_matters?: string; interview_questions?: string[] };

const SUGGESTED = [
  { id: "1706.03762", label: "Attention Is All You Need (Transformers)" },
  { id: "1810.04805", label: "BERT" },
  { id: "2005.14165", label: "GPT-3" },
  { id: "2106.09685", label: "LoRA" },
  { id: "2305.14314", label: "QLoRA" },
  { id: "2305.18290", label: "DPO" },
  { id: "2104.09864", label: "RoFormer / RoPE" },
  { id: "2205.14135", label: "Flash Attention" },
  { id: "2310.06770", label: "Mamba (S6)" },
];

export default function PapersClient() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [active, setActive] = useState<Paper | null>(null);
  const [library, setLibrary] = useState<Paper[]>([]);

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    const d = await (await fetch("/api/paper")).json();
    setLibrary(d.papers || []);
  }

  async function fetchOne(forceId?: string, force = false) {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/paper", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: forceId || input, force }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      setActive(d.paper);
      await refresh();
      if (!forceId) setInput("");
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const parsed: Parsed = active ? safeJson(active.summary, {}) : {};

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <aside className="space-y-4">
        <div className="glass p-4 space-y-3">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="https://arxiv.org/abs/1706.03762"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/60"
            onKeyDown={(e) => { if (e.key === "Enter") fetchOne(); }}
          />
          <button onClick={() => fetchOne()} disabled={loading || !input.trim()} className="btn-primary w-full disabled:opacity-40">
            {loading ? "Fetching + summarising…" : "Add paper"}
          </button>
          {err && <div className="text-xs text-rose-300">{err}</div>}
        </div>

        <div className="glass p-4 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-text-muted">Suggested seminal papers</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map((s) => (
              <button key={s.id} onClick={() => fetchOne(s.id)}
                      className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-accent/15 hover:border-accent/30 transition">
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {library.length > 0 && (
          <div className="glass p-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Library ({library.length})</div>
            <div className="space-y-1">
              {library.map((p) => (
                <button key={p.id} onClick={() => setActive(p)}
                        className={`block w-full text-left px-2 py-1.5 rounded-lg text-xs transition ${active?.id === p.id ? "bg-accent/15 text-accent-light" : "hover:bg-white/5 text-text-secondary"}`}>
                  <div className="font-mono text-[10px] text-text-muted">{p.arxivId}</div>
                  <div className="font-medium leading-tight line-clamp-2">{p.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        {!active ? (
          <div className="glass p-10 text-center">
            <div className="text-text-secondary">Paste an arXiv URL or pick a suggested paper to begin.</div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="glass p-6">
              <div className="text-[10px] font-mono text-text-muted">{active.arxivId}</div>
              <h2 className="text-xl font-bold gradient-text mt-1">{active.title}</h2>
              <div className="text-xs text-text-secondary mt-1">{active.authors}</div>
              <div className="mt-4 flex gap-2">
                <a href={`https://arxiv.org/pdf/${active.arxivId}.pdf`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">Open PDF ↗</a>
                <button onClick={() => fetchOne(active.arxivId, true)} className="btn-ghost text-xs">Regenerate summary</button>
              </div>
            </div>

            {parsed.tldr && <Section title="TL;DR" body={parsed.tldr} accent />}
            {parsed.problem && <Section title="Problem" body={parsed.problem} />}
            {parsed.key_idea && <Section title="Key idea" body={parsed.key_idea} />}
            {parsed.results && <Section title="Results" body={parsed.results} />}
            {parsed.limitations && <Section title="Limitations" body={parsed.limitations} />}
            {parsed.why_it_matters && <Section title="Why it matters" body={parsed.why_it_matters} />}

            {parsed.interview_questions && parsed.interview_questions.length > 0 && (
              <div className="glass p-5">
                <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Interview questions</div>
                <ol className="list-decimal list-inside text-sm text-text-primary space-y-1.5">
                  {parsed.interview_questions.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </div>
            )}

            <details className="glass p-5">
              <summary className="cursor-pointer text-xs uppercase tracking-widest text-text-muted">Full abstract (arXiv)</summary>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{active.abstract}</p>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, body, accent }: { title: string; body: string; accent?: boolean }) {
  return (
    <div className={`glass p-5 ${accent ? "ring-1 ring-accent/40 bg-accent/[0.04]" : ""}`}>
      <div className="text-xs uppercase tracking-widest text-text-muted mb-2">{title}</div>
      <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{body}</div>
    </div>
  );
}

function safeJson<T>(s: string, fallback: T): T { try { return JSON.parse(s); } catch { return fallback; } }
