"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AnalyticsData {
  totalXP: number; level: number;
  totalTopics: number; mastered: number; quizPassed: number; artifacts: number;
  totalMinutes: number; streakDays: number;
  byPhase: Record<number, { total: number; mastered: number }>;
  confDist: { label: string; count: number }[];
  last30: { date: string; minutes: number; topics: number; quizzes: number }[];
}

function Bar({ value, max, color = "bg-accent" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-text-muted tabular-nums w-8 text-right">{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-text-muted animate-pulse">Loading analytics…</div>
  );
  if (!data) return null;

  const masteredPct = Math.round((data.mastered / data.totalTopics) * 100);
  const hours = Math.floor(data.totalMinutes / 60);
  const mins  = data.totalMinutes % 60;
  const maxTopics = Math.max(...data.last30.map(d => d.topics), 1);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Study Analytics</div>
        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Your Progress</h1>
      </header>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Mastered", value: `${data.mastered}/${data.totalTopics}`, sub: `${masteredPct}% complete`, color: true },
          { label: "XP Earned", value: data.totalXP.toLocaleString(), sub: `Level ${data.level}` },
          { label: "Focus Time", value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`, sub: "via Pomodoro" },
          { label: "Active Days", value: data.streakDays, sub: "days studied" },
        ].map(s => (
          <div key={s.label} className={`glass p-5 ${s.color ? "ring-1 ring-accent/30" : ""}`}>
            <div className="text-[11px] uppercase tracking-widest text-text-muted">{s.label}</div>
            <div className={`text-3xl font-extrabold mt-1 ${s.color ? "gradient-text" : ""}`}>{s.value}</div>
            <div className="text-xs text-text-secondary mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Last 30 days activity chart */}
      <div className="glass p-6 space-y-3">
        <h2 className="text-base font-semibold">Last 30 Days Activity</h2>
        <div className="flex items-end gap-[3px] h-24">
          {data.last30.length === 0
            ? <div className="text-xs text-text-muted">No activity data yet — start studying!</div>
            : data.last30.map(d => {
                const h = maxTopics > 0 ? Math.round((d.topics / maxTopics) * 96) : 0;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-accent/60 hover:bg-accent rounded-t-sm transition-all cursor-default"
                      style={{ height: `${h}px` }}
                    />
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-bg-secondary border border-white/10 rounded-lg px-2 py-1 text-[10px] z-10 whitespace-nowrap">
                      <span className="font-semibold">{d.date}</span>
                      <span>{d.topics} topics · {d.quizzes} quizzes</span>
                    </div>
                  </div>
                );
              })}
        </div>
        <div className="text-[10px] text-text-muted">Each bar = topics touched that day. Hover for details.</div>
      </div>

      {/* Confidence distribution */}
      <div className="glass p-6 space-y-3">
        <h2 className="text-base font-semibold">Confidence Distribution</h2>
        <div className="space-y-2">
          {data.confDist.map((c, i) => {
            const colors = [
              "bg-white/20", "bg-rose-500/60", "bg-orange-500/60",
              "bg-amber-400/60", "bg-emerald-400/60", "bg-emerald-400",
            ];
            return (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-24">{c.label}</span>
                <Bar value={c.count} max={data.totalTopics} color={colors[i]} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase progress */}
      <div className="glass p-6 space-y-3">
        <h2 className="text-base font-semibold">Progress by Phase</h2>
        <div className="space-y-2">
          {Object.entries(data.byPhase)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([phase, { total, mastered }]) => (
              <div key={phase} className="flex items-center gap-3">
                <Link href={`/topics?phase=${phase}`} className="text-xs text-text-muted w-16 hover:text-accent-light">
                  Phase {phase}
                </Link>
                <Bar value={mastered} max={total} color="bg-gradient-to-r from-accent to-accent-violet" />
                <span className="text-xs text-text-muted w-16 text-right">{mastered}/{total}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Quick achievements */}
      <div className="glass p-6 space-y-3">
        <h2 className="text-base font-semibold">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "📚", label: "First Read",      done: data.mastered > 0 },
            { icon: "✅", label: "Quiz Passed",     done: data.quizPassed > 0 },
            { icon: "🏗️", label: "First Artifact",  done: data.artifacts > 0 },
            { icon: "🔥", label: "7-Day Streak",    done: data.streakDays >= 7 },
            { icon: "🎯", label: "10 Mastered",     done: data.mastered >= 10 },
            { icon: "⚡", label: "1000 XP",         done: data.totalXP >= 1000 },
            { icon: "🏆", label: "50 Mastered",     done: data.mastered >= 50 },
            { icon: "💎", label: "Level 10",        done: data.level >= 10 },
          ].map(a => (
            <div
              key={a.label}
              className={`p-3 rounded-xl border text-center transition-all ${
                a.done
                  ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-300"
                  : "border-white/5 bg-white/[0.02] text-text-muted opacity-40"
              }`}
            >
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-[11px] font-medium">{a.label}</div>
              {a.done && <div className="text-[9px] text-yellow-400 mt-0.5">Unlocked ✓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
