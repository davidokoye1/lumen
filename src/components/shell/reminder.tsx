"use client";

import { useEffect } from "react";

/**
 * Daily reminder via the browser Notification API. Works while Lumen is open
 * in a tab; fires once per day at or after the chosen time if you haven't practiced.
 */
export function ReminderWatcher({ enabled, time, practicedToday }: { enabled: boolean; time: string; practicedToday: boolean }) {
  useEffect(() => {
    if (!enabled || practicedToday || typeof Notification === "undefined") return;
    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const [h, m] = time.split(":").map(Number);
      const key = `lumen-reminded-${now.toDateString()}`;
      if (localStorage.getItem(key)) return;
      if (now.getHours() * 60 + now.getMinutes() >= h * 60 + m) {
        localStorage.setItem(key, "1");
        new Notification("Time for today's reading", {
          body: "A ten-minute session keeps your streak and your progress moving.",
          icon: "/icon.svg",
        });
      }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [enabled, time, practicedToday]);
  return null;
}
