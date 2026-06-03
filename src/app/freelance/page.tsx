"use client";
import { useEffect, useState } from "react";

interface Gig {
  id: string; platform: string; title: string; client: string;
  status: string; amountINR: number; description: string; notes: string;
  submittedAt: string; completedAt?: string;
}
interface Stats { total: number; earned: number; active: number; proposals: number; completed: number; }

const PLATFORMS = ["Upwork","Fiverr","Internshala","LinkedIn","Topmate","Other"];
const STATUSES  = ["proposal","active","completed","rejected"];

const STATUS_STYLE: Record<string,string> = {
  proposal:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  active:    "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected:  "text-rose-400 bg-rose-500/10 border-rose-500/20",
};
const PLATFORM_ICON: Record<string,string> = {
  Upwork:"🟢", Fiverr:"🟡", Internshala:"🔵", LinkedIn:"💼", Topmate:"🎤", Other:"⚡"
};

const EMPTY = { platform:"Upwork", title:"", client:"", status:"proposal", amountINR:0, description:"", notes:"" };

export default function FreelancePage() {
  const [gigs, setGigs]   = useState<Gig[]>([]);
  const [stats, setStats] = useState<Stats>({ total:0,earned:0,active:0,proposals:0,completed:0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]   = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = () => fetch("/api/freelance").then(r=>r.json()).then(d=>{ setGigs(d.gigs||[]); setStats(d.stats||{}); });
  useEffect(()=>{ load(); },[]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/freelance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    setForm({...EMPTY}); setShowForm(false); await load();
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/freelance/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    await load();
  }

  async function deleteGig(id: string) {
    if (!confirm("Delete this gig?")) return;
    await fetch(`/api/freelance/${id}`,{method:"DELETE"});
    await load();
  }

  const filtered = filter === "all" ? gigs : gigs.filter(g => g.status === filter);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Freelance Tracker</div>
          <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">Freelance Gigs</h1>
          <p className="text-text-secondary mt-1">Track proposals, active work, and earnings</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary">
          {showForm ? "✕ Cancel" : "+ Add Gig"}
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Total Gigs",   value: stats.total,                         color:"" },
          { label:"Proposals",    value: stats.proposals,                     color:"text-blue-400" },
          { label:"Active",       value: stats.active,                        color:"text-yellow-400" },
          { label:"Completed",    value: stats.completed,                     color:"text-emerald-400" },
          { label:"💰 Earned",   value:`₹${(stats.earned||0).toLocaleString("en-IN")}`, color:"text-yellow-300" },
        ].map(s=>(
          <div key={s.label} className="glass p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest text-text-muted">{s.label}</div>
            <div className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={save} className="glass p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Gig / Proposal</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Gig Title *</label>
              <input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder="e.g. Build ML chatbot for e-commerce"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Client / Company</label>
              <input value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))}
                placeholder="Client name or 'Anonymous'"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Platform</label>
              <select value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50">
                {PLATFORMS.map(p=><option key={p} value={p}>{PLATFORM_ICON[p]} {p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Expected Amount (₹)</label>
              <input type="number" value={form.amountINR} onChange={e=>setForm(f=>({...f,amountINR:Number(e.target.value)}))}
                placeholder="e.g. 5000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50"/>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-muted">Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              rows={3} placeholder="What does the client need? What will you deliver?"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50 resize-y"/>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
            {saving ? "⟳ Saving..." : "💰 Add Gig"}
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all","proposal","active","completed","rejected"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all capitalize ${
              filter===f ? "border-accent bg-accent/20 text-accent-light" : "border-white/10 text-text-muted hover:border-white/20"
            }`}>{f} {f==="all" ? `(${gigs.length})` : `(${gigs.filter(g=>g.status===f).length})`}
          </button>
        ))}
      </div>

      {/* Gigs list */}
      {filtered.length === 0 ? (
        <div className="glass p-12 text-center space-y-3">
          <div className="text-5xl">💼</div>
          <h2 className="text-xl font-bold">No gigs yet</h2>
          <p className="text-text-secondary">Add your first freelance proposal to start tracking!</p>
          <div className="text-sm text-text-muted mt-4 space-y-1">
            <p>💡 <strong>Quick start ideas:</strong></p>
            <p>• Build a chatbot for a local business (Fiverr)</p>
            <p>• Automate Excel/data tasks with Python (Upwork)</p>
            <p>• Create ML model for someone's dataset (Internshala)</p>
            <p>• Offer 1:1 AI tutoring sessions (Topmate)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(gig=>(
            <div key={gig.id} className={`glass p-5 space-y-3 border-l-4 ${
              gig.status==="completed" ? "border-l-emerald-400" :
              gig.status==="active"    ? "border-l-yellow-400" :
              gig.status==="rejected"  ? "border-l-rose-400" : "border-l-blue-400"
            }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{PLATFORM_ICON[gig.platform]||"⚡"}</span>
                    <span className="text-sm font-bold">{gig.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLE[gig.status]}`}>
                      {gig.status}
                    </span>
                    <span className="text-xs text-text-muted">{gig.platform}</span>
                  </div>
                  {gig.client && <div className="text-xs text-text-muted mt-1">Client: {gig.client}</div>}
                  {gig.description && <div className="text-xs text-text-secondary mt-1 line-clamp-2">{gig.description}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-yellow-400">₹{gig.amountINR.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-text-muted">{new Date(gig.submittedAt).toLocaleDateString("en-IN")}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {gig.status !== "active"    && <button onClick={()=>updateStatus(gig.id,"active")}    className="btn-ghost text-xs !py-1 !text-yellow-400">▶ Activate</button>}
                {gig.status !== "completed" && <button onClick={()=>updateStatus(gig.id,"completed")} className="btn-ghost text-xs !py-1 !text-emerald-400">✓ Complete</button>}
                {gig.status !== "rejected"  && <button onClick={()=>updateStatus(gig.id,"rejected")}  className="btn-ghost text-xs !py-1 !text-rose-400">✗ Rejected</button>}
                <button onClick={()=>deleteGig(gig.id)} className="btn-ghost text-xs !py-1 !text-text-muted ml-auto">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
