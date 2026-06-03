'use client';
import { useEffect, useState } from 'react';

type App={id:string;company:string;role:string;source:string;jdUrl:string;status:string;appliedAt:string;nextActionAt:string|null;nextAction:string;salaryRange:string;location:string;remote:boolean;notes:string;fitScore:number;};
const STATUSES=['applied','screen','technical','onsite','offer','rejected','withdrew'] as const;
const SC:Record<string,string>={applied:'bg-slate-500/15 text-slate-300 border-slate-500/30',screen:'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',technical:'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',onsite:'bg-violet-500/15 text-violet-300 border-violet-500/30',offer:'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',rejected:'bg-rose-500/15 text-rose-300 border-rose-500/30',withdrew:'bg-amber-500/15 text-amber-300 border-amber-500/30'};

function daysAgo(d:string){const n=Math.floor((Date.now()-new Date(d).getTime())/86400000);if(n===0)return'Today';if(n===1)return'1 day ago';return`${n} days ago`;}
function urgency(a:App):'overdue'|'soon'|'ok'|'none'{if(a.status!=='applied'&&a.status!=='screen')return'none';const d=Math.floor((Date.now()-new Date(a.appliedAt).getTime())/86400000);if(d>=7)return'overdue';if(d>=3)return'soon';return'ok';}
function extractResume(notes:string):string|null{const m=notes?.match(/\[TAILORED_RESUME\]([\s\S]*?)\[\/TAILORED_RESUME\]/);return m?m[1].trim():null;}

