import ResumeBuilder from "@/components/ResumeBuilder";

export const dynamic = "force-dynamic";

export default function ResumePage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Resume Builder · Live preview + browser-print PDF</div>
        <h1 className="text-4xl font-extrabold gradient-text">One resume per role.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Edit on the left, preview on the right. Click "Save as PDF" → use your browser's print dialog → save as PDF. ATS-friendly single-column layout.
        </p>
      </header>
      <ResumeBuilder />
    </div>
  );
}
