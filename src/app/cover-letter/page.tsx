import CoverLetterClient from "@/components/CoverLetterClient";

export const dynamic = "force-dynamic";

export default function CoverLetterPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Cover Letter Generator · Gemini-written, your voice</div>
        <h1 className="text-4xl font-extrabold gradient-text">One letter per role, in 30 seconds.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Paste the JD. Pick a tone. Gemini drafts a metric-led, no-fluff cover letter using your real accomplishments. Edit, save, copy.
        </p>
      </header>
      <CoverLetterClient />
    </div>
  );
}
