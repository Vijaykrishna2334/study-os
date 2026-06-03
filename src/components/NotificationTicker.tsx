"use client";
import { useEffect } from "react";

// Runs in the background while the app is open. Pings /api/push/tick every 5 minutes.
// The endpoint internally checks if today's notification time has passed and sends only once per day.
export default function NotificationTicker() {
  useEffect(() => {
    let stopped = false;
    async function tick() {
      try { await fetch("/api/push/tick", { method: "POST" }); } catch {}
      if (!stopped) setTimeout(tick, 5 * 60 * 1000);
    }
    setTimeout(tick, 3000);
    return () => { stopped = true; };
  }, []);
  return null;
}
