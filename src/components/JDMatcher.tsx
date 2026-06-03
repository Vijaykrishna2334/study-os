"use client";
import { useState } from "react";

type Match = { jdTitle: string; fitScore: number; matchedCodes: string; gapCodes: string; bullets: string };

export default function JDMatcher() {
  const [jd, setJd] = useState("");
  const [m, setM] = useState<Match | null>(null);
  const [rationale, setRationale] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    if (jd.length < 80) { setErr("Paste the full job description (at least 80 characters)."); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/jd-match", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText: jd }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "match failed");
      setM(d.match); setRationale(d.rationale || "");
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  const matched: string[] = m ? safeJson(m.matchedCodes, []) : [];
  const gap:     string[] = m ? safeJson(m.gapCodes, []) : [];
  const bullets: string[] = m ? safeJson(m.bullets, []) : [];

  return (
    <div className="space-y-4">
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste a job description here…"
        className="w-full h-40 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:border-accent/60"
      />
      <div className="flex items-center gap-3">
        <button onClick={run} disabled={loading || jd.length < 80} className="btn-primary disabled:opacity-40">
          {loading ? "Matching…" : "Match this JD"}
        </button>
        {err && <div className="text-sm text-rose-300">{err}</div>}
      </div>

      {m && (
        <div className="glass p-5 space-y-4">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted">JD</div>
              <div className="text-lg font-semibold">{m.jdTitle}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted text-right">Fit score</div>
              <div className={`text-3xl font-extrabold ${m.fitScore >= 75 ? "text-emerald-400" : m.fitScore >= 50 ? "text-amber-400" : "text-rose-400"}`}>{m.fitScore}/100</div>
            </div>
          </div>
          {rationale && <div className="text-sm text-text-secondary border-l-2 border-accent/60 pl-3">{rationale}</div>}

          {matched.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-2">Strengths · already mastered</div>
              <div className="flex flex-wrap gap-1.5">
                {matched.map((c) => <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 font-mono">{c}</span>)}
              </div>
            </div>
          )}
          {gap.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-2">Gaps · study these next</div>
              <div className="flex flex-wrap gap-1.5">
                {gap.map((c) => <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-200 font-mono">{c}</span>)}
              </div>
            </div>
          )}
          {bullets.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-accent-light mb-2">Tailored resume bullets</div>
              <ul className="space-y-1.5 text-sm text-text-primary list-disc list-inside">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function safeJson<T>(s: string, fallback: T): T { try { return JSON.parse(s); } catch { return fallback; } }
