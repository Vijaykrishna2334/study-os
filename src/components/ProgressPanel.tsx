"use client";
import { useState, useTransition } from "react";

type Topic = {
  id: string;
  read: boolean;
  rederived: boolean;
  artifact: boolean;
  taughtBack: boolean;
  mocked: boolean;
  confidence: number;
  notes: string;
};

const CHECKS: { key: keyof Topic; label: string; hint: string }[] = [
  { key: "read",       label: "Read",         hint: "Read the .md notes" },
  { key: "rederived",  label: "Re-derived",   hint: "Whiteboarded from scratch" },
  { key: "artifact",   label: "Artifact",     hint: "Built code / committed" },
  { key: "taughtBack", label: "Taught back",  hint: "5-min Loom or explain aloud" },
  { key: "mocked",     label: "Mocked",       hint: "Answered in a mock interview" },
];

export default function ProgressPanel({ topic }: { topic: Topic }) {
  const [state, setState] = useState(topic);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string>("");

  function patch(payload: Partial<Topic>) {
    const next = { ...state, ...payload };
    setState(next);
    start(async () => {
      await fetch(`/api/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: topic.id, ...payload }),
      });
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  return (
    <div className="glass p-5 space-y-5 sticky top-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-muted mb-3">5-Layer Mastery</div>
        <div className="space-y-2">
          {CHECKS.map((c) => {
            const on = state[c.key] as boolean;
            return (
              <button
                key={c.key}
                onClick={() => patch({ [c.key]: !on } as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition ${
                  on
                    ? "bg-accent/15 border-accent/40 text-accent-light"
                    : "border-white/8 hover:bg-white/5 text-text-secondary"
                }`}
              >
                <span className={`w-4 h-4 rounded border ${on ? "bg-accent border-accent" : "border-white/30"} flex items-center justify-center text-[10px] text-white`}>
                  {on ? "✓" : ""}
                </span>
                <span className="flex-1">
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-[11px] text-text-muted">{c.hint}</div>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-text-muted mb-2 flex justify-between">
          <span>Confidence</span>
          <span className="text-text-secondary">{state.confidence}/5</span>
        </div>
        <input
          type="range" min={0} max={5} step={1}
          value={state.confidence}
          onChange={(e) => patch({ confidence: parseInt(e.target.value) })}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-text-muted mt-1 px-1">
          <span>None</span><span>Shaky</span><span>OK</span><span>Solid</span><span>Owned</span><span>Teach</span>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Personal Notes</div>
        <textarea
          value={state.notes}
          onChange={(e) => setState({ ...state, notes: e.target.value })}
          onBlur={() => patch({ notes: state.notes })}
          placeholder="Your shorthand, pitfalls, derivations…"
          className="w-full h-28 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:border-accent/60"
        />
      </div>

      <div className="text-[10px] text-text-muted text-right">
        {pending ? "Saving…" : savedAt ? `Saved ${savedAt}` : "Auto-saves"}
      </div>
    </div>
  );
}
