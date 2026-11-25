"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, BellOff, CalendarDays, Flame, GraduationCap, Medal, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { clearNotificationsAction, markNotificationsReadAction } from "@/actions/settings";
import { Popover } from "./popover";

export type ShellNotification = {
  id: string;
  kind: "achievement" | "level" | "challenge" | "streak" | "report" | "program";
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  read: boolean;
};

const icons = { achievement: Trophy, level: Sparkles, challenge: Medal, streak: Flame, report: CalendarDays, program: GraduationCap };

export function NotificationBell({ items, unread, align }: { items: ShellNotification[]; unread: number; align: "left" | "right" }) {
  const [pending, start] = useTransition();
  return (
    <Popover
      label="Notifications"
      align={align}
      className="w-[min(22rem,calc(100vw-2rem))]"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={() => {
            toggle();
            if (!open && unread > 0) start(() => void markNotificationsReadAction());
          }}
          className="relative flex size-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-accent-vivid ring-2 ring-bg" />
          ) : null}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-[14px] font-semibold">Notifications</h2>
            {items.length ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => void clearNotificationsAction())}
                className="text-[12px] font-medium text-ink-3 hover:text-ink"
              >
                Clear all
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <BellOff className="mb-3 size-5 text-ink-3" />
              <p className="text-[14px] font-medium text-ink">You&apos;re all caught up</p>
              <p className="mt-1 text-[13px] text-ink-3">Badges, level-ups and weekly reports will show up here.</p>
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {items.map((n) => {
                const Icon = icons[n.kind];
                const inner = (
                  <div className="flex gap-3 px-4 py-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
                        n.read ? "bg-surface-2 text-ink-3" : "bg-accent-soft text-accent-ink",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{n.body}</p>
                      <p className="mt-1 text-[11px] text-ink-3">{formatRelative(n.createdAt)}</p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link href={n.href} onClick={close} className="block transition-colors hover:bg-surface-2">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Popover>
  );
}
