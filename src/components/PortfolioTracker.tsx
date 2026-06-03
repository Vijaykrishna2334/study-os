"use client";
import { useEffect, useState } from "react";

type Repo = { id: string; slug: string; name: string; url: string; description: string; status: string; readme: string; stars: number };

const STATUS = ["planned", "building", "shipped"] as const;
const STATUS_COLOR: Record<string, string> = {
  planned:  "bg-slate-500/15 text-slate-300 border-slate-500/30",
  building: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  shipped:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export default function PortfolioTracker() {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    fetch("/api/portfolio").then((r) => r.json()).then((d) => setRepos(d.repos || []));
  }, []);

  async function update(id: string, patch: Partial<Repo>) {
    const r = await fetch("/api/portfolio", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const d = await r.json();
    if (d.repo) setRepos((p) => p.map((x) => x.id === id ? d.repo : x));
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {repos.map((r) => (
        <div key={r.id} className="glass p-5 space-y-3 hover-lift">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted">{r.slug}</div>
              <div className="text-base font-bold">{r.name}</div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${STATUS_COLOR[r.status] || ""}`}>{r.status}</span>
          </div>
          <div className="text-xs text-text-secondary leading-relaxed">{r.description}</div>
          <input
            value={r.url}
            onChange={(e) => setRepos((p) => p.map((x) => x.id === r.id ? { ...x, url: e.target.value } : x))}
            onBlur={() => update(r.id, { url: r.url })}
            placeholder="https://github.com/you/repo"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent/60"
          />
          <div className="flex gap-1.5 flex-wrap">
            {STATUS.map((s) => (
              <button
                key={s}
                onClick={() => update(r.id, { status: s })}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                  r.status === s ? STATUS_COLOR[s] : "border-white/10 text-text-muted hover:bg-white/5"
                }`}
              >{s}</button>
            ))}
          </div>
          {r.url && (
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline">Open repo ↗</a>
          )}
        </div>
      ))}
    </div>
  );
}
