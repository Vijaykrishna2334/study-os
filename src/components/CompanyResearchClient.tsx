"use client";
import { useEffect, useState } from "react";

type Research = {
  id: string; slug: string; name: string;
  overview: string; productsJSON: string; leadershipJSON: string;
  recentNews: string; interviewProcess: string; commonQuestions: string;
  cultureNotes: string; techStack: string; generatedAt: string;
};

const SUGGESTED = [
  "Anthropic","OpenAI","Google DeepMind","Meta AI","Mistral AI","Cohere","Hugging Face",
  "Microsoft AI","NVIDIA","Stripe","Databricks","Snowflake","Scale AI","Perplexity",
  "Sarvam AI","Krutrim","Razorpay","Swiggy","Flipkart","Zomato","Phenom","Postman",
];

export default function CompanyResearchClient() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState<Research | null>(null);
  const [list, setList] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    const d = await (await fetch("/api/company-research")).json();
    setList(d.list || []);
  }

  async function research(name?: string, force = false) {
    const q = (name || input).trim();
    if (!q) return;
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/company-research", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: q, force }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      setActive(d.research);
      await refresh();
      if (!name) setInput("");
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const products: string[] = active ? safeJSON(active.productsJSON, []) : [];
  const leadership: string[] = active ? safeJSON(active.leadershipJSON, []) : [];
  const questions: string[] = active ? safeJSON(active.commonQuestions, []) : [];

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6">
      <aside className="space-y-4">
        <div className="glass p-4 space-y-3">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") research(); }}
            placeholder="e.g. Anthropic, Stripe, Krutrim"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/60"
          />
          <button onClick={() => research()} disabled={loading || !input.trim()} className="btn-primary w-full disabled:opacity-40">
            {loading ? "Researching…" : "Research company"}
          </button>
          {err && <div className="text-xs text-rose-300">{err}</div>}
        </div>

        <div className="glass p-4">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Suggested</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map((c) => (
              <button key={c} onClick={() => research(c)}
                      className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-accent/15 hover:border-accent/30 transition">{c}</button>
            ))}
          </div>
        </div>

        {list.length > 0 && (
          <div className="glass p-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Library ({list.length})</div>
            <div className="space-y-1">
              {list.map((r) => (
                <button key={r.id} onClick={() => setActive(r)}
                        className={`block w-full text-left px-2 py-1.5 rounded-lg text-xs transition ${active?.id === r.id ? "bg-accent/15 text-accent-light" : "hover:bg-white/5 text-text-secondary"}`}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div>
        {!active ? (
          <div className="glass p-10 text-center">
            <div className="text-text-secondary">Type a company name or click a suggestion.</div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="glass p-6">
              <h2 className="text-2xl font-bold gradient-text">{active.name}</h2>
              <p className="text-sm text-text-secondary mt-3 leading-relaxed whitespace-pre-wrap">{active.overview}</p>
              <button onClick={() => research(active.name, true)} className="btn-ghost text-xs mt-3">Regenerate</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {products.length > 0 && <Card title="Products" items={products} />}
              {leadership.length > 0 && <Card title="Leadership" items={leadership} />}
            </div>

            {active.techStack && <Section title="Tech stack" body={active.techStack} />}
            {active.recentNews && <Section title="Recent news (2024-2026)" body={active.recentNews} />}
            {active.interviewProcess && <Section title="Interview process" body={active.interviewProcess} />}
            {active.cultureNotes && <Section title="Culture" body={active.cultureNotes} />}

            {questions.length > 0 && (
              <div className="glass p-5">
                <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Common interview questions</div>
                <ol className="list-decimal list-inside text-sm text-text-primary space-y-1.5">
                  {questions.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass p-5">
      <div className="text-xs uppercase tracking-widest text-text-muted mb-2">{title}</div>
      <ul className="text-sm text-text-primary space-y-1 list-disc list-inside">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}
function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass p-5">
      <div className="text-xs uppercase tracking-widest text-text-muted mb-2">{title}</div>
      <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{body}</div>
    </div>
  );
}
function safeJSON<T>(s: string, fallback: T): T { try { return JSON.parse(s); } catch { return fallback; } }
