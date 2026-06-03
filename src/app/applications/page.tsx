import ApplicationsClient from "@/components/ApplicationsClient";

export const dynamic = "force-dynamic";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Application Pipeline · Job-search CRM</div>
        <h1 className="text-4xl font-extrabold gradient-text">Track every job, every stage.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          One row per application. Move through statuses, log next actions, see funnel metrics. Works alongside ApplyPilot (auto-import) or fully manual.
        </p>
      </header>
      <ApplicationsClient />
    </div>
  );
}
