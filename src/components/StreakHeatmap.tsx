"use client";
import { useEffect, useState } from "react";

type Day = { date: string; minutes: number; topicsTouched: number; reads: number; quizzes: number };

export default function StreakHeatmap() {
  const [data, setData] = useState<{ streak: number; days: Day[] } | null>(null);

  useEffect(() => {
    fetch("/api/streak").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="glass p-5"><div className="text-xs text-text-muted">Loading streak…</div></div>;

  const map = new Map<string, Day>();
  data.days.forEach((d) => map.set(d.date, d));
  // Build 53 weeks × 7 days grid ending today
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells: { date: string; level: number; minutes: number }[] = [];
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const entry = map.get(key);
    const m = entry?.minutes || 0;
    const level = m === 0 ? 0 : m < 30 ? 1 : m < 90 ? 2 : m < 180 ? 3 : 4;
    cells.push({ date: key, level, minutes: m });
  }
  const palette = ["bg-white/[0.04]", "bg-emerald-500/20", "bg-emerald-500/40", "bg-emerald-500/65", "bg-emerald-400"];

  return (
    <div className="glass p-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">Streak · last 366 days</div>
          <div className="text-2xl font-extrabold mt-1">
            <span className="gradient-text">{data.streak}</span>
            <span className="text-text-muted text-sm font-medium ml-2">day streak</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          less
          {palette.map((c, i) => <span key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />)}
          more
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-flow-col grid-rows-7 gap-[2px] w-max">
          {cells.map((c) => (
            <span
              key={c.date}
              title={`${c.date} · ${c.minutes} min`}
              className={`w-2.5 h-2.5 rounded-sm ${palette[c.level]}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
