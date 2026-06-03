'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Job = {
  title: string; company: string; location: string; platform: string;
  salary: string | null; posted: string; url: string; description: string; tags: string[];
};
type ScoreResult = {
  score: number; label: string; matched: string[]; gaps: string[]; highlights: string[];
};
type ResumeState = { content: string; editing: boolean; };
type ApplyStatus = 'idle' | 'opened' | 'applied' | 'rejected';

const PC: Record<string, string> = {
  LinkedIn: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Indeed: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Glassdoor: 'bg-green-500/15 text-green-300 border-green-500/30',
  'Google Jobs': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Naukri: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  Other: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};
const SCORE_COLOR = (s: number) => s >= 8 ? '#10b981' : s >= 6 ? '#f59e0b' : '#ef4444';
const SCORE_BG    = (s: number) => s >= 8 ? 'border-emerald-500/40 bg-emerald-500/5' : s >= 6 ? 'border-amber-500/30 bg-amber-500/5' : 'border-rose-500/20';
const ROLES = ['AI ML Engineer', 'Data Scientist', 'MLOps Engineer', 'LLM Engineer', 'NLP Engineer', 'Computer Vision Engineer', 'AI Research Scientist', 'ML Platform Engineer'];

// ─── Resume Upload Modal ───────────────────────────────────────────────────────
function ResumeUploadModal({ onSuccess, onSkip }: { onSuccess: (name: string) => void; onSkip: () => void }) {
  const [file, setFile]         = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [preview, setPreview]   = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    if (!file) return;
    setUploading(true); setError('');
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const res = await fetch('/api/resumes/upload', { method: 'POST', body: fd });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || 'Upload failed');
      setPreview(d.preview || '');
      setTimeout(() => onSuccess(file.name), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-lg p-6 space-y-5 border border-violet-500/30 shadow-2xl shadow-violet-500/20 rounded-2xl animate-[fadeInUp_0.3s_ease-out]">
        {/* Header */}
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.2em] text-violet-400/70">ApplyPilot · One-time Setup</div>
          <h2 className="text-2xl font-extrabold text-white">Upload your base resume</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Upload your existing resume (PDF or DOCX). AI will extract your experience and tailor it specifically for each job — keeping your real facts, just optimized.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${file ? 'border-violet-500/60 bg-violet-500/10' : 'border-white/15 hover:border-violet-500/40 hover:bg-violet-500/5'}`}>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
          {file ? (
            <div className="space-y-2">
              <div className="text-3xl">📄</div>
              <div className="text-sm font-semibold text-violet-300">{file.name}</div>
              <div className="text-xs text-text-muted">{(file.size / 1024).toFixed(0)} KB · {file.type || 'unknown type'}</div>
              <button className="text-[10px] text-text-muted hover:text-rose-300 transition" onClick={e => { e.stopPropagation(); setFile(null); }}>✕ Remove</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl opacity-50">📤</div>
              <div className="text-sm text-text-muted">Drag & drop your resume here, or <span className="text-violet-300 underline">browse</span></div>
              <div className="text-xs text-text-muted">PDF, DOCX, or TXT · Max 10MB</div>
            </div>
          )}
        </div>

        {error && <div className="text-rose-300 text-sm border border-rose-500/30 rounded-lg px-4 py-3 bg-rose-500/10">{error}</div>}

        {preview && (
          <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-violet-400 mb-1">✓ Extracted successfully</div>
            <div className="text-xs text-text-muted font-mono line-clamp-3">{preview}</div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={upload} disabled={!file || uploading}
            className="flex-1 py-3 rounded-lg font-bold text-sm text-white disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
            {uploading ? '⏳ Extracting text…' : preview ? '✓ Resume Uploaded!' : '📤 Upload & Extract'}
          </button>
          <button onClick={onSkip}
            className="px-5 py-3 rounded-lg text-sm text-text-muted border border-white/10 hover:text-white transition">
            Skip (use AI)
          </button>
        </div>
        <div className="text-xs text-text-muted text-center">
          Uploaded once · stored securely · reused for all future job tailoring
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiscoverPage() {
  // Resume check
  const [hasResume, setHasResume]     = useState<boolean | null>(null); // null = checking
  const [resumeName, setResumeName]   = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingTailorIdx, setPendingTailorIdx] = useState<number | null>(null);

  // Search
  const [role, setRole]         = useState('');
  const [location, setLocation] = useState('India');
  const [remote, setRemote]     = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [searched, setSearched] = useState('');

  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Scoring
  const [scores, setScores]         = useState<Map<number, ScoreResult>>(new Map());
  const [scoring, setScoring]       = useState(false);
  const [scoringIdx, setScoringIdx] = useState(0);
  const [scoresReady, setScoresReady] = useState(false);

  // Tailoring
  const [resumes, setResumes]     = useState<Map<number, ResumeState>>(new Map());
  const [tailoring, setTailoring] = useState<Set<number>>(new Set());

  // Apply
  const [applyStatus, setApplyStatus] = useState<Map<number, ApplyStatus>>(new Map());
  const [saving, setSaving]           = useState<Set<number>>(new Set());
  const textareaRefs = useRef<Map<number, HTMLTextAreaElement>>(new Map());

  // Check if resume is uploaded on mount
  useEffect(() => {
    fetch('/api/resumes/upload')
      .then(r => r.json())
      .then(d => {
        setHasResume(d.hasUploadedResume);
        setResumeName(d.resumeName || '');
      })
      .catch(() => setHasResume(false));
  }, []);

  // Restore search + scores from localStorage on mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('ap_jobs');
      if (savedJobs) {
        setJobs(JSON.parse(savedJobs));
        setSearched(localStorage.getItem('ap_searched') || '');
        setRole(localStorage.getItem('ap_role') || '');
        setLocation(localStorage.getItem('ap_location') || 'India');
        setRemote(localStorage.getItem('ap_remote') === 'true');
      }
      const savedScores = localStorage.getItem('ap_scores');
      if (savedScores) {
        const obj = JSON.parse(savedScores);
        setScores(new Map(Object.entries(obj).map(([k, v]) => [Number(k), v as ScoreResult])));
        setScoresReady(true);
      }
    } catch {}
  }, []);

  // ─── Tailor with upload gate ───────────────────────────────────────────────
  const tailorResume = useCallback(async (idx: number, forceSkip = false) => {
    // Gate: if no resume uploaded, show modal first
    if (!hasResume && !forceSkip) {
      setPendingTailorIdx(idx);
      setShowUploadModal(true);
      return;
    }
    const job = jobs[idx];
    const scoreResult = scores.get(idx);
    setTailoring(s => new Set(s).add(idx));
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title, company: job.company,
          description: job.description,
          matchedSkills: scoreResult?.matched || [],
          gaps: scoreResult?.gaps || [],
        }),
      });
      const d = await res.json();
      if (d.ok) setResumes(r => new Map(r).set(idx, { content: d.resume, editing: false }));
    } catch {}
    setTailoring(s => { const n = new Set(s); n.delete(idx); return n; });
  }, [hasResume, jobs, scores]);

  function handleUploadSuccess(name: string) {
    setHasResume(true);
    setResumeName(name);
    setShowUploadModal(false);
    // Now proceed with the pending tailor
    if (pendingTailorIdx !== null) {
      tailorResume(pendingTailorIdx, true);
      setPendingTailorIdx(null);
    }
  }
  function handleUploadSkip() {
    setHasResume(true); // skip = proceed without real upload (AI-generated)
    setShowUploadModal(false);
    if (pendingTailorIdx !== null) {
      tailorResume(pendingTailorIdx, true);
      setPendingTailorIdx(null);
    }
  }

  // ─── Search ──────────────────────────────────────────────────────────────────
  async function search() {
    if (!role.trim()) return;
    setSearching(true); setSearchError(''); setJobs([]);
    setSelected(new Set()); setScores(new Map()); setResumes(new Map());
    setApplyStatus(new Map()); setScoresReady(false);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role.trim(), location, remote }),
      });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || 'Search failed');
      const fetched = d.jobs || [];
      setJobs(fetched);
      setSearched(role.trim());
      localStorage.setItem('ap_jobs', JSON.stringify(fetched));
      localStorage.setItem('ap_searched', role.trim());
      localStorage.setItem('ap_role', role.trim());
      localStorage.setItem('ap_location', location);
      localStorage.setItem('ap_remote', String(remote));
      localStorage.removeItem('ap_scores');
    } catch (e: any) { setSearchError(e.message); }
    finally { setSearching(false); }
  }

  function toggleSelect(i: number) {
    setSelected(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  async function scoreSelected() {
    if (!selected.size) return;
    setScoring(true); setScoresReady(false); setScoringIdx(0);
    const indices = Array.from(selected);
    const newScores = new Map(scores);
    for (let i = 0; i < indices.length; i++) {
      setScoringIdx(i + 1);
      const idx = indices[i]; const job = jobs[idx];
      try {
        const res = await fetch('/api/quick-score', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: job.title, company: job.company, description: job.description }),
        });
        const d = await res.json();
        if (d.ok) newScores.set(idx, { score: d.score, label: d.label, matched: d.matched || [], gaps: d.gaps || [], highlights: d.highlights || [] });
      } catch {}
      setScores(new Map(newScores));
    }
    setScoring(false); setScoresReady(true);
    const scoresObj: Record<string, ScoreResult> = {};
    newScores.forEach((v, k) => { scoresObj[String(k)] = v; });
    localStorage.setItem('ap_scores', JSON.stringify(scoresObj));
  }

  // ─── Download as PDF (opens styled print page) ──────────────────────────────
  async function downloadPDF(idx: number) {
    const r = resumes.get(idx); if (!r) return;
    const job = jobs[idx];
    // POST to export API, get back styled HTML, open in new tab
    const res = await fetch('/api/resumes/export', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: r.content, title: job.title, company: job.company }),
    });
    const html = await res.text();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up after 60s
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // ─── Download as .md ─────────────────────────────────────────────────────────
  function downloadMD(idx: number) {
    const r = resumes.get(idx); if (!r) return;
    const job = jobs[idx];
    const blob = new Blob([r.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Resume_${job.company}_${job.title}.md`.replace(/\s+/g, '_');
    a.click();
  }

  // ─── Download as .txt (for pasting into Word/Docs) ───────────────────────────
  function downloadTXT(idx: number) {
    const r = resumes.get(idx); if (!r) return;
    const job = jobs[idx];
    // Strip markdown symbols for clean .txt
    const txt = r.content
      .replace(/#{1,4} /g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/^[-•] /gm, '• ');
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Resume_${job.company}_${job.title}.txt`.replace(/\s+/g, '_');
    a.click();
  }

  function handleOpenJob(idx: number) {
    window.open(jobs[idx].url, '_blank');
    setApplyStatus(s => new Map(s).set(idx, 'opened'));
  }

  async function handleMarkApplied(idx: number) {
    const job = jobs[idx]; const score = scores.get(idx); const r = resumes.get(idx);
    setSaving(s => new Set(s).add(idx));
    await fetch('/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: job.company, role: job.title, source: job.platform, jdUrl: job.url,
        jdText: job.description, location: job.location, status: 'applied',
        fitScore: score ? score.score * 10 : 0,
        notes: r ? `[TAILORED_RESUME]\n${r.content.slice(0, 3000)}\n[/TAILORED_RESUME]` : `Score: ${score?.score}/10`,
        nextActionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextAction: 'Follow up — check email for response',
      }),
    });
    setSaving(s => { const n = new Set(s); n.delete(idx); return n; });
    setApplyStatus(s => new Map(s).set(idx, 'applied'));
  }

  async function handleMarkRejected(idx: number) {
    const job = jobs[idx]; const score = scores.get(idx);
    setSaving(s => new Set(s).add(idx));
    await fetch('/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: job.company, role: job.title, source: job.platform, jdUrl: job.url, status: 'rejected', fitScore: score ? score.score * 10 : 0, notes: 'Rejected at discovery stage' }),
    });
    setSaving(s => { const n = new Set(s); n.delete(idx); return n; });
    setApplyStatus(s => new Map(s).set(idx, 'rejected'));
  }

  const highScoreCount = Array.from(scores.entries()).filter(([, s]) => s.score >= 8).length;
  const appliedCount   = Array.from(applyStatus.values()).filter(s => s === 'applied').length;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      {/* Upload modal */}
      {showUploadModal && <ResumeUploadModal onSuccess={handleUploadSuccess} onSkip={handleUploadSkip} />}

      {/* Header */}
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-indigo-400/70 mb-2">ApplyPilot · Step 1 — Company Discover</div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-extrabold gradient-text">Find AI/ML jobs. Score. Tailor. Apply.</h1>
            <p className="text-text-secondary mt-2 max-w-2xl">Search → check jobs → score (0-10) → AI tailors your resume → apply with one click.</p>
          </div>
          {/* Resume status badge */}
          <div className="shrink-0">
            {hasResume === null && <div className="text-xs text-text-muted animate-pulse">Checking resume…</div>}
            {hasResume === true && resumeName && (
              <div className="flex items-center gap-2">
                <div className="text-[10px] px-3 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 font-semibold">
                  📄 {resumeName}
                </div>
                <button onClick={() => setShowUploadModal(true)}
                  className="text-[10px] text-text-muted hover:text-violet-300 transition">replace</button>
              </div>
            )}
            {hasResume === false && (
              <button onClick={() => { setPendingTailorIdx(null); setShowUploadModal(true); }}
                className="text-xs px-4 py-2 rounded-lg border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 transition font-semibold">
                📤 Upload Resume
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress steps */}
      <div className="flex gap-2 flex-wrap text-xs">
        {[
          { n: 1, label: 'Search', done: jobs.length > 0 },
          { n: 2, label: 'Select', done: selected.size > 0 },
          { n: 3, label: 'Score', done: scoresReady },
          { n: 4, label: 'Tailor Resume', done: resumes.size > 0 },
          { n: 5, label: 'Apply', done: appliedCount > 0 },
        ].map(s => (
          <div key={s.n} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${s.done ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-white/10 text-text-muted'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${s.done ? 'bg-emerald-500 text-white' : 'bg-white/10'}`}>{s.done ? '✓' : s.n}</span>
            {s.label}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass p-5 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <input type="text" value={role} onChange={e => setRole(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Role: AI ML Engineer, Data Scientist, MLOps..."
            className="flex-1 min-w-[240px] bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition" />
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} disabled={remote}
            placeholder="Location" className="w-40 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/60 transition disabled:opacity-40" />
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} className="accent-indigo-500" /> Remote
          </label>
          <button onClick={search} disabled={searching || !role.trim()}
            className="px-6 py-3 rounded-lg font-semibold text-sm text-white disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            {searching ? 'Searching…' : '🔍 Search'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`text-xs px-3 py-1 rounded-full border transition ${role === r ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200' : 'border-indigo-500/20 text-indigo-300/70 hover:border-indigo-500/60 hover:text-indigo-200'}`}>{r}</button>
          ))}
        </div>
      </div>

      {searchError && <div className="glass p-4 border border-rose-500/30 text-rose-300 text-sm">{searchError}</div>}
      {searching && (
        <div className="glass p-12 text-center space-y-3">
          <div className="text-3xl animate-pulse">🔍</div>
          <div className="text-text-muted">Searching LinkedIn, Indeed, Glassdoor, Google Jobs, Naukri…</div>
          <div className="text-xs text-indigo-400/60">Semantic search for AI/ML roles</div>
        </div>
      )}

      {/* Results */}
      {jobs.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white font-bold">{jobs.length}</span>
              <span className="text-text-muted text-sm">results for <span className="text-indigo-300">"{searched}"</span></span>
              {selected.size > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">{selected.size} selected</span>}
              {scoresReady && highScoreCount > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">{highScoreCount} scored ≥8 🔥</span>}
              {appliedCount > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">{appliedCount} applied ✓</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set(jobs.map((_, i) => i)))} className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-text-muted hover:text-white transition">Select All</button>
              {selected.size > 0 && <button onClick={() => setSelected(new Set())} className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-text-muted hover:text-white transition">Clear</button>}
            </div>
          </div>

          <div className="space-y-3">
            {jobs.map((job, idx) => {
              const isSelected  = selected.has(idx);
              const score       = scores.get(idx);
              const resume      = resumes.get(idx);
              const isTailoring = tailoring.has(idx);
              const appStatus   = applyStatus.get(idx) || 'idle';
              const isSaving    = saving.has(idx);

              return (
                <div key={idx} className={`glass transition border ${
                  appStatus === 'applied' ? 'border-emerald-500/40 bg-emerald-500/5' :
                  appStatus === 'rejected' ? 'border-white/5 opacity-50' :
                  score ? SCORE_BG(score.score) :
                  isSelected ? 'border-indigo-500/40 bg-indigo-500/5' : 'hover:border-white/15'
                }`}>
                  <div className="p-4 flex items-start gap-4">
                    {/* Checkbox */}
                    <button onClick={() => toggleSelect(idx)}
                      className={`mt-1 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-indigo-400'}`}>
                      {isSelected && <svg viewBox="0 0 12 12" className="w-3 h-3 fill-white"><path d="M1 6l4 4L11 2"/></svg>}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PC[job.platform] || PC.Other}`}>{job.platform}</span>
                        {job.salary && <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">{job.salary}</span>}
                        <span className="text-[10px] text-text-muted">{job.posted}</span>
                        {score && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full border"
                            style={{ color: SCORE_COLOR(score.score), borderColor: SCORE_COLOR(score.score)+'60', background: SCORE_COLOR(score.score)+'20', boxShadow: `0 0 8px ${SCORE_COLOR(score.score)}30` }}>
                            🎯 {score.score}/10 · {score.label}
                          </span>
                        )}
                        {appStatus === 'applied' && <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-bold">✓ Applied & Tracked</span>}
                        {appStatus === 'rejected' && <span className="text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30 text-rose-300">✗ Rejected</span>}
                      </div>
                      <div className="font-bold text-white">{job.title}</div>
                      <div className="text-sm text-indigo-300 font-medium">{job.company}</div>
                      <div className="text-xs text-text-muted mt-0.5">📍 {job.location}</div>
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed">{job.description}</p>
                      {score && (
                        <div className="mt-3 rounded-xl p-4" style={{
                          background: SCORE_COLOR(score.score) + '0d',
                          border: `1px solid ${SCORE_COLOR(score.score)}35`,
                          borderLeft: `4px solid ${SCORE_COLOR(score.score)}`
                        }}>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="text-4xl font-extrabold tabular-nums leading-none" style={{ color: SCORE_COLOR(score.score) }}>
                              {score.score}<span className="text-lg font-normal text-text-muted">/10</span>
                            </div>
                            <div>
                              <div className="font-bold text-sm" style={{ color: SCORE_COLOR(score.score) }}>{score.label}</div>
                              {score.highlights?.[0] && <div className="text-xs text-text-muted mt-0.5">{score.highlights[0]}</div>}
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {score.matched?.slice(0,6).map((m,i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">✓ {m}</span>)}
                            {score.gaps?.slice(0,3).map((g,i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-300">⚠ gap: {g}</span>)}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {job.tags?.map((t, ti) => <span key={ti} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded text-text-muted">{t}</span>)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0 min-w-[120px]">
                      <a href={job.url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg text-xs font-semibold border border-white/10 text-text-secondary hover:text-white text-center transition">
                        View Job ↗
                      </a>
                      {score && appStatus === 'idle' && (
                        <div className="rounded-lg py-2 px-3 text-center border"
                          style={{ borderColor: SCORE_COLOR(score.score)+'50', background: SCORE_COLOR(score.score)+'18' }}>
                          <div className="text-2xl font-extrabold leading-none" style={{ color: SCORE_COLOR(score.score) }}>
                            {score.score}<span className="text-xs font-normal text-text-muted">/10</span>
                          </div>
                          <div className="text-[10px] font-semibold mt-0.5" style={{ color: SCORE_COLOR(score.score) }}>{score.label}</div>
                        </div>
                      )}
                      {score && !resume && appStatus === 'idle' && (
                        <button onClick={() => tailorResume(idx)} disabled={isTailoring}
                          className="px-3 py-2 rounded-lg text-xs font-bold text-white text-center disabled:opacity-60 transition"
                          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>
                          {isTailoring ? '⏳ Tailoring…' : '✨ Tailor Resume'}
                        </button>
                      )}
                      {!score && !resume && appStatus === 'idle' && (
                        <div className="px-3 py-2 rounded-lg text-[10px] text-text-muted border border-white/5 text-center leading-relaxed">
                          Select &amp; score<br/>to unlock tailor
                        </div>
                      )}
                      {resume && appStatus === 'idle' && (
                        <button onClick={() => handleOpenJob(idx)}
                          className="px-3 py-2 rounded-lg text-xs font-bold text-white text-center transition"
                          style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 0 12px rgba(16,185,129,0.3)' }}>
                          🚀 Apply Now
                        </button>
                      )}
                      {appStatus === 'opened' && (
                        <div className="flex flex-col gap-1.5">
                          <div className="text-[10px] text-text-muted text-center">Did you apply?</div>
                          <button onClick={() => handleMarkApplied(idx)} disabled={isSaving}
                            className="px-3 py-2 rounded-lg text-xs font-bold text-white text-center disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                            {isSaving ? '…' : '✓ Applied'}
                          </button>
                          <button onClick={() => handleMarkRejected(idx)}
                            className="px-3 py-2 rounded-lg text-xs border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-center transition">
                            ✗ No
                          </button>
                          <button onClick={() => window.open(job.url, '_blank')}
                            className="px-3 py-2 rounded-lg text-xs border border-white/10 text-text-muted hover:text-white text-center transition">
                            Reopen ↗
                          </button>
                        </div>
                      )}
                      {appStatus === 'idle' && (
                        <button onClick={() => handleMarkRejected(idx)}
                          className="px-3 py-2 rounded-lg text-xs border border-white/10 text-text-muted hover:text-rose-300 hover:border-rose-500/30 text-center transition">
                          ✗ Skip
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tailoring spinner */}
                  {isTailoring && (
                    <div className="border-t border-white/5 p-4 text-center space-y-2">
                      <div className="text-2xl animate-pulse">✨</div>
                      <div className="text-sm text-text-muted">Tailoring resume for {job.title} at {job.company}…</div>
                      <div className="text-xs text-indigo-400/60">
                        {hasResume && resumeName ? `Using your uploaded resume: ${resumeName}` : 'Generating from your mastered skills'}
                      </div>
                      <div className="text-xs text-text-muted">30–60 seconds</div>
                    </div>
                  )}

                  {/* Resume panel */}
                  {resume && appStatus !== 'rejected' && (
                    <div className="border-t border-violet-500/20 p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="space-y-0.5">
                          <div className="text-xs uppercase tracking-widest text-violet-400 font-semibold">✨ Tailored Resume Ready</div>
                          {hasResume && resumeName && <div className="text-[10px] text-text-muted">Based on: {resumeName}</div>}
                        </div>
                        {/* Download options */}
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setResumes(r => { const n = new Map(r); const cur = n.get(idx)!; n.set(idx, { ...cur, editing: !cur.editing }); return n; })}
                            className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-text-muted hover:text-white transition">
                            {resume.editing ? '👁 View' : '✎ Edit'}
                          </button>
                          <button onClick={() => downloadPDF(idx)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold text-white transition"
                            style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}
                            title="Opens a print-ready page → press Ctrl+P → Save as PDF">
                            📄 Save as PDF
                          </button>
                          <button onClick={() => downloadMD(idx)}
                            className="text-xs px-3 py-1.5 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/10 transition font-semibold">
                            ⬇ .md
                          </button>
                          <button onClick={() => downloadTXT(idx)}
                            className="text-xs px-3 py-1.5 border border-white/15 rounded-lg text-text-muted hover:text-white transition">
                            ⬇ .txt
                          </button>
                        </div>
                      </div>

                      {resume.editing ? (
                        <textarea
                          ref={el => { if (el) textareaRefs.current.set(idx, el); }}
                          value={resume.content}
                          onChange={e => setResumes(r => { const n = new Map(r); n.set(idx, { ...resume, content: e.target.value }); return n; })}
                          className="w-full h-96 bg-white/[0.03] border border-violet-500/20 rounded-lg px-4 py-3 text-xs font-mono text-text-secondary focus:outline-none focus:border-violet-500/40 resize-none leading-relaxed" />
                      ) : (
                        <div className="max-h-80 overflow-y-auto bg-white/[0.02] border border-white/5 rounded-lg p-4">
                          <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed">{resume.content}</pre>
                        </div>
                      )}

                      {appStatus === 'idle' && (
                        <div className="flex gap-3 flex-wrap items-center">
                          <button onClick={() => handleOpenJob(idx)}
                            className="px-5 py-2.5 rounded-lg font-bold text-sm text-white"
                            style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 0 16px rgba(16,185,129,0.3)' }}>
                            🚀 Apply Now — Opens Job Page
                          </button>
                          <button onClick={() => tailorResume(idx)} disabled={isTailoring}
                            className="px-4 py-2.5 rounded-lg text-sm text-text-muted border border-white/10 hover:text-white transition">
                            ↺ Re-tailor
                          </button>
                        </div>
                      )}
                      {appStatus === 'opened' && (
                        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                          <div className="text-sm text-emerald-300 font-semibold">✅ Submit your tailored resume on the job page, then come back:</div>
                          <div className="flex gap-3 flex-wrap">
                            <button onClick={() => handleMarkApplied(idx)} disabled={isSaving}
                              className="px-5 py-2.5 rounded-lg font-bold text-sm text-white disabled:opacity-60"
                              style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                              {isSaving ? 'Saving…' : '✓ I Applied — Track It'}
                            </button>
                            <button onClick={() => handleMarkRejected(idx)}
                              className="px-4 py-2.5 rounded-lg text-sm text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 transition font-semibold">
                              ✗ Didn't Apply
                            </button>
                          </div>
                          <div className="text-xs text-text-muted">Stores: company · role · date/time · tailored resume · sets 2-day follow-up reminder</div>
                        </div>
                      )}
                      {appStatus === 'applied' && (
                        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-3">
                          <div className="text-sm text-emerald-300">✓ Tracked! Follow-up reminder in 2 days.</div>
                          <a href="/pipeline" className="text-xs px-3 py-1.5 border border-emerald-500/40 rounded-lg text-emerald-300 hover:bg-emerald-500/10 transition font-semibold shrink-0">Pipeline →</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating score bar */}
      {selected.size > 0 && !scoring && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass px-6 py-4 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 flex items-center gap-4 rounded-2xl" style={{ backdropFilter: 'blur(20px)' }}>
            <span className="text-sm text-white font-semibold">{selected.size} job{selected.size > 1 ? 's' : ''} selected</span>
            <button onClick={scoreSelected}
              className="px-5 py-2.5 rounded-lg font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              🎯 Score Selected
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-text-muted hover:text-white transition">Clear</button>
          </div>
        </div>
      )}

      {/* Scoring progress */}
      {scoring && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="glass px-6 py-4 border border-amber-500/40 shadow-2xl flex items-center gap-4 rounded-2xl">
            <div className="text-amber-400 animate-pulse">🎯</div>
            <span className="text-sm text-white">Scoring {scoringIdx} of {selected.size}…</span>
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(scoringIdx / selected.size) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {!searching && jobs.length === 0 && searched && (
        <div className="glass p-12 text-center text-text-muted">No results. Try a different role.</div>
      )}
    </div>
  );
}
