"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { navItems, settingsItem } from "./nav";
import { NotificationBell, type ShellNotification } from "./notifications";
import { UserMenu } from "./user-menu";

export type ShellData = {
  name: string;
  email: string;
  level: number;
  levelTitle: string;
  levelProgress: number;
  xpInto: number;
  xpNeeded: number;
  streak: number;
  practicedToday: boolean;
  notifications: ShellNotification[];
  unread: number;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ data }: { data: ShellData }) {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-bg/80 px-3 py-5 backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between px-2">
        <Logo href="/dashboard" />
        <NotificationBell items={data.notifications} unread={data.unread} align="left" />
      </div>

      <nav className="mt-8 flex flex-col gap-0.5" aria-label="Main">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-9 items-center gap-3 rounded-lg px-2.5 text-[14px] font-medium transition-colors",
                active ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon className={cn("size-[18px]", active ? "text-accent-vivid" : "text-ink-3 group-hover:text-ink-2")} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <Link
          href="/achievements"
          className="block rounded-2xl border border-line bg-surface p-3.5 shadow-sm transition-colors hover:border-line-strong"
        >
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-medium text-ink-3">Level {data.level}</div>
            <div
              className={cn(
                "flex items-center gap-1 text-[12px] font-semibold",
                data.streak > 0 ? "text-accent-ink" : "text-ink-3",
              )}
              title={data.practicedToday ? "Practiced today" : "Practice today to keep your streak"}
            >
              <Flame className={cn("size-3.5", data.streak > 0 && !data.practicedToday && "opacity-50")} />
              {data.streak}
            </div>
          </div>
          <div className="mt-0.5 text-[14px] font-semibold text-ink">{data.levelTitle}</div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-accent-vivid" style={{ width: `${Math.round(data.levelProgress * 100)}%` }} />
          </div>
          <div className="tabular mt-1.5 text-[11px] text-ink-3">
            {data.xpInto} / {data.xpNeeded} XP
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <UserMenu name={data.name} email={data.email} />
          <Link
            href={settingsItem.href}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              isActive(pathname, "/settings") ? "bg-surface text-ink ring-1 ring-line" : "text-ink-3 hover:bg-surface-2 hover:text-ink",
            )}
            aria-label="Settings"
          >
            <settingsItem.icon className="size-[18px]" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar({ data }: { data: ShellData }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-xl lg:hidden">
      <Logo href="/dashboard" />
      <div className="flex items-center gap-1">
        <Link
          href="/achievements"
          className={cn(
            "flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-semibold",
            data.streak > 0 ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-ink-3",
          )}
          aria-label={`${data.streak} day streak`}
        >
          <Flame className="size-3.5" />
          {data.streak}
        </Link>
        <NotificationBell items={data.notifications} unread={data.unread} align="right" />
        <UserMenu name={data.name} email={data.email} compact />
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems
          .filter((i) => i.mobile)
          .map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active ? "text-ink" : "text-ink-3",
                  )}
                >
                  <Icon className={cn("size-5", active && "text-accent-vivid")} strokeWidth={active ? 2 : 1.75} />
                  {item.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
