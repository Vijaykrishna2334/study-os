import SearchClient from "@/components/SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Vertex AI Search · Powered by ₹94,800 credit</div>
        <h1 className="text-4xl font-extrabold gradient-text">Search 334 notes instantly.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Semantic search across every phase. Type a concept — "attention scaling", "LoRA rank", "RAG eval" — get exact passages with snippets.
        </p>
      </header>
      <SearchClient />
    </div>
  );
}
