"use client";
import { useEffect, useState } from "react";
import MarkdownView from "./MarkdownView";

type Task = { day: number; task: string; category: string; done?: boolean };
type Prep = { id: string; company: string; role: string; interviewDate: string; roundType: string; plan: string; tasksJSON: string; notes: string };

const ROUNDS = ["phone","technical","onsite","behavioral","system_design"] as const;
const CAT_COLOR: Record<string,string> = {
  drill: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  mock:  "bg-rose-500/15 text-rose-300 border-rose-500/30",
  system:"bg-violet-500/15 text-violet-300 border-violet-500/30",
  behavioral:"bg-amber-500/15 text-amber-300 border-amber-500/30",
  company:"bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  rest:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export default function InterviewPrepClient() {
  const [list, setList] = useState<Prep[]>([]);
  const [active, setActive] = useState<Prep | null>(null);
  const [form, setForm] = useState({ company: "", role: "", interviewDate: "", roundType: "technical" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    const d = await (await fetch("/api/interview-prep")).json();
    setList(d.list || []);
    if (!active && d.list?.[0]) setActive(d.list[0]);
  }

  async function generate() {
    if (!form.company || !form.role || !form.interviewDate) { setErr("Fill all fields"); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/interview-prep", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "generation failed");
      setActive(d.prep); setForm({ company: "", role: "", interviewDate: "", roundType: "technical" });
      await refresh();
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function toggleTask(i: number) {
    if (!active) return;
    const tasks: Task[] = safeJSON(active.tasksJSON, []);
    tasks[i] = { ...tasks[i], done: !tasks[i].done };
    const r = await fetch("/api/interview-prep", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: active.id, tasksJSON: JSON.stringify(tasks) }),
    });
    const d = await r.json();
    if (d.prep) setActive(d.prep);
  }

  async function remove(id: string) {
    if (!confirm("Delete this prep plan?")) return;
    await fetch("/api/interview-prep", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setActive(null);
    await refresh();
  }

  const tasks: Task[] = active ? safeJSON(active.tasksJSON, []) : [];
  const byDay = new Map<number, Task[]>();
  tasks.forEach((t, i) => {
    if (!byDay.has(t.day)) byDay.set(t.day, []);
    byDay.get(t.day)!.push({ ...t, day: t.day });
  });
  const indexOf = (t: Task) => tasks.indexOf(t);
  const daysToInterview = active ? Math.max(0, Math.ceil((new Date(active.interviewDate).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6">
      <aside className="space-y-4">
        <div className="glass p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-text-muted">New prep plan</div>
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company (e.g. Anthropic)"
                 className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role (e.g. ML Engineer L5)"
                 className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
          <input type="date" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                 className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
          <select value={form.roundType} onChange={(e) => setForm({ ...form, roundType: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60">
            {ROUNDS.map((r) => <option key={r} value={r} className="bg-bg-secondary">{r}</option>)}
          </select>
          <button onClick={generate} disabled={loading} className="btn-primary w-full disabled:opacity-40">
            {loading ? "Generating plan…" : "Generate plan"}
          </button>
          {err && <div className="text-xs text-rose-300">{err}</div>}
        </div>

        {list.length > 0 && (
          <div className="glass p-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Saved plans ({list.length})</div>
            <div className="space-y-1">
              {list.map((p) => {
                const d = Math.max(0, Math.ceil((new Date(p.interviewDate).getTime() - Date.now()) / 86400000));
                return (
                  <button key={p.id} onClick={() => setActive(p)}
                          className={`block w-full text-left px-2 py-1.5 rounded-lg text-xs transition ${active?.id === p.id ? "bg-accent/15 text-accent-light" : "hover:bg-white/5 text-text-secondary"}`}>
                    <div className="font-medium">{p.company} · {p.role}</div>
                    <div className="text-[10px] text-text-muted">{new Date(p.interviewDate).toLocaleDateString()} · {d}d away · {p.roundType}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      <div>
        {!active ? (
          <div className="glass p-10 text-center text-text-secondary">Generate a plan to begin.</div>
        ) : (
          <div className="space-y-5">
            <div className="glass p-6">
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold gradient-text">{active.company} — {active.role}</h2>
                  <div className="text-xs text-text-secondary mt-1">
                    {active.roundType.toUpperCase()} · {new Date(active.interviewDate).toLocaleDateString()} · {daysToInterview} days away
                  </div>
                </div>
                <button onClick={() => remove(active.id)} className="text-xs text-rose-400 hover:underline">Delete</button>
              </div>
            </div>

            {/* Task checklist by day */}
            <div className="glass p-5">
              <div className="text-xs uppercase tracking-widest text-text-muted mb-3">Day-by-day tasks</div>
              <div className="space-y-4">
                {[...byDay.keys()].sort((a,b) => a - b).map((day) => (
                  <div key={day}>
                    <div className="text-sm font-bold mb-2">Day {day}</div>
                    <div className="space-y-1.5">
                      {byDay.get(day)!.map((t) => {
                        const idx = indexOf(t);
                        const cat = (t.category || "drill").toLowerCase();
                        return (
                          <button key={idx} onClick={() => toggleTask(idx)}
                                  className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg border transition hover:border-accent/30 ${t.done ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" : "border-white/8 bg-white/[0.02]"}`}>
                            <span className={`mt-0.5 w-4 h-4 rounded border ${t.done ? "bg-emerald-400 border-emerald-400" : "border-white/30"} flex items-center justify-center text-[10px] text-bg-primary`}>{t.done ? "✓" : ""}</span>
                            <span className="flex-1 text-sm">{t.task}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CAT_COLOR[cat] || "border-white/10 text-text-muted"}`}>{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {active.plan && (
              <details className="glass p-5" open>
                <summary className="cursor-pointer text-xs uppercase tracking-widest text-text-muted">Full plan (Gemini)</summary>
                <div className="mt-3"><MarkdownView content={active.plan} /></div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function safeJSON<T>(s: string, fallback: T): T { try { return JSON.parse(s); } catch { return fallback; } }
