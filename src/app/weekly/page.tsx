import WeeklyReviewClient from "@/components/WeeklyReviewClient";

export const dynamic = "force-dynamic";

export default function WeeklyPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Sunday Review · powered by Gemini</div>
        <h1 className="text-4xl font-extrabold gradient-text">Weekly auto-review.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Gemini analyses your last 7 days of activity — minutes studied, topics mastered, what's stagnated — and produces a day-by-day plan for next week plus one contrarian recommendation.
        </p>
      </header>

      <WeeklyReviewClient />

      <div className="glass p-5">
        <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Subscribe to your study calendar</div>
        <p className="text-sm text-text-secondary mb-3">
          Get the next 14 days of study blocks (deep study 9–12 AM, DSA 2–3 PM, behavioral 7:30–8 PM IST) on your real calendar.
        </p>
        <div className="flex gap-2 flex-wrap">
          <a href="/api/calendar/ics" className="btn-primary text-xs" download>Download .ics file</a>
          <span className="text-[11px] text-text-muted self-center">Open with Google / Apple / Outlook calendar → "Import calendar"</span>
        </div>
      </div>
    </div>
  );
}
