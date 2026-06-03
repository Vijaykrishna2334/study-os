"use client";
import { useEffect, useState } from "react";

interface GcpCredit {
  id: string;
  name: string;
  original: number;
  remaining: number;
  type: "one-time" | "monthly";
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function pct(remaining: number, original: number) {
  if (!original) return 0;
  return Math.min(100, Math.round((remaining / original) * 100));
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function barColor(p: number) {
  if (p > 60) return "from-emerald-500 to-emerald-400";
  if (p > 25) return "from-amber-500 to-yellow-400";
  return "from-rose-600 to-red-400";
}

// ──────────────────────────────────────────────────────────────────────────────
// Compact version — for Sidebar
// ──────────────────────────────────────────────────────────────────────────────
export function GcpCreditsSidebar() {
  const [credits, setCredits] = useState<GcpCredit[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    fetch("/api/billing-credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits || []));
  }, []);

  function startEdit(c: GcpCredit) {
    setEditing(c.id);
    setDraft(String(c.remaining));
  }

  async function saveEdit(c: GcpCredit) {
    const val = parseFloat(draft);
    if (isNaN(val)) { setEditing(null); return; }
    const updated = credits.map((x) =>
      x.id === c.id ? { ...x, remaining: val } : x
    );
    setCredits(updated);
    setEditing(null);
    await fetch("/api/billing-credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ credits: updated }),
    });
  }

  if (!credits.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="text-[9px] uppercase tracking-[0.2em] text-text-muted mb-2 flex items-center gap-1">
        <span className="text-emerald-400">●</span> GCP Credits
      </div>
      <div className="space-y-2">
        {credits.map((c) => {
          const p = pct(c.remaining, c.original);
          return (
            <div key={c.id} className="group">
              <div className="flex items-center justify-between mb-[3px]">
                <span className="text-[10px] text-text-muted truncate max-w-[110px]" title={c.name}>
                  {c.type === "monthly" ? "🔄" : "⚡"} {c.name.replace("Developer Program (Monthly) ", "Dev ").replace("GenAI App Builder Trial", "GenAI Builder")}
                </span>
                {editing === c.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-text-muted">₹</span>
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => saveEdit(c)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(c)}
                      className="w-16 text-[10px] bg-white/10 border border-accent/40 rounded px-1 py-0.5 outline-none"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(c)}
                    className="text-[10px] tabular-nums text-text-secondary hover:text-accent-light transition-colors"
                    title="Click to update remaining"
                  >
                    {fmt(c.remaining)}
                  </button>
                )}
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${barColor(p)} transition-all duration-700`}
                  style={{ width: `${p}%` }}
                />
              </div>
              <div className="text-[9px] text-text-muted mt-0.5 text-right">{p}% left</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Full cards — each credit gets its own separate card on the Dashboard
// ──────────────────────────────────────────────────────────────────────────────
export default function GcpCreditsCard() {
  const [credits, setCredits] = useState<GcpCredit[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/billing-credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits || []));
  }, []);

  function startEdit(c: GcpCredit) {
    setEditing(c.id);
    setDraft(String(c.remaining));
  }

  async function saveEdit(c: GcpCredit) {
    const val = parseFloat(draft);
    if (isNaN(val)) { setEditing(null); return; }
    const updated = credits.map((x) =>
      x.id === c.id ? { ...x, remaining: val } : x
    );
    setCredits(updated);
    setEditing(null);
    await fetch("/api/billing-credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ credits: updated }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!credits.length) return null;

  return (
    <div className="space-y-3">
      {/* Section label */}
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-text-muted flex items-center gap-2">
          <span className="text-emerald-400">●</span> GCP Credits
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-400 animate-pulse">✓ Saved</span>}
          <a
            href="https://console.cloud.google.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-accent-light hover:underline"
          >
            GCP Console →
          </a>
        </div>
      </div>

      {/* One card per credit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {credits.map((c) => {
          const p = pct(c.remaining, c.original);
          const used = c.original - c.remaining;
          const isLarge = c.original > 10000; // GenAI Builder

          return (
            <div
              key={c.id}
              className={`glass p-5 rounded-2xl border transition-all hover-lift ${
                isLarge
                  ? "border-violet-500/20 bg-violet-500/[0.03] ring-1 ring-violet-500/10"
                  : "border-white/5"
              }`}
            >
              {/* Type badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  c.type === "monthly"
                    ? "text-blue-400 border-blue-400/30 bg-blue-400/5"
                    : "text-violet-400 border-violet-400/30 bg-violet-400/5"
                }`}>
                  {c.type === "monthly" ? "🔄 Monthly" : "⚡ One-time"}
                </span>
                <span className="text-[10px] text-text-muted">
                  {p}% left
                </span>
              </div>

              {/* Credit name */}
              <div className="text-xs text-text-muted mb-1 truncate" title={c.name}>
                {c.name}
              </div>

              {/* Remaining — click to edit */}
              {editing === c.id ? (
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-text-muted text-sm">₹</span>
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => saveEdit(c)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(c)}
                    className="flex-1 text-xl font-bold bg-white/10 border border-accent/40 rounded-lg px-2 py-1 outline-none font-mono"
                  />
                </div>
              ) : (
                <button
                  onClick={() => startEdit(c)}
                  className="group flex items-baseline gap-1 mb-3 hover:text-accent-light transition-colors"
                  title="Click to update"
                >
                  <span className={`font-extrabold tabular-nums ${isLarge ? "text-3xl" : "text-2xl"}`}>
                    {fmt(c.remaining)}
                  </span>
                  <span className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    ✎ edit
                  </span>
                </button>
              )}

              {/* Progress bar */}
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full bg-gradient-to-r ${barColor(p)} transition-all duration-700`}
                  style={{ width: `${p}%` }}
                />
              </div>

              {/* Used / original */}
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Used: {fmt(used)}</span>
                <span>of {fmt(c.original)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-text-muted text-center">
        Click any balance above to update it from the GCP console
      </p>
    </div>
  );
}

