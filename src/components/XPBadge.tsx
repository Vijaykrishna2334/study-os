"use client";
import { useEffect, useState } from "react";

interface XPData { totalXP: number; level: number; xpInLevel: number; xpToNext: number; }

const LEVEL_TITLES = [
  "", "Beginner", "Learner", "Student", "Scholar", "Practitioner",
  "Developer", "Engineer", "Expert", "Master", "Grandmaster",
];

export default function XPBadge() {
  const [xp, setXp] = useState<XPData | null>(null);

  useEffect(() => {
    fetch("/api/xp").then(r => r.json()).then(setXp).catch(() => {});
  }, []);

  if (!xp) return null;

  const pct = Math.round((xp.xpInLevel / 500) * 100);
  const title = LEVEL_TITLES[Math.min(xp.level, LEVEL_TITLES.length - 1)] || `Level ${xp.level}`;

  return (
    <div className="glass p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <div className="text-xs text-text-muted uppercase tracking-widest">Level {xp.level}</div>
            <div className="text-sm font-bold gradient-text">{title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold tabular-nums">{xp.totalXP.toLocaleString()}</div>
          <div className="text-[10px] text-text-muted">total XP</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>{xp.xpInLevel} / 500 XP</span>
          <span>{xp.xpToNext} to next level</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
