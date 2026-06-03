import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PHASE_TITLES, TIER_META } from "@/lib/tiers";
import StreakHeatmap from "@/components/StreakHeatmap";
import GcpCreditsCard from "@/components/GcpCreditsWidget";
import XPBadge from "@/components/XPBadge";
import GoalCountdown from "@/components/GoalCountdown";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const topics = await prisma.topic.findMany({ orderBy: [{ phase: "asc" }, { order: "asc" }] });

  // Job hunt stats
  const apps       = await prisma.application.findMany({ select: { status: true, fitScore: true } });
  const totalApps  = apps.length;
  const interviews = apps.filter(a => ["screen","technical","onsite"].includes(a.status)).length;
  const offers     = apps.filter(a => a.status === "offer").length;
  const avgFit     = totalApps ? Math.round(apps.reduce((s, a) => s + (a.fitScore ?? 0), 0) / totalApps) : 0;
  const total = topics.length;
  const done = topics.filter((t) => t.confidence >= 4).length;
  const inFlight = topics.filter((t) => t.confidence > 0 && t.confidence < 4).length;
  const artifactCount = topics.filter((t) => t.artifact).length;
  const tierA = topics.filter((t) => t.tier === "A");
  const tierAdone = tierA.filter((t) => t.confidence >= 4).length;

  const byPhase = new Map<number, typeof topics>();
  topics.forEach((t) => {
    if (!byPhase.has(t.phase)) byPhase.set(t.phase, []);
    byPhase.get(t.phase)!.push(t);
  });

  if (total === 0) {
    return (
      <div className="glass p-10 text-center">
        <h1 className="text-3xl font-bold gradient-text mb-3">Welcome to Study OS</h1>
        <p className="text-text-secondary mb-6">No topics ingested yet. Run setup to scan your study folder.</p>
        <pre className="text-left bg-black/40 p-4 rounded-lg font-mono text-sm text-accent-light max-w-md mx-auto">
{`npm install
npm run setup
npm run dev`}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeInUp_0.5s_ease-out]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Dashboard</div>
          <h1 className="text-4xl md:text-5xl font-extrabold gradient-text leading-tight">
            Interview-Ready by Design.
          </h1>
          <p className="text-text-secondary mt-2 max-w-2xl">
            340 topics across 12 phases · Gemini-powered Q&A · confidence-tracked progress.
          </p>
        </div>
        <Link href="/topics?tier=A" className="btn-primary">Resume Tier-A →</Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Topics" value={total} hint="across 12 phases" />
        <Stat label="Mastered" value={done} hint={`${pct(done, total)}% complete`} accent />
        <Stat label="In Flight" value={inFlight} hint="confidence 1–3" />
        <Stat label="Tier-A Done" value={`${tierAdone}/${tierA.length}`} hint="must-master core" />
      </section>

      {/* Job hunt stats */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-[0.2em] text-indigo-400/70">Job Hunt Progress</div>
          <Link href="/pipeline" className="text-xs text-indigo-400 hover:underline">Pipeline →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Applied"    value={totalApps}  hint="total applications" />
          <Stat label="Interviews" value={interviews}  hint="screen + technical + onsite" />
          <Stat label="Offers"     value={offers}      hint={offers > 0 ? "🎉 congrats!" : "keep applying"} accent={offers > 0} />
          <Stat label="Avg Fit Score" value={totalApps ? `${avgFit}%` : "—"} hint="across all applications" />
        </div>
      </section>

      <GoalCountdown />
      <StreakHeatmap />
      <XPBadge />

      <section className="glass p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Phase Heatmap</h2>
          <Link href="/topics" className="text-sm text-accent-light hover:underline">Browse all →</Link>
        </div>
        <div className="space-y-3">
          {[...byPhase.keys()].sort((a, b) => a - b).map((p) => {
            const list = byPhase.get(p)!;
            const pdone = list.filter((t) => t.confidence >= 4).length;
            const pct = list.length ? Math.round((pdone / list.length) * 100) : 0;
            return (
              <Link
                key={p}
                href={`/topics?phase=${p}`}
                className="block hover-lift rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-accent/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">Phase {p}</span>
                    <span className="text-sm font-medium">{PHASE_TITLES[p]}</span>
                  </div>
                  <span className="text-xs text-text-secondary tabular-nums">{pdone}/{list.length} · {pct}%</span>
                </div>
                <div className="flex gap-[2px] h-2">
                  {list.map((t) => {
                    const c = t.confidence;
                    const bg = c >= 4 ? "bg-emerald-400" : c === 3 ? "bg-accent-light" : c >= 1 ? "bg-amber-500/70" : "bg-white/8";
                    return <span key={t.id} className={`${bg} flex-1 rounded-[1px]`} title={`${t.code} · conf ${c}`} />;
                  })}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {(["A","B","C","D"] as const).map((tier) => {
          const list = topics.filter((t) => t.tier === tier);
          const done = list.filter((t) => t.confidence >= 4).length;
          const meta = TIER_META[tier];
          return (
            <Link key={tier} href={`/topics?tier=${tier}`} className={`glass p-5 hover-lift ring-1 ${meta.ring}`}>
              <div className={`text-xs uppercase tracking-widest ${meta.color}`}>Tier {tier} · {meta.label}</div>
              <div className="text-3xl font-extrabold mt-2">{done}<span className="text-text-muted text-lg font-medium">/{list.length}</span></div>
              <div className="text-xs text-text-secondary mt-1">{pct(done, list.length)}% mastered</div>
            </Link>
          );
        })}
      </section>

      <section className="glass p-6">
        <div className="text-sm font-semibold mb-3">Portfolio Artifacts</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-accent-violet" style={{ width: `${pct(artifactCount, total)}%` }} />
          </div>
          <div className="text-xs text-text-secondary tabular-nums">{artifactCount} of {total} topics shipped</div>
        </div>
      </section>

      <GcpCreditsCard />
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: number | string; hint: string; accent?: boolean }) {
  return (
    <div className={`glass p-5 hover-lift ${accent ? "ring-1 ring-accent/40 bg-accent/[0.04]" : ""}`}>
      <div className="text-[11px] uppercase tracking-widest text-text-muted">{label}</div>
      <div className={`text-3xl font-extrabold mt-1 tabular-nums ${accent ? "gradient-text" : ""}`}>{value}</div>
      <div className="text-xs text-text-secondary mt-1">{hint}</div>
    </div>
  );
}

function pct(a: number, b: number): number {
  return b ? Math.round((a / b) * 100) : 0;
}
