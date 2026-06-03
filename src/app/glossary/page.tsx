import { GLOSSARY } from "@/lib/glossary";
import GlossaryClient from "@/components/GlossaryClient";

export const dynamic = "force-dynamic";

export default function GlossaryPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">AI / ML Glossary</div>
        <h1 className="text-4xl font-extrabold gradient-text">{GLOSSARY.length} terms · one click away.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Curated definitions of every term you need. Search by name, definition, or tag. No leaving the app.
        </p>
      </header>
      <GlossaryClient initial={GLOSSARY} />
    </div>
  );
}
