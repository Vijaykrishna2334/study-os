import Link from "next/link";
import { notFound } from "next/navigation";
import { findProblem } from "@/lib/dsa-problems";
import DSAEditor from "@/components/DSAEditor";

export const dynamic = "force-dynamic";

const DIFF_COLOR: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Hard: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default async function DSAProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = findProblem(slug);
  if (!p) notFound();

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <div className="text-xs text-text-muted flex items-center gap-2">
        <Link href="/dsa" className="hover:text-accent-light">DSA Grinder</Link>
        <span>›</span>
        <span className="text-text-secondary">{p.pattern}</span>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold gradient-text">{p.title}</h1>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${DIFF_COLOR[p.difficulty]}`}>{p.difficulty}</span>
            <span className="text-[10px] uppercase tracking-widest text-text-muted">{p.pattern}</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div className="space-y-4">
          <div className="glass p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Problem</div>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{p.prompt}</p>
          </div>

          <div className="glass p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Function signature</div>
            <pre className="text-xs font-mono bg-black/40 rounded p-2 overflow-x-auto"><code>{p.signature}</code></pre>
          </div>

          <details className="glass p-5">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-text-muted">Show hint</summary>
            <div className="mt-2 text-sm text-text-secondary italic">💡 {p.hint}</div>
          </details>

          <div className="glass p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Test cases ({p.tests.length})</div>
            <ul className="text-xs space-y-1 font-mono">
              {p.tests.map((t, i) => (
                <li key={i} className="text-text-secondary">
                  <span className="text-accent-light">{t.input}</span> ➞ <span className="text-emerald-300">{t.expected}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DSAEditor problem={p} />
      </div>
    </div>
  );
}
