import InterviewPrepClient from "@/components/InterviewPrepClient";

export const dynamic = "force-dynamic";

export default function InterviewPrepPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Interview Loop Planner · Day-by-day prep generator</div>
        <h1 className="text-4xl font-extrabold gradient-text">Got an interview? Drop the details.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Enter company + role + date + round type. Gemini reads your mastered + weak topics and writes a focused day-by-day plan. Drill, mock, system design, behavioral — bucketed.
        </p>
      </header>
      <InterviewPrepClient />
    </div>
  );
}
