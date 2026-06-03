"use client";
import { useEffect, useState } from "react";

type App = {
  id: string; company: string; role: string; source: string; jdUrl: string; status: string;
  appliedAt: string; nextActionAt: string | null; nextAction: string; salaryRange: string;
  location: string; remote: boolean; notes: string; fitScore: number;
};

const STATUSES = ["applied","screen","technical","onsite","offer","rejected","withdrew"] as const;
const STATUS_COLOR: Record<string, string> = {
  applied:   "bg-slate-500/15 text-slate-300 border-slate-500/30",
  screen:    "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  technical: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  onsite:    "bg-violet-500/15 text-violet-300 border-violet-500/30",
  offer:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected:  "bg-rose-500/15 text-rose-300 border-rose-500/30",
  withdrew:  "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function ApplicationsClient() {
  const [data, setData] = useState<{ apps: App[]; counts: Record<string, number>; total: number } | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<App | null>(null);
  const [form, setForm] = useState<Partial<App>>({});
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    const d = await (await fetch("/api/applications")).json();
    setData(d);
  }

  async function add() {
    if (!form.company || !form.role) return;
    await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setAdding(false); setForm({}); await refresh();
  }
  async function update(id: string, patch: Partial<App>) {
    await fetch("/api/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    await refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this application?")) return;
    await fetch("/api/applications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await refresh();
  }

  if (!data) return <div className="glass p-6 text-text-muted">Loading…</div>;

  const visible = filterStatus ? data.apps.filter((a) => a.status === filterStatus) : data.apps;

  return (
    <div className="space-y-6">
      {/* Funnel */}
      <section className="glass p-5">
        <div className="text-xs uppercase tracking-widest text-text-muted mb-3">Funnel · {data.total} total applications</div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {STATUSES.map((s) => {
            const n = data.counts[s] || 0;
            return (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                      className={`p-3 rounded-lg border text-left transition ${filterStatus === s ? "ring-2 ring-accent" : ""} ${STATUS_COLOR[s]}`}>
                <div className="text-[10px] uppercase tracking-widest">{s}</div>
                <div className="text-2xl font-extrabold tabular-nums mt-1">{n}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button onClick={() => { setAdding(true); setForm({}); }} className="btn-primary text-sm">+ Add application</button>
          {filterStatus && <button onClick={() => setFilterStatus("")} className="btn-ghost text-xs">Clear filter</button>}
        </div>
        <div className="text-xs text-text-muted">Showing {visible.length}</div>
      </div>

      {/* Add / edit form */}
      {(adding || editing) && (
        <div className="glass p-5 space-y-3 ring-1 ring-accent/30">
          <div className="text-xs uppercase tracking-widest text-accent-light">{editing ? "Edit application" : "New application"}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Company *" value={form.company || ""} onChange={(v) => setForm({ ...form, company: v })} />
            <Field label="Role *" value={form.role || ""} onChange={(v) => setForm({ ...form, role: v })} />
            <Field label="JD URL" value={form.jdUrl || ""} onChange={(v) => setForm({ ...form, jdUrl: v })} />
            <Field label="Salary range" value={form.salaryRange || ""} onChange={(v) => setForm({ ...form, salaryRange: v })} />
            <Field label="Location" value={form.location || ""} onChange={(v) => setForm({ ...form, location: v })} />
            <Field label="Source" value={form.source || "manual"} onChange={(v) => setForm({ ...form, source: v })} />
            <SelectField label="Status" value={form.status || "applied"} onChange={(v) => setForm({ ...form, status: v })} options={STATUSES as any} />
            <Field label="Fit score (0-100)" value={String(form.fitScore || "")} onChange={(v) => setForm({ ...form, fitScore: parseInt(v || "0") })} />
          </div>
          <Field label="Notes" value={form.notes || ""} onChange={(v) => setForm({ ...form, notes: v })} multiline />
          <div className="flex gap-2">
            <button onClick={editing ? () => { update(editing.id, form); setEditing(null); setForm({}); } : add} className="btn-primary text-sm">Save</button>
            <button onClick={() => { setAdding(false); setEditing(null); setForm({}); }} className="btn-ghost text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Applications list */}
      <div className="space-y-2">
        {visible.map((a) => (
          <div key={a.id} className="glass p-4 hover:border-accent/30 transition">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold">{a.company}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-sm">{a.role}</span>
                  {a.fitScore > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-secondary">{a.fitScore}% fit</span>}
                </div>
                <div className="text-[11px] text-text-muted mt-1 flex flex-wrap gap-2">
                  <span>Applied {new Date(a.appliedAt).toLocaleDateString()}</span>
                  <span>· via {a.source}</span>
                  {a.location && <span>· {a.location}{a.remote ? " (remote)" : ""}</span>}
                  {a.salaryRange && <span>· {a.salaryRange}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={a.status} onChange={(e) => update(a.id, { status: e.target.value })}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full border bg-bg-secondary ${STATUS_COLOR[a.status]}`}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {a.jdUrl && <a href={a.jdUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-light hover:underline">JD ↗</a>}
                <button onClick={() => { setEditing(a); setForm(a); }} className="text-[10px] text-text-secondary hover:text-accent-light">Edit</button>
                <button onClick={() => remove(a.id)} className="text-[10px] text-rose-400 hover:underline">Delete</button>
              </div>
            </div>
            {a.notes && <div className="text-xs text-text-secondary mt-2 italic">{a.notes}</div>}
          </div>
        ))}
        {visible.length === 0 && (
          <div className="glass p-8 text-center text-text-muted text-sm">
            No applications yet. Click "+ Add application" to start tracking.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-20 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
      }
    </label>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
              className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
