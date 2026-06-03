import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Settings</div>
        <h1 className="text-4xl font-extrabold gradient-text">Calendar + Notifications</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Connect Google Calendar to auto-schedule study blocks. Enable browser push for a daily reminder.
        </p>
      </header>
      <SettingsClient googleStatus={sp.google || ""} />
    </div>
  );
}
