"use client";
import { useEffect, useState } from "react";

interface GoalData {
  daysLeft: number;
  targetDate: string;
  today: { jobsApplied: number; linkedinPosts: number; freelanceProposals: number; topicsStudied: number };
  totals: { jobsApplied: number; linkedinPosts: number; freelanceProposals: number; earnedINR: number; totalApps: number };
  targets: { jobsApplied: number; linkedinPosts: number; freelanceProposals: number; topicsStudied: number };
}

const TOTAL_DAYS = 61; // May 23 → Jul 23

function Ring({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        className="transition-all duration-700"
      />
    </svg>
  );
}

export default function GoalCountdown() {
  const [data, setData] = useState<GoalData | null>(null);
  const [bumping, setBumping] = useState<string | null>(null);

  const fetch_ = () => fetch("/api/goal-stats").then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { fetch_(); }, []);

  async function bump(field: string) {
    setBumping(field);
    await fetch("/api/goal-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field }),
    });
    await fetch_();
    setBumping(null);
  }

  if (!data) return null;

  const daysPassed = TOTAL_DAYS - data.daysLeft;
  const progress = Math.round((daysPassed / TOTAL_DAYS) * 100);

  const items = [
    { field: "jobsApplied",       icon: "💼", label: "Jobs Applied",    done: data.today.jobsApplied,        target: data.targets.jobsApplied,       total: data.totals.jobsApplied,      color: "#818cf8" },
    { field: "linkedinPosts",     icon: "🔗", label: "LinkedIn Post",   done: data.today.linkedinPosts,      target: data.targets.linkedinPosts,     total: data.totals.linkedinPosts,    color: "#34d399" },
    { field: "freelanceProposals",icon: "💰", label: "Freelance Sent",  done: data.today.freelanceProposals, target: data.targets.freelanceProposals, total: data.totals.freelanceProposals, color: "#fbbf24" },
    { field: "topicsStudied",     icon: "📚", label: "Topics Studied",  done: data.today.topicsStudied,      target: data.targets.topicsStudied,     total: null,                         color: "#c084fc" },
  ];

  return (
    <div className="glass p-5 space-y-4">
      {/* Header — countdown */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted">Job Goal Countdown</div>
          <div className="text-2xl font-extrabold mt-0.5">
            <span className={data.daysLeft <= 14 ? "text-rose-400" : "gradient-text"}>{data.daysLeft}</span>
            <span className="text-sm font-normal text-text-muted ml-1">days left</span>
          </div>
          <div className="text-xs text-text-muted">Target: July 23, 2026 🎯</div>
        </div>
        <div className="relative flex items-center justify-center">
          <Ring pct={progress / 100} color="#818cf8" size={72} />
          <div className="absolute text-center">
            <div className="text-sm font-bold">{progress}%</div>
            <div className="text-[9px] text-text-muted">done</div>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-violet-400 transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>Day {daysPassed}</span><span>Day {TOTAL_DAYS}</span>
        </div>
      </div>

      {/* Today's daily targets */}
      <div className="text-[10px] uppercase tracking-widest text-text-muted pt-1">Today's Targets</div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => {
          const pct = Math.min(item.done / item.target, 1);
          const done = item.done >= item.target;
          return (
            <button
              key={item.field}
              onClick={() => bump(item.field)}
              disabled={bumping === item.field}
              className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${
                done ? "border-emerald-500/30 bg-emerald-500/8" : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{item.icon}</span>
                <Ring pct={pct} color={done ? "#34d399" : item.color} size={28} />
              </div>
              <div className="text-[11px] font-semibold">{item.label}</div>
              <div className="text-[10px] text-text-muted mt-0.5">
                <span className={done ? "text-emerald-400 font-bold" : ""}>{item.done}</span>/{item.target} today
                {item.total !== null && <span className="ml-1 opacity-60">· {item.total} total</span>}
              </div>
              {done && <div className="text-[9px] text-emerald-400 mt-1">✓ Done!</div>}
            </button>
          );
        })}
      </div>

      {/* Freelance earned */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-xs text-text-muted">💰 Freelance Earned</span>
        <span className="text-sm font-bold text-yellow-400">
          ₹{data.totals.earnedINR.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="text-[9px] text-text-muted text-center">
        Tap any card to log +1 for today
      </div>
    </div>
  );
}
