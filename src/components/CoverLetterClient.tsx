"use client";
import { useEffect, useState } from "react";

type Letter = { id: string; company: string; role: string; body: string; hook: string; tone: string; updatedAt: string };

const TONES = ["professional", "enthusiastic", "concise"] as const;

export default function CoverLetterClient() {
  const [list, setList] = useState<Letter[]>([]);
  const [active, setActive] = useState<Letter | null>(null);
  const [form, setForm] = useState({ company: "", role: "", jdText: "", hook: "", tone: "professional" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    const d = await (await fetch("/api/cover-letter")).json();
    setList(d.list || []);
  }

  async function generate() {
    if (!form.company || !form.role || form.jdText.length < 80) { setErr("Fill all fields (JD ≥ 80 chars)"); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/cover-letter", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "generation failed");
      setActive(d.letter);
      await refresh();
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function saveEdit(body: string) {
    if (!active) return;
    const r = await fetch("/api/cover-letter", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active.id, body }) });
    const d = await r.json();
    if (d.letter) setActive(d.letter);
  }

  async function remove(id: string) {
    if (!confirm("Delete this letter?")) return;
    await fetch("/api/cover-letter", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setActive(null); await refresh();
  }

  async function copyToClipboard() {
    if (!active) return;
    await navigator.clipboard.writeText(active.body);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <aside className="space-y-4">
        <div className="glass p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-text-muted">Generate new letter</div>
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company"
                 className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role"
                 className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
          <textarea value={form.jdText} onChange={(e) => setForm({ ...form, jdText: e.target.value })} placeholder="Paste full job description…"
                    className="w-full h-32 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm resize-y focus:outline-none focus:border-accent/60" />
          <input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="Personal hook (optional)"
                 className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
          <div className="flex gap-1.5">
            {TONES.map((t) => (
              <button key={t} onClick={() => setForm({ ...form, tone: t })}
                      className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition ${form.tone === t ? "bg-accent/20 border-accent/40 text-accent-light" : "border-white/10 text-text-secondary hover:bg-white/5"}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary w-full disabled:opacity-40">
            {loading ? "Writing…" : "Generate letter"}
          </button>
          {err && <div className="text-xs text-rose-300">{err}</div>}
        </div>

        {list.length > 0 && (
          <div className="glass p-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Library ({list.length})</div>
            <div className="space-y-1">
              {list.map((l) => (
                <button key={l.id} onClick={() => setActive(l)}
                        className={`block w-full text-left px-2 py-1.5 rounded-lg text-xs transition ${active?.id === l.id ? "bg-accent/15 text-accent-light" : "hover:bg-white/5 text-text-secondary"}`}>
                  <div className="font-medium">{l.company} · {l.role}</div>
                  <div className="text-[10px] text-text-muted">{l.tone} · {new Date(l.updatedAt).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        {!active ? (
          <div className="glass p-10 text-center text-text-secondary">Generate a letter to begin.</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-text-muted">{active.tone}</div>
                <div className="text-lg font-bold">{active.company} — {active.role}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="btn-primary text-xs">{copied ? "✓ Copied" : "Copy to clipboard"}</button>
                <button onClick={() => remove(active.id)} className="btn-ghost text-xs text-rose-400">Delete</button>
              </div>
            </div>
            <textarea
              value={active.body}
              onChange={(e) => setActive({ ...active, body: e.target.value })}
              onBlur={() => saveEdit(active.body)}
              className="w-full min-h-[500px] bg-white/[0.03] border border-white/10 rounded-lg p-5 text-sm leading-relaxed focus:outline-none focus:border-accent/60 font-mono"
            />
            <div className="text-[10px] text-text-muted">Edit inline · auto-saves on blur</div>
          </div>
        )}
      </div>
    </div>
  );
}
