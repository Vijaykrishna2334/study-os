import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PHASE_TITLES, TIER_META } from "@/lib/tiers";

export const dynamic = "force-dynamic";

type SP = { phase?: string; tier?: string; q?: string; status?: string };

export default async function TopicsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const phase = sp.phase ? parseInt(sp.phase) : undefined;
  const tier = sp.tier && ["A","B","C","D"].includes(sp.tier) ? sp.tier : undefined;
  const q = sp.q?.trim().toLowerCase();
  const status = sp.status;

  const where: any = {};
  if (phase) where.phase = phase;
  if (tier) where.tier = tier;
  if (status === "done") where.confidence = { gte: 4 };
  if (status === "todo") where.confidence = 0;
  if (status === "flight") where.confidence = { gt: 0, lt: 4 };

  const topics = await prisma.topic.findMany({ where, orderBy: [{ phase: "asc" }, { order: "asc" }] });
  const filtered = q ? topics.filter((t) => t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)) : topics;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">All Topics</div>
        <h1 className="text-3xl font-extrabold gradient-text">{filtered.length} topics</h1>
      </header>

      <div className="glass p-4 flex flex-wrap gap-3 items-center">
        <FilterGroup label="Phase" current={phase ? String(phase) : ""} options={["", ...Array.from({ length: 12 }, (_, i) => String(i + 1))]} param="phase" />
        <FilterGroup label="Tier" current={tier || ""} options={["", "A", "B", "C", "D"]} param="tier" />
        <FilterGroup label="Status" current={status || ""} options={[
          { v: "", l: "All" }, { v: "todo", l: "Untouched" }, { v: "flight", l: "In Flight" }, { v: "done", l: "Mastered" },
        ]} param="status" />
        <form className="ml-auto" action="/topics">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search title or code…"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]"
          />
        </form>
      </div>

      <div className="grid gap-2">
        {filtered.map((t) => {
          const meta = TIER_META[t.tier as "A"|"B"|"C"|"D"];
          const dot = t.confidence >= 4 ? "bg-emerald-400" : t.confidence === 3 ? "bg-accent-light" : t.confidence >= 1 ? "bg-amber-400" : "bg-white/15";
          return (
            <Link
              key={t.id}
              href={`/topics/${t.id}`}
              className="glass px-4 py-3 hover-lift flex items-center gap-4 hover:border-accent/30"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <span className="text-[10px] font-mono text-text-muted w-24 truncate">{t.code}</span>
              <span className="flex-1 text-sm font-medium truncate">{t.title}</span>
              <span className="text-[10px] text-text-muted hidden md:inline">P{t.phase} · {PHASE_TITLES[t.phase]?.split("—")[0].trim()}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${meta.ring} ${meta.color}`}>{t.tier}</span>
              <span className="text-xs tabular-nums w-8 text-right text-text-secondary">{t.confidence}/5</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function FilterGroup({
  label, current, options, param,
}: {
  label: string;
  current: string;
  options: (string | { v: string; l: string })[];
  param: string;
}) {
  const opts = options.map((o) => (typeof o === "string" ? { v: o, l: o || "All" } : o));
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] uppercase tracking-widest text-text-muted mr-1">{label}</span>
      {opts.map((o) => {
        const active = current === o.v;
        const q = new URLSearchParams();
        if (o.v) q.set(param, o.v);
        return (
          <Link
            key={o.v || "all"}
            href={`/topics${q.toString() ? "?" + q.toString() : ""}`}
            className={`text-xs px-2.5 py-1 rounded-full border transition ${
              active
                ? "bg-accent/20 border-accent/40 text-accent-light"
                : "border-white/10 text-text-secondary hover:bg-white/5 hover:text-text-primary"
            }`}
          >
            {o.l}
          </Link>
        );
      })}
    </div>
  );
}
