"use client";
import { useState } from "react";
import Link from "next/link";

type Hit = { id: string; code?: string; title?: string; phase?: number; uri?: string; snippet?: string };

export default function SearchClient() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);

  async function run(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setErr(""); setHits([]); setElapsed(null);
    const t0 = performance.now();
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim(), pageSize: 15 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "search failed");
      setHits(data.results || []);
      setElapsed(performance.now() - t0);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="glass p-4 flex gap-3 items-center">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search anything across all 12 phases…"
          className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-text-muted"
        />
        <button type="submit" disabled={loading || !q.trim()} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {err && (
        <div className="glass p-4 text-rose-300 text-sm border-rose-500/30">
          {err}
          <div className="text-text-muted text-xs mt-2">
            If this is the first run, the index may still be building. Wait 5–10 min after running <code className="text-accent-light">npm run gcp-ingest</code>.
          </div>
        </div>
      )}

      {elapsed !== null && (
        <div className="text-xs text-text-muted">
          {hits.length} results in {elapsed.toFixed(0)} ms
        </div>
      )}

      <div className="space-y-2">
        {hits.map((h) => (
          <Link
            key={h.id}
            href={h.code ? `/topics?q=${encodeURIComponent(h.code)}` : "#"}
            className="glass p-4 block hover-lift hover:border-accent/30"
          >
            <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-mono text-text-muted">{h.code}</span>
                <span className="text-sm font-semibold">{h.title}</span>
              </div>
              {h.phase !== undefined && <span className="text-[10px] text-text-muted">Phase {h.phase}</span>}
            </div>
            {h.snippet && (
              <div
                className="text-xs text-text-secondary leading-relaxed mt-1 [&_b]:text-accent-light [&_b]:font-semibold"
                dangerouslySetInnerHTML={{ __html: h.snippet }}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
