"use client";

import Link from "next/link";
import { Check, LogOut, Monitor, Moon, Settings, Sun, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { Popover } from "./popover";
import { useTheme, type ThemePref } from "./theme";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-bg",
        className,
      )}
      aria-hidden
    >
      {initials(name) || "?"}
    </span>
  );
}

const themes: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function UserMenu({ name, email, compact }: { name: string; email: string; compact?: boolean }) {
  const { pref, setPref } = useTheme();
  return (
    <Popover
      label="Account"
      align={compact ? "right" : "left"}
      side={compact ? "bottom" : "top"}
      className="w-64"
      wrapperClassName={compact ? undefined : "min-w-0 flex-1"}
      trigger={({ toggle }) =>
        compact ? (
          <button type="button" onClick={toggle} aria-label="Account menu" className="ml-1 rounded-full">
            <Avatar name={name} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggle}
            className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-xl px-2 text-left transition-colors hover:bg-surface-2"
            aria-label="Account menu"
          >
            <Avatar name={name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ink">{name}</span>
              <span className="block truncate text-[12px] text-ink-3">{email}</span>
            </span>
          </button>
        )
      }
    >
      {(close) => (
        <div className="p-1.5">
          <div className="px-2.5 pt-2 pb-2.5">
            <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
            <p className="truncate text-[12px] text-ink-3">{email}</p>
          </div>
          <div className="mx-1 mb-1.5 grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
            {themes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setPref(t.value)}
                aria-pressed={pref === t.value}
                className={cn(
                  "flex h-8 items-center justify-center gap-1.5 rounded-lg text-[12px] font-medium transition-colors",
                  pref === t.value ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink",
                )}
              >
                <t.icon className="size-3.5" />
                {t.label}
              </button>
            ))}
          </div>
          <MenuLink href="/achievements" icon={Trophy} onClick={close}>
            Achievements
          </MenuLink>
          <MenuLink href="/settings" icon={Settings} onClick={close}>
            Settings
          </MenuLink>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </Popover>
  );
}

function MenuLink({ href, icon: Icon, children, onClick }: { href: string; icon: typeof Check; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
}
