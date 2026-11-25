"use client";

import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** When a player runs inside a lesson, the frame shows lesson step progress. */
export const LessonStepContext = createContext<{ index: number; total: number; title: string } | null>(null);

/** Minimal chrome around a reading or drill: exit, title, optional right slot and progress line. */
export function FocusFrame({
  title,
  subtitle,
  exitHref,
  onExit,
  right,
  progress,
  children,
  className,
  wide,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  exitHref?: string;
  onExit?: () => void;
  right?: ReactNode;
  progress?: number;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  const lesson = useContext(LessonStepContext);
  const exitCls =
    "flex size-9 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink";
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className={cn("mx-auto flex h-14 items-center gap-3 px-4 sm:px-6", wide ? "max-w-6xl" : "max-w-4xl")}>
          {onExit ? (
            <button type="button" onClick={onExit} className={exitCls} aria-label="Exit">
              <X className="size-[18px]" />
            </button>
          ) : (
            <Link href={exitHref ?? "/dashboard"} className={exitCls} aria-label="Exit">
              <X className="size-[18px]" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold text-ink">{title}</div>
            {subtitle ? <div className="truncate text-[12px] text-ink-3">{subtitle}</div> : null}
          </div>
          {right ? <div className="flex shrink-0 items-center gap-1">{right}</div> : null}
          {lesson ? (
            <span className="tabular hidden shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink-2 sm:inline">
              Step {lesson.index + 1} of {lesson.total}
            </span>
          ) : null}
        </div>
        {lesson ? (
          <div className="mx-auto flex max-w-4xl gap-1 px-4 pb-2 sm:px-6" aria-hidden>
            {Array.from({ length: lesson.total }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < lesson.index ? "bg-accent-vivid" : i === lesson.index ? "bg-accent-vivid/45" : "bg-surface-3",
                )}
              />
            ))}
          </div>
        ) : null}
        {progress != null ? (
          <div className="h-[2px] w-full bg-transparent">
            <div
              className="h-full bg-accent-vivid transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
            />
          </div>
        ) : null}
      </header>
      <div className={cn("mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12", wide ? "max-w-6xl" : "max-w-4xl", className)}>
        {children}
      </div>
    </div>
  );
}

export function IntroCard({
  icon,
  eyebrow,
  title,
  description,
  facts,
  children,
  actions,
}: {
  icon?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  facts?: { label: string; value: ReactNode }[];
  children?: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-xl animate-rise py-4 sm:py-10">
      {icon ? (
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink [&>svg]:size-[22px]">
          {icon}
        </div>
      ) : null}
      {eyebrow ? <p className="mb-1.5 text-[13px] font-medium text-ink-3">{eyebrow}</p> : null}
      <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">{title}</h1>
      {description ? <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{description}</p> : null}
      {facts?.length ? (
        <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {facts.map((f) => (
            <div key={f.label} className="bg-surface px-4 py-3">
              <dt className="text-[12px] text-ink-3">{f.label}</dt>
              <dd className="mt-0.5 text-[15px] font-semibold text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
      <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
    </div>
  );
}
