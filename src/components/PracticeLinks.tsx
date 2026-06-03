import { linksFor, ALWAYS_ON, KIND_META, type Link } from "@/lib/practice-links";

export default function PracticeLinks({ code, phase }: { code: string; phase: number }) {
  const specific = linksFor(code, phase);
  const groups: Record<Link["kind"], Link[]> = { practice: [], ref: [], video: [], code: [], dataset: [] };
  const all = [...specific, ...ALWAYS_ON];
  const seen = new Set<string>();
  for (const l of all) {
    if (seen.has(l.url)) continue;
    seen.add(l.url);
    groups[l.kind].push(l);
  }

  const order: Link["kind"][] = ["practice", "code", "video", "ref", "dataset"];

  return (
    <div className="glass p-5">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">Practice + Resources</div>
          <div className="text-sm text-text-secondary">Topic-specific links + always-on practice sites</div>
        </div>
        <div className="text-[10px] text-text-muted">{all.length} links</div>
      </div>
      <div className="space-y-4">
        {order.map((kind) => {
          const list = groups[kind];
          if (!list.length) return null;
          const meta = KIND_META[kind];
          return (
            <div key={kind}>
              <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                <span>{meta.icon}</span><span>{meta.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {list.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs px-3 py-1.5 rounded-full border transition hover:scale-[1.03] hover:shadow-[0_0_15px_-4px_rgba(79,70,229,0.5)] ${meta.color}`}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
