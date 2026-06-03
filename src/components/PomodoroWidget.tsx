"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const WORK_MIN = 25;
const SHORT_BREAK = 5;
const LONG_BREAK = 15;

type Phase = "work" | "short" | "long";

export default function PomodoroWidget() {
  const [open, setOpen]       = useState(false);
  const [phase, setPhase]     = useState<Phase>("work");
  const [secsLeft, setSecsLeft] = useState(WORK_MIN * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(0); // completed work sessions
  const intervalRef           = useRef<NodeJS.Timeout | null>(null);

  const totalSecs = phase === "work" ? WORK_MIN * 60 : phase === "short" ? SHORT_BREAK * 60 : LONG_BREAK * 60;
  const pct = ((totalSecs - secsLeft) / totalSecs) * 100;
  const mins = Math.floor(secsLeft / 60).toString().padStart(2, "0");
  const secs = (secsLeft % 60).toString().padStart(2, "0");

  const tick = useCallback(() => {
    setSecsLeft(s => {
      if (s <= 1) {
        setRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Advance phase
        setSession(prev => {
          const next = prev + (phase === "work" ? 1 : 0);
          const nextPhase: Phase = phase === "work"
            ? (next % 4 === 0 ? "long" : "short")
            : "work";
          setPhase(nextPhase);
          setSecsLeft((nextPhase === "work" ? WORK_MIN : nextPhase === "short" ? SHORT_BREAK : LONG_BREAK) * 60);
          return next;
        });
        // Play a soft chime (browser beep)
        try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...").play().catch(()=>{}); } catch {}
        return 0;
      }
      return s - 1;
    });
  }, [phase]);

  function start() {
    setRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }

  function pause() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function reset() {
    pause();
    setSecsLeft(WORK_MIN * 60);
    setPhase("work");
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Update document title when running
  useEffect(() => {
    if (running) document.title = `${mins}:${secs} — ${phase === "work" ? "Focus" : "Break"} | Study OS`;
    else document.title = "Study OS";
  }, [running, mins, secs, phase]);

  const phaseLabel = phase === "work" ? "🍅 Focus" : phase === "short" ? "☕ Short Break" : "🌿 Long Break";
  const phaseColor = phase === "work" ? "from-rose-500 to-orange-400" : phase === "short" ? "from-blue-500 to-cyan-400" : "from-emerald-500 to-teal-400";

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-rose-500/90 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center text-2xl transition-all hover:scale-110"
        title="Pomodoro Timer"
      >
        {running ? `${mins}` : "🍅"}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-72 glass border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 animate-[fadeInUp_0.2s_ease-out]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{phaseLabel}</span>
            <div className="flex items-center gap-1">
              {[...Array(4)].map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i < (session % 4) ? "bg-rose-400" : "bg-white/10"}`} />
              ))}
            </div>
          </div>

          {/* Circular timer */}
          <div className="flex justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="8"/>
                <circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke="url(#timerGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct/100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={phase==="work"?"#f43f5e":"#3b82f6"}/>
                    <stop offset="100%" stopColor={phase==="work"?"#fb923c":"#06b6d4"}/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-mono font-bold">{mins}:{secs}</div>
                <div className="text-[10px] text-text-muted">{phase === "work" ? "focus" : "break"}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <button onClick={reset} className="btn-ghost text-xs">↺ Reset</button>
            {running
              ? <button onClick={pause} className="btn-primary text-sm !bg-rose-600">⏸ Pause</button>
              : <button onClick={start} className="btn-primary text-sm !bg-rose-600">▶ Start</button>
            }
          </div>

          {/* Phase switcher */}
          <div className="flex gap-1">
            {(["work", "short", "long"] as Phase[]).map(p => (
              <button
                key={p}
                onClick={() => { pause(); setPhase(p); setSecsLeft((p==="work"?WORK_MIN:p==="short"?SHORT_BREAK:LONG_BREAK)*60); }}
                className={`flex-1 py-1 rounded-lg text-[10px] border transition-all ${
                  phase === p ? "border-white/30 bg-white/10" : "border-white/5 text-text-muted hover:border-white/10"
                }`}
              >
                {p === "work" ? "25m" : p === "short" ? "5m" : "15m"}
              </button>
            ))}
          </div>

          <div className="text-center text-[10px] text-text-muted">
            Session {session + 1} · {session} completed today
          </div>
        </div>
      )}
    </>
  );
}