export default function PipelinePage(){
  const [data,setData]=useState<{apps:App[];counts:Record<string,number>;total:number}|null>(null);
  const [adding,setAdding]=useState(false);
  const [editing,setEditing]=useState<App|null>(null);
  const [form,setForm]=useState<Partial<App>>({});
  const [filter,setFilter]=useState('');
  const [expandedId,setExpandedId]=useState<string|null>(null);

  useEffect(()=>{refresh();},[]);
  async function refresh(){const d=await(await fetch('/api/applications')).json();setData(d);}
  async function add(){if(!form.company||!form.role)return;await fetch('/api/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,nextActionAt:new Date(Date.now()+2*86400000).toISOString(),nextAction:'Follow up'})});setAdding(false);setForm({});await refresh();}
  async function update(id:string,patch:Partial<App>){await fetch('/api/applications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...patch})});await refresh();}
  async function remove(id:string){if(!confirm('Delete?'))return;await fetch('/api/applications',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});await refresh();}

  if(!data)return<div className="glass p-6 text-text-muted">Loading…</div>;
  const visible=filter?data.apps.filter(a=>a.status===filter):data.apps;
  const overdue=data.apps.filter(a=>urgency(a)==='overdue').length;
  const soon=data.apps.filter(a=>urgency(a)==='soon').length;

  return(<div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
    <header><div className="text-xs uppercase tracking-[0.25em] text-indigo-400/70 mb-2">ApplyPilot · Application Tracking Pipeline</div>
      <h1 className="text-4xl font-extrabold gradient-text">Track every job, every stage.</h1>
      <p className="text-text-secondary mt-2">All applications in one place. Follow-up reminders every 2 days.</p></header>

    {(overdue>0||soon>0)&&<div className="space-y-2">
      {overdue>0&&<div className="glass p-4 border border-rose-500/30 bg-rose-500/5 flex items-center gap-3"><span className="text-lg">🔴</span><div><div className="text-sm font-semibold text-rose-300">{overdue} overdue for follow-up (7+ days)</div><div className="text-xs text-text-muted">Send a follow-up email</div></div></div>}
      {soon>0&&<div className="glass p-4 border border-amber-500/30 bg-amber-500/5 flex items-center gap-3"><span className="text-lg">🟡</span><div><div className="text-sm font-semibold text-amber-300">{soon} need follow-up soon (3–6 days)</div><div className="text-xs text-text-muted">Consider reaching out</div></div></div>}</div>}

    <section className="glass p-5"><div className="text-xs uppercase tracking-widest text-text-muted mb-3">Funnel · {data.total} total</div>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">{STATUSES.map(s=>{const n=data.counts[s]||0;return(<button key={s} onClick={()=>setFilter(filter===s?'':s)} className={`p-3 rounded-lg border text-left transition ${filter===s?'ring-2 ring-accent':''} ${SC[s]}`}><div className="text-[10px] uppercase tracking-widest">{s}</div><div className="text-2xl font-extrabold tabular-nums mt-1">{n}</div></button>);})}</div></section>

    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex gap-2"><button onClick={()=>{setAdding(true);setForm({});}} className="btn-primary text-sm">+ Add manually</button>{filter&&<button onClick={()=>setFilter('')} className="btn-ghost text-xs">Clear filter</button>}</div>
      <div className="text-xs text-text-muted">Showing {visible.length}</div></div>

    {(adding||editing)&&<div className="glass p-5 space-y-3 ring-1 ring-accent/30">
      <div className="text-xs uppercase tracking-widest text-accent-light">{editing?'Edit':'New application'}</div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[['Company *','company'],['Role *','role'],['JD URL','jdUrl'],['Salary','salaryRange'],['Location','location'],['Source','source']].map(([l,k])=>(<label key={k} className="block"><span className="text-[10px] uppercase tracking-widest text-text-muted">{l}</span><input value={(form as any)[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})} className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60"/></label>))}
        <label className="block"><span className="text-[10px] uppercase tracking-widest text-text-muted">Status</span><select value={form.status||'applied'} onChange={e=>setForm({...form,status:e.target.value})} className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60">{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></label></div>
      <label className="block"><span className="text-[10px] uppercase tracking-widest text-text-muted">Notes</span><textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} className="mt-1 w-full h-20 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60"/></label>
      <div className="flex gap-2"><button onClick={editing?()=>{update(editing.id,form);setEditing(null);setForm({});}:add} className="btn-primary text-sm">Save</button><button onClick={()=>{setAdding(false);setEditing(null);setForm({});}} className="btn-ghost text-xs">Cancel</button></div></div>}

    <div className="space-y-2">
      {visible.map(a=>{const u=urgency(a);const days=Math.floor((Date.now()-new Date(a.appliedAt).getTime())/86400000);const rv=extractResume(a.notes);
        return(<div key={a.id} className={`glass p-4 hover:border-accent/30 transition ${u==='overdue'?'border-l-4 border-l-rose-500/60':u==='soon'?'border-l-4 border-l-amber-500/60':''}`}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-bold">{a.company}</span><span className="text-text-muted">·</span><span className="text-sm">{a.role}</span>{a.fitScore>0&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-secondary">{a.fitScore}% fit</span>}</div>
              <div className="text-[11px] text-text-muted mt-1 flex flex-wrap gap-2"><span>Applied {daysAgo(a.appliedAt)}</span><span>· via {a.source}</span>{a.location&&<span>· {a.location}</span>}{a.salaryRange&&<span>· {a.salaryRange}</span>}</div>
              {u==='overdue'&&<div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300 font-semibold">🔴 Follow up overdue — {days} days</div>}
              {u==='soon'&&<div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 font-semibold">🟡 Follow up soon — {days} days</div>}
              {a.notes&&!rv&&<div className="text-xs text-text-secondary mt-2 italic line-clamp-2">{a.notes}</div>}
              {rv&&<button onClick={()=>setExpandedId(expandedId===a.id?null:a.id)} className="mt-2 text-[10px] px-2.5 py-1 border border-indigo-500/30 rounded-full text-indigo-300 hover:bg-indigo-500/10 transition font-semibold">{expandedId===a.id?'▲ Hide Resume':'✨ View Tailored Resume'}</button>}</div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <select value={a.status} onChange={e=>update(a.id,{status:e.target.value})} className={`text-[10px] font-semibold px-2 py-1 rounded-full border bg-bg-secondary ${SC[a.status]}`}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>
              {a.jdUrl&&<a href={a.jdUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-light hover:underline">JD ↗</a>}
              {a.status==='applied'&&<><button onClick={()=>update(a.id,{status:'screen'})} className="text-[10px] px-2 py-1 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-semibold">→ Screen</button><button onClick={()=>update(a.id,{status:'rejected'})} className="text-[10px] px-2 py-1 rounded border border-rose-500/30 text-rose-300 hover:bg-rose-500/10">Reject</button></>}
              <button onClick={()=>{setEditing(a);setForm(a);}} className="text-[10px] text-text-secondary hover:text-accent-light">Edit</button>
              <button onClick={()=>remove(a.id)} className="text-[10px] text-rose-400 hover:underline">Delete</button></div></div>
          {expandedId===a.id&&rv&&(<div className="border-t border-indigo-500/20 mt-3 pt-3 space-y-2">
            <div className="flex items-center justify-between"><div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">✨ Tailored Resume Sent</div>
              <button onClick={()=>{const b=new Blob([rv],{type:'text/plain'});const l=document.createElement('a');l.href=URL.createObjectURL(b);l.download=`Resume_${a.company}_${a.role}.md`.replace(/\s+/g,'_');l.click();}} className="text-xs px-3 py-1.5 border border-indigo-500/30 rounded-lg text-indigo-300 hover:bg-indigo-500/10">⬇ Download .md</button></div>
            <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto bg-white/[0.02] border border-white/5 rounded-lg p-4">{rv}</pre></div>)}
        </div>);})}
      {visible.length===0&&<div className="glass p-12 text-center text-text-muted space-y-3"><div className="text-4xl">📋</div><div>No applications yet.</div><div><a href="/discover" className="text-indigo-300 hover:underline">Start with Company Discover →</a></div></div>}</div>
  </div>);
}
