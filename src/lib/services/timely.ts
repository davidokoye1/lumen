import "server-only";
import type { User } from "@/lib/dal/users";
import { createNotification } from "@/lib/dal/notifications";
import { listSessions } from "@/lib/dal/practice";
import { computeOverview, effectiveRate, isNaturalRead } from "@/lib/stats/core";
import { addDays, dateKeyInZone, hourInZone, weekStart } from "@/lib/time";
import { formatNumber } from "@/lib/format";
import { median } from "@/lib/utils";

/**
 * Time-based in-app notifications (streak at risk, weekly report). Generated
 * lazily when the user opens the app; dedupe keys make this idempotent.
 */
export function generateTimelyNotifications(user: User) {
  const prefs = user.preferences;
  if (!prefs.notifyStreak && !prefs.notifyWeeklyReport) return;
  const now = new Date();
  const today = dateKeyInZone(now, prefs.timezone);
  const sessions = listSessions(user.id);
  if (!sessions.length) return;

  if (prefs.notifyStreak && hourInZone(now, prefs.timezone) >= 17) {
    const o = computeOverview(sessions, prefs, today);
    if (o.streak.atRisk && o.streak.current >= 2) {
      createNotification(user.id, {
        kind: "streak",
        title: `Keep your ${o.streak.current}-day streak alive`,
        body: "A five-minute session today is enough. Pick up where you left off.",
        href: "/learn",
        dedupeKey: `streak:${today}`,
      });
    }
  }

  if (prefs.notifyWeeklyReport) {
    const thisWeek = weekStart(today);
    const lastWeek = addDays(thisWeek, -7);
    const inLast = sessions.filter((s) => s.localDate >= lastWeek && s.localDate < thisWeek);
    if (inLast.length) {
      const minutes = Math.round(inLast.reduce((a, s) => a + s.durationMs, 0) / 60_000);
      const words = inLast.reduce((a, s) => a + s.words, 0);
      const err = median(inLast.filter(isNaturalRead).map((s) => effectiveRate(s)!));
      const days = new Set(inLast.map((s) => s.localDate)).size;
      createNotification(user.id, {
        kind: "report",
        title: "Your weekly report is ready",
        body: `${days} active day${days === 1 ? "" : "s"}, ${minutes} min, ${formatNumber(words)} words${
          err ? `, effective rate ${Math.round(err)}` : ""
        }.`,
        href: "/analytics?tab=reports&period=week&offset=-1",
        dedupeKey: `report:${lastWeek}`,
      });
    }
  }
}
