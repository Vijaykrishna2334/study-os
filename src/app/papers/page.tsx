import PapersClient from "@/components/PapersClient";

export const dynamic = "force-dynamic";

export default function PapersPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Paper Reader · arXiv + Gemini summariser</div>
        <h1 className="text-4xl font-extrabold gradient-text">Read papers without leaving.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Paste any arXiv URL (or just the ID). The app fetches the abstract and Gemini produces a structured summary: problem, key idea, results, limitations, interview Qs. Stored forever in your library.
        </p>
      </header>
      <PapersClient />
    </div>
  );
}
