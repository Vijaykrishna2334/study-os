import Link from "next/link";
import { DSA_PROBLEMS, problemsByPattern } from "@/lib/dsa-problems";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DIFF_COLOR: Record<string, string> = {
  Easy:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Hard:   "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default async function DSAPage() {
  const groups = problemsByPattern();
  const attempts = await prisma.dSAAttempt.findMany({ where: { passed: true }, distinct: ["problemSlug"], select: { problemSlug: true } });
  const solved = new Set(attempts.map((a) => a.problemSlug));
  const total = DSA_PROBLEMS.length;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">DSA Grinder · auto-graded in-browser via Pyodide</div>
        <h1 className="text-4xl font-extrabold gradient-text">{solved.size} / {total} solved</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Pattern-based problem bank. Write Python, hit Run, get instant pass/fail against test cases. No LeetCode needed.
        </p>
      </header>

      <div className="space-y-6">
        {[...groups.keys()].map((pattern) => (
          <section key={pattern}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">{pattern}</h2>
              <span className="text-xs text-text-muted">{groups.get(pattern)!.length} problems</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.get(pattern)!.map((p) => (
                <Link key={p.slug} href={`/dsa/${p.slug}`} className="glass p-4 hover-lift hover:border-accent/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DIFF_COLOR[p.difficulty]}`}>{p.difficulty}</span>
                    {solved.has(p.slug) && <span className="text-[10px] font-semibold text-emerald-300">✓ solved</span>}
                  </div>
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-text-muted line-clamp-2">{p.prompt}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
