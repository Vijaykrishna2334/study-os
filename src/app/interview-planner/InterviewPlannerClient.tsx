"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface TopicMeta { id: string; code: string; title: string; confidence: number; tier: string; }
interface PlanData {
  id: string;
  jdTitle: string;
  interviewDate: string;
  maxPerDay: number;
  schedule: Record<string, string[]>;
  completedDays: string[];
  topicMap: Record<string, TopicMeta>;
}

const TIER_COLOR: Record<string, string> = {
  A: "text-rose-400 border-rose-400/30 bg-rose-500/10",
  B: "text-amber-400 border-amber-400/30 bg-amber-500/10",
  C: "text-blue-400 border-blue-400/30 bg-blue-500/10",
  D: "text-slate-400 border-slate-400/30 bg-slate-500/10",
};

const CONF_COLOR = (c: number) =>
  c >= 4 ? "bg-emerald-400" : c >= 2 ? "bg-amber-400" : c > 0 ? "bg-orange-500" : "bg-white/10";

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

function todayStr() { return new Date().toISOString().slice(0,10); }

export default function InterviewPlannerClient() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushMsg, setPushMsg] = useState("");

  // Form state
  const [jdTitle, setJdTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [maxPerDay, setMaxPerDay] = useState(4);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/interview-plan");
    const data = await res.json();
    setPlan(data.plan);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!jdText || !interviewDate) return;
    setCreating(true);
    await fetch("/api/interview-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jdTitle, jdText, interviewDate, maxPerDay }),
    });
    setShowForm(false);
    setJdText(""); setJdTitle(""); setInterviewDate("");
    await fetchPlan();
    setCreating(false);
  }

  async function pushToCalendar() {
    if (!plan) return;
    setPushing(true);
    setPushMsg("");
    try {
      const res = await fetch("/api/calendar/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, studyHour: 9 }),
      });
      const data = await res.json();
      setPushMsg(data.message || data.error || "Done!");
    } catch {
      setPushMsg("Failed to push. Try again.");
    }
    setPushing(false);
  }

  async function pushFullSchedule() {
    setPushing(true);
    setPushMsg("");
    try {
      const today = todayStr();
      const res = await fetch("/api/calendar/daily-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 30, startDate: today }),
      });
      const data = await res.json();
      setPushMsg(data.message || data.error || "Done!");
    } catch {
      setPushMsg("Failed to push. Try again.");
    }
    setPushing(false);
  }

  async function toggleDay(date: string, complete: boolean) {
    if (!plan) return;
    await fetch(`/api/interview-plan/${plan.id}/day`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, complete }),
    });
    setPlan(prev => {
      if (!prev) return prev;
      const days = complete
        ? [...new Set([...prev.completedDays, date])]
        : prev.completedDays.filter(d => d !== date);
      return { ...prev, completedDays: days };
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-text-muted animate-pulse">Loading plan...</div>
    </div>
  );

  const today = todayStr();

  // Stats
  const allDays = plan ? Object.keys(plan.schedule).sort() : [];
  const doneDays = plan ? plan.completedDays.length : 0;
  const totalTopics = plan ? Object.values(plan.schedule).flat().length : 0;
  const doneTopics = plan
    ? plan.completedDays.reduce((s, d) => s + (plan.schedule[d]?.length ?? 0), 0)
    : 0;
  const daysLeft = plan ? daysUntil(plan.interviewDate) : 0;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Interview Planner</div>
          <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">
            {plan ? plan.jdTitle || "My Interview Plan" : "Create Your Study Plan"}
          </h1>
          {plan && (
            <p className="text-text-secondary mt-1">
              {daysLeft > 0 ? `${daysLeft} days until interview` : daysLeft === 0 ? "Interview is TODAY! 🎯" : "Interview date passed"} ·{" "}
              {doneTopics}/{totalTopics} topics done
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-2 justify-end">
            {!showForm && (
              <button
                onClick={pushFullSchedule}
                disabled={pushing}
                className="btn-ghost text-sm disabled:opacity-50 !border-emerald-500/30 !text-emerald-400 hover:!bg-emerald-500/10"
              >
                {pushing ? "⟳ Pushing..." : "🗓️ Push Full Daily Schedule"}
              </button>
            )}
            {plan && !showForm && (
              <button
                onClick={pushToCalendar}
                disabled={pushing}
                className="btn-ghost text-sm disabled:opacity-50"
              >
                {pushing ? "⟳ Pushing..." : "📅 Push Study Only"}

              </button>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? "✕ Cancel" : plan ? "🔄 New Plan" : "🎯 Create Plan"}
            </button>
          </div>
          {pushMsg && (
            <div className={`text-xs px-3 py-1.5 rounded-lg ${
              pushMsg.includes("✅") ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
            }`}>{pushMsg}</div>
          )}
        </div>
      </header>

      {/* ── Create Form ── */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold">Set Up Your Interview Study Plan</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Job Title (optional)</label>
              <input
                value={jdTitle}
                onChange={e => setJdTitle(e.target.value)}
                placeholder="e.g. ML Engineer at Google"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Interview Date *</label>
              <input
                type="date"
                value={interviewDate}
                onChange={e => setInterviewDate(e.target.value)}
                required
                min={today}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-muted">Paste Job Description *</label>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description here. The app will score all 340 topics by relevance and schedule them day by day until your interview..."
              required
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50 resize-y"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs text-text-muted">Topics per day:</label>
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setMaxPerDay(n)}
                className={`px-3 py-1 rounded-lg text-sm border transition-all ${
                  maxPerDay === n
                    ? "border-accent bg-accent/20 text-accent-light"
                    : "border-white/10 text-text-muted hover:border-white/20"
                }`}
              >
                {n}
              </button>
            ))}
            {interviewDate && (
              <span className="text-xs text-text-muted ml-auto">
                ≈ {Math.max(0, daysUntil(interviewDate)) * maxPerDay} topics scheduled
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={creating || !jdText || !interviewDate}
            className="btn-primary w-full disabled:opacity-50"
          >
            {creating ? "⟳ Scoring topics & building schedule…" : "🗓️ Generate Day-by-Day Plan"}
          </button>
        </form>
      )}

      {/* ── Active Plan ── */}
      {plan && !showForm && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Days Remaining", value: Math.max(0, daysLeft), hint: "until interview" },
              { label: "Days Completed", value: `${doneDays}/${allDays.length}`, hint: "study days done" },
              { label: "Topics Covered", value: `${doneTopics}/${totalTopics}`, hint: "from your JD" },
              { label: "Topics/Day", value: plan.maxPerDay, hint: "your daily target" },
            ].map(s => (
              <div key={s.label} className="glass p-4">
                <div className="text-[10px] uppercase tracking-widest text-text-muted">{s.label}</div>
                <div className="text-2xl font-extrabold mt-1">{s.value}</div>
                <div className="text-xs text-text-secondary">{s.hint}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="glass p-4 space-y-2">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Overall Progress</span>
              <span>{totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${totalTopics > 0 ? (doneTopics / totalTopics) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="glass p-6 space-y-4">
            <h2 className="text-lg font-semibold">📅 Day-by-Day Schedule</h2>
            <div className="space-y-3">
              {allDays.map(day => {
                const topicIds = plan.schedule[day] ?? [];
                const isDone = plan.completedDays.includes(day);
                const isToday = day === today;
                const isPast = day < today && !isDone;
                const isFuture = day > today;

                return (
                  <div
                    key={day}
                    className={`rounded-xl border p-4 transition-all ${
                      isDone
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : isToday
                        ? "border-blue-400/50 bg-blue-500/10 ring-1 ring-blue-400/30"
                        : isPast
                        ? "border-rose-500/20 bg-rose-500/5"
                        : "border-white/8 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Day checkbox */}
                        <button
                          onClick={() => toggleDay(day, !isDone)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isDone
                              ? "border-emerald-400 bg-emerald-400 text-black"
                              : "border-white/20 hover:border-emerald-400"
                          }`}
                        >
                          {isDone && <span className="text-xs font-bold">✓</span>}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {new Date(day + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short", month: "short", day: "numeric"
                              })}
                            </span>
                            {isToday && (
                              <span className="text-[9px] uppercase tracking-widest text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                                Today
                              </span>
                            )}
                            {isPast && (
                              <span className="text-[9px] uppercase tracking-widest text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full">
                                Missed
                              </span>
                            )}
                          </div>

                          {/* Topics for this day */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {topicIds.map(tid => {
                              const t = plan.topicMap[tid];
                              if (!t) return null;
                              return (
                                <Link
                                  key={tid}
                                  href={`/topics/${tid}`}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] transition-all hover:opacity-80 ${TIER_COLOR[t.tier] ?? TIER_COLOR.B}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${CONF_COLOR(t.confidence)}`} />
                                  <span className="font-mono font-semibold">{t.code}</span>
                                  <span className="text-text-secondary max-w-[120px] truncate">{t.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs text-text-muted flex-shrink-0">
                        {topicIds.length} topic{topicIds.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="glass p-4 flex flex-wrap gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400" />Topic mastered (confidence 4-5)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" />In progress (confidence 2-3)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" />Started (confidence 1)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-white/10" />Not started</div>
            <div className="flex items-center gap-2 ml-auto">Tier: <span className="text-rose-400">A=Must</span> <span className="text-amber-400">B=Core</span> <span className="text-blue-400">C=Good</span></div>
          </div>
        </>
      )}

      {/* ── Empty state ── */}
      {!plan && !showForm && (
        <div className="glass p-16 text-center space-y-4">
          <div className="text-6xl">🎯</div>
          <h2 className="text-2xl font-bold">No Active Study Plan</h2>
          <p className="text-text-secondary max-w-md mx-auto">
            Paste a job description, set your interview date, and get a personalized
            day-by-day study schedule — completely free, no AI credits used.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            Create My Plan →
          </button>
        </div>
      )}
    </div>
  );
}
