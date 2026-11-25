import "server-only";
import type { User } from "@/lib/dal/users";
import { totalXp } from "@/lib/dal/gamification";
import { listNotifications, unreadCount } from "@/lib/dal/notifications";
import { listSessions } from "@/lib/dal/practice";
import { computeOverview } from "@/lib/stats/core";
import { levelFromXp } from "@/lib/gamification/levels";
import { generateTimelyNotifications } from "./timely";
import { todayFor } from "./rewards";
import type { ShellData } from "@/components/shell/sidebar";

export function loadShellData(user: User): ShellData {
  try {
    generateTimelyNotifications(user);
  } catch (e) {
    console.error("timely notifications failed", e);
  }
  const level = levelFromXp(totalXp(user.id));
  const overview = computeOverview(listSessions(user.id), user.preferences, todayFor(user));
  return {
    name: user.name,
    email: user.email,
    level: level.level,
    levelTitle: level.title,
    levelProgress: level.progress,
    xpInto: level.intoLevel,
    xpNeeded: level.needed,
    streak: overview.streak.current,
    practicedToday: overview.streak.practicedToday,
    notifications: listNotifications(user.id, 25).map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      href: n.href,
      createdAt: n.createdAt,
      read: !!n.readAt,
    })),
    unread: unreadCount(user.id),
  };
}
