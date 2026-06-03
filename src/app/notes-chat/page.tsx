import NotesChat from "@/components/NotesChat";

export const dynamic = "force-dynamic";

export default function NotesChatPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Grounded RAG · Powered by ₹94,800 credit</div>
        <h1 className="text-4xl font-extrabold gradient-text">Ask anything across all your notes.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Vertex AI Agent Builder retrieves from all 334 markdown files, cites the source, and grounds Gemini's answer.
        </p>
      </header>
      <NotesChat />
    </div>
  );
}
