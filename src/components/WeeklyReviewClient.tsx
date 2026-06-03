"use client";
import { useEffect, useState } from "react";
import MarkdownView from "./MarkdownView";

type Review = { id: string; weekStart: string; summary: string; hoursStudied: number; topicsMastered: number; generatedAt: string };

export default function WeeklyReviewClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/weekly-review").then((r) => r.json()).then((d) => setReviews(d.reviews || []));
  }, []);

  async function generate(force = false) {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/weekly-review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      setReviews((p) => {
        const without = p.filter((x) => x.weekStart !== d.review.weekStart);
        return [d.review, ...without];
      });
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => generate(false)} disabled={loading} className="btn-primary disabled:opacity-40">
          {loading ? "Analysing your week…" : "Generate this week's review"}
        </button>
        <button onClick={() => generate(true)} disabled={loading} className="btn-ghost text-xs">Regenerate</button>
        {err && <span className="text-sm text-rose-300">{err}</span>}
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="glass p-5">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-text-muted">Week of</div>
                <div className="text-sm font-semibold">{r.weekStart}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-secondary tabular-nums">{r.hoursStudied}h studied · {r.topicsMastered} total mastered</div>
              </div>
            </div>
            <MarkdownView content={r.summary} />
          </div>
        ))}
        {reviews.length === 0 && !loading && (
          <div className="glass p-8 text-center text-text-muted text-sm">No reviews yet. Click "Generate this week's review" — Gemini analyses your last 7 days and writes a plan for next week.</div>
        )}
      </div>
    </div>
  );
}
