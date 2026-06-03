"use client";
import { useEffect, useState } from "react";

type State = {
  settings: {
    notifyEnabled: boolean; notifyHour: number; notifyMinute: number; notifyMessage: string;
    calendarSyncEnabled: boolean;
    studyStartHour: number; studyDurationHours: number; dsaStartHour: number; behavioralStartHour: number;
    timezone: string;
  };
  google: { connected: boolean; email?: string };
  pushSubscribers: number;
};

export default function SettingsClient({ googleStatus }: { googleStatus: string }) {
  const [s, setS] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setS);
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
      navigator.serviceWorker?.getRegistration().then(async (reg) => {
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setSubscribed(!!sub);
        }
      });
    }
  }, []);

  async function patch(p: Partial<State["settings"]>) {
    if (!s) return;
    const next = { ...s, settings: { ...s.settings, ...p } };
    setS(next);
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
  }

  async function connectCalendar() { window.location.href = "/api/auth/google"; }
  async function disconnectCalendar() {
    setBusy(true);
    await fetch("/api/calendar/sync", { method: "DELETE" });
    setBusy(false);
    location.reload();
  }
  async function syncCalendar() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/calendar/sync", { method: "POST" });
    const d = await r.json();
    setBusy(false);
    setMsg(d.error || `Synced ${d.total || 0} events to Google Calendar.`);
  }

  async function enableNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setMsg("Push not supported on this browser."); return;
    }
    setBusy(true); setMsg("");
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") { setMsg("Notification permission denied."); setBusy(false); return; }

      const reg = await navigator.serviceWorker.register("/sw.js");
      const v = await (await fetch("/api/push/vapid")).json();
      if (!v.publicKey) { setMsg("VAPID keys not configured on server — see README."); setBusy(false); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(v.publicKey) as BufferSource,
      });
      await fetch("/api/push/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: sub.toJSON().keys,
          userAgent: navigator.userAgent,
        }),
      });
      setSubscribed(true);
      await patch({ notifyEnabled: true });
      setMsg("Notifications enabled. You'll get a daily reminder.");
    } catch (e: any) { setMsg(e.message); }
    setBusy(false);
  }
  async function sendTestPush() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/push/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Study OS — Test", body: "If you see this, push works." }) });
    const d = await r.json();
    setBusy(false);
    setMsg(d.ok ? `Sent test push to ${d.sent} device(s).` : `Error: ${d.error}`);
  }
  async function disableNotifications() {
    setBusy(true);
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    await patch({ notifyEnabled: false });
    setSubscribed(false);
    setBusy(false);
  }

  if (!s) return <div className="glass p-6 text-text-muted">Loading…</div>;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      {googleStatus && (
        <div className={`glass p-4 text-sm ${googleStatus === "connected" ? "border-emerald-500/30" : "border-rose-500/30"}`}>
          {googleStatus === "connected" && "✓ Google Calendar connected."}
          {googleStatus === "error" && "✗ Google connection failed. Check your OAuth client setup."}
          {googleStatus === "missing_code" && "✗ Google OAuth flow did not return a code."}
        </div>
      )}

      {msg && <div className="glass p-3 text-sm text-accent-light">{msg}</div>}

      <section className="glass p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">Google Calendar</div>
          <h2 className="text-lg font-bold mt-1">Auto-schedule study blocks</h2>
          <p className="text-sm text-text-secondary mt-1">
            Push the next 14 days of deep-study, DSA, and behavioral practice blocks directly into your Google Calendar.
          </p>
        </div>

        {s.google.connected ? (
          <div className="space-y-3">
            <div className="text-sm text-emerald-300">Connected as <b>{s.google.email || "—"}</b></div>
            <div className="grid sm:grid-cols-3 gap-3">
              <NumberField label="Deep-study start hour (24h)" value={s.settings.studyStartHour} onChange={(v) => patch({ studyStartHour: v })} min={0} max={23} />
              <NumberField label="Deep-study duration (hours)" value={s.settings.studyDurationHours} onChange={(v) => patch({ studyDurationHours: v })} min={1} max={6} />
              <NumberField label="DSA start hour" value={s.settings.dsaStartHour} onChange={(v) => patch({ dsaStartHour: v })} min={0} max={23} />
              <NumberField label="Behavioral start hour" value={s.settings.behavioralStartHour} onChange={(v) => patch({ behavioralStartHour: v })} min={0} max={23} />
              <Field label="Timezone" value={s.settings.timezone} onChange={(v) => patch({ timezone: v })} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={syncCalendar} disabled={busy} className="btn-primary disabled:opacity-40">{busy ? "Syncing…" : "Sync next 14 days"}</button>
              <button onClick={disconnectCalendar} disabled={busy} className="btn-ghost text-xs">Disconnect</button>
            </div>
          </div>
        ) : (
          <button onClick={connectCalendar} className="btn-primary">Connect Google Calendar</button>
        )}
      </section>

      <section className="glass p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">Daily Push Notifications</div>
          <h2 className="text-lg font-bold mt-1">Daily study reminder</h2>
          <p className="text-sm text-text-secondary mt-1">
            Browser push notification fires once per day at the time you set. {s.pushSubscribers} device(s) subscribed.
            <br/>Status: <b className={permission === "granted" ? "text-emerald-300" : "text-amber-300"}>{permission}</b>
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <NumberField label="Hour (24h)" value={s.settings.notifyHour} onChange={(v) => patch({ notifyHour: v })} min={0} max={23} />
          <NumberField label="Minute" value={s.settings.notifyMinute} onChange={(v) => patch({ notifyMinute: v })} min={0} max={59} />
          <Field label="Message (override)" value={s.settings.notifyMessage.replace(/\s*##DAY:[^#]+##$/, "")} onChange={(v) => patch({ notifyMessage: v })} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {!subscribed && <button onClick={enableNotifications} disabled={busy || permission === "unsupported"} className="btn-primary disabled:opacity-40">Enable notifications</button>}
          {subscribed && <button onClick={sendTestPush} disabled={busy} className="btn-primary disabled:opacity-40">Send test push</button>}
          {subscribed && <button onClick={disableNotifications} disabled={busy} className="btn-ghost text-xs">Disable</button>}
        </div>
        {permission === "unsupported" && <div className="text-xs text-rose-300">This browser does not support web push. Use Chrome / Edge / Firefox.</div>}
      </section>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      <input
        type="number" value={value} min={min} max={max}
        onChange={(e) => onChange(parseInt(e.target.value || "0"))}
        className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60"
      />
    </label>
  );
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      <input
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60"
      />
    </label>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
