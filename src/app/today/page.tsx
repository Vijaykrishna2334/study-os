import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PHASE_TITLES, TIER_META } from "@/lib/tiers";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  // Pick today's queue: Tier-A untouched first, then Tier-A in-flight, then Tier-B in-flight.
  const tA_todo = await prisma.topic.findMany({
    where: { tier: "A", confidence: 0 },
    orderBy: [{ phase: "asc" }, { order: "asc" }],
    take: 4,
  });
  const inFlight = await prisma.topic.findMany({
    where: { confidence: { gt: 0, lt: 4 } },
    orderBy: { lastTouched: "desc" },
    take: 4,
  });
  const stale = await prisma.topic.findMany({
    where: { confidence: { gte: 4 }, lastTouched: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) } },
    orderBy: { lastTouched: "asc" },
    take: 3,
  });

  const dsaBlock = "DSA · 60 min · pattern-based";
  const sysBlock = "System Design · weekly template";

  return (
    <div className="space-y-8 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Today · {new Date().toDateString()}</div>
        <h1 className="text-4xl font-extrabold gradient-text">Your Daily Block</h1>
        <p className="text-text-secondary mt-2">3 hr deep study · 1 hr DSA · 30 min behavioral.</p>
      </header>

      <Section title="Deep Study · Tier-A queue" hint="Front-load the must-master topics first">
        {tA_todo.length === 0 ? <Empty msg="Tier-A clear — switch to Tier-B." /> : tA_todo.map((t) => <Row key={t.id} t={t} />)}
      </Section>

      <Section title="Continue · in-flight" hint="Already started — push to confidence ≥ 4">
        {inFlight.length === 0 ? <Empty msg="Nothing in flight. Start a fresh Tier-A topic." /> : inFlight.map((t) => <Row key={t.id} t={t} />)}
      </Section>

      <Section title="Cold-start check · refresh" hint="Mastered but untouched >14 days. Whiteboard-test yourself.">
        {stale.length === 0 ? <Empty msg="No stale topics. Recent retention strong." /> : stale.map((t) => <Row key={t.id} t={t} />)}
      </Section>

      <Section title="Parallel tracks (non-negotiable)" hint="Outside the curriculum but tested in interviews">
        <div className="grid sm:grid-cols-2 gap-3">
          <Block label="DSA" body={dsaBlock} />
          <Block label="System Design" body={sysBlock} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-text-muted">{hint}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ t }: { t: any }) {
  const meta = TIER_META[t.tier as "A"|"B"|"C"|"D"];
  return (
    <Link href={`/topics/${t.id}`} className="glass px-4 py-3 hover-lift flex items-center gap-4 hover:border-accent/30">
      <span className="text-[10px] font-mono text-text-muted w-24 truncate">{t.code}</span>
      <span className="flex-1 text-sm font-medium truncate">{t.title}</span>
      <span className="text-[10px] text-text-muted hidden md:inline">P{t.phase} · {PHASE_TITLES[t.phase]?.split("—")[0].trim()}</span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${meta.ring} ${meta.color}`}>{t.tier}</span>
      <span className="text-xs tabular-nums w-8 text-right text-text-secondary">{t.confidence}/5</span>
    </Link>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-text-muted italic px-2">{msg}</div>;
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div className="glass p-4">
      <div className="text-[10px] uppercase tracking-widest text-accent-light">{label}</div>
      <div className="text-sm mt-1 text-text-secondary">{body}</div>
    </div>
  );
}
