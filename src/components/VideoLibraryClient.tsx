"use client";
import { useState } from "react";

type Video = { id: string; title: string; channel: string; minutes: number };
type Group = { phase: number; title: string; videos: Video[] };

export default function VideoLibraryClient({ phases }: { phases: Group[] }) {
  const [playing, setPlaying] = useState<Video | null>(null);
  const [filterPhase, setFilterPhase] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const visible = phases
    .filter((p) => filterPhase === "all" || p.phase === filterPhase)
    .map((p) => ({
      ...p,
      videos: p.videos.filter((v) =>
        !search.trim() ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.channel.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((p) => p.videos.length);

  return (
    <div className="space-y-6">
      {playing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-text-muted">Now playing</div>
                <div className="text-lg font-bold">{playing.title}</div>
                <div className="text-xs text-text-secondary">{playing.channel} · {playing.minutes} min</div>
              </div>
              <button onClick={() => setPlaying(null)} className="btn-ghost text-xs">Close ✕</button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1`}
                title={playing.title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      <div className="glass p-4 flex flex-wrap gap-3 items-center sticky top-0 z-10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search videos by title or channel…"
          className="flex-1 min-w-[220px] bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/60"
        />
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterPhase("all")} className={`text-xs px-3 py-1.5 rounded-full border transition ${filterPhase === "all" ? "bg-accent/20 border-accent/40 text-accent-light" : "border-white/10 text-text-secondary hover:bg-white/5"}`}>All</button>
          {phases.map((p) => (
            <button key={p.phase} onClick={() => setFilterPhase(p.phase)} className={`text-xs px-3 py-1.5 rounded-full border transition ${filterPhase === p.phase ? "bg-accent/20 border-accent/40 text-accent-light" : "border-white/10 text-text-secondary hover:bg-white/5"}`}>P{p.phase}</button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {visible.map((p) => (
          <section key={p.phase}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">Phase {p.phase} · {p.title}</h2>
              <span className="text-xs text-text-muted">{p.videos.length} videos</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {p.videos.map((v) => (
                <button key={v.id} onClick={() => setPlaying(v)} className="glass overflow-hidden text-left hover-lift hover:border-accent/30">
                  <div className="aspect-video bg-black/40 relative">
                    <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                      <span className="text-4xl">▶</span>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white">{v.minutes}m</span>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium leading-snug line-clamp-2">{v.title}</div>
                    <div className="text-[10px] text-text-muted mt-1">{v.channel}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
