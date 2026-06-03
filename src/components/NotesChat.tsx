"use client";
import { useState } from "react";
import Link from "next/link";
import MarkdownView from "./MarkdownView";

type Ref = { title?: string; uri?: string; code?: string };
type Turn = { role: "user" | "assistant"; text: string; refs?: Ref[]; related?: string[] };

export default function NotesChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function send(text?: string) {
    const query = (text ?? q).trim();
    if (!query) return;
    setQ("");
    setErr("");
    const userTurn: Turn = { role: "user", text: query };
    const next = [...turns, userTurn];
    setTurns(next);
    setLoading(true);
    try {
      const res = await fetch("/api/notes-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          history: next.map((t) => ({ role: t.role, text: t.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "chat failed");
      setTurns([...next, { role: "assistant", text: data.text, refs: data.refs, related: data.related }]);
    } catch (e: any) {
      setErr(e.message);
      setTurns(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass p-4 min-h-[300px] max-h-[60vh] overflow-y-auto space-y-5">
        {turns.length === 0 && (
          <div className="text-text-muted text-sm italic">
            Try: "Compare LoRA vs QLoRA", "Why √d scaling in attention?", "When does RAG fail and how to fix it?"
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
              t.role === "assistant"
                ? "bg-accent/10 border border-accent/20 text-text-primary"
                : "bg-white/[0.06] border border-white/10 text-text-secondary text-sm"
            }`}>
              <div className="text-[10px] uppercase tracking-widest mb-1 opacity-60">{t.role === "user" ? "You" : "Notes Agent"}</div>
              {t.role === "assistant" ? <MarkdownView content={t.text} /> : <div className="whitespace-pre-wrap">{t.text}</div>}
              {t.refs && t.refs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/8">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Sources</div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.refs.map((r, j) => (
                      <span key={j} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-accent-light">
                        {r.code || r.title || "doc"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {t.related && t.related.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/8">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Follow-ups</div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.related.slice(0, 4).map((qq, j) => (
                      <button key={j} onClick={() => send(qq)} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-accent/15 hover:border-accent/30">
                        {qq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-text-muted italic">Agent searching notes…</div>}
      </div>

      {err && <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{err}</div>}

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="glass p-3 flex items-end gap-3">
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything grounded in your notes… (Enter to send, Shift+Enter for newline)"
          className="flex-1 bg-transparent border-none outline-none text-sm resize-none min-h-[42px] max-h-32"
        />
        <button type="submit" disabled={loading || !q.trim()} className="btn-primary text-sm disabled:opacity-40">
          Send
        </button>
      </form>
    </div>
  );
}
