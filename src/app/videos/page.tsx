import { allVideos } from "@/lib/video-library";
import { PHASE_TITLES } from "@/lib/tiers";
import VideoLibraryClient from "@/components/VideoLibraryClient";

export const dynamic = "force-dynamic";

export default function VideosPage() {
  const phases = allVideos();
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Video Library</div>
        <h1 className="text-4xl font-extrabold gradient-text">Watch without leaving.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          {phases.reduce((s, p) => s + p.videos.length, 0)} curated videos across 12 phases — 3Blue1Brown, StatQuest, Karpathy, fast.ai, Anthropic, LangChain. Click any thumbnail to watch inline.
        </p>
      </header>
      <VideoLibraryClient phases={phases.map((p) => ({ ...p, title: PHASE_TITLES[p.phase] || `Phase ${p.phase}` }))} />
    </div>
  );
}
