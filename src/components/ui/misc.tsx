import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: "neutral" | "accent" | "good" | "warn" | "bad" | "outline" }) {
  const tones = {
    neutral: "bg-surface-2 text-ink-2",
    accent: "bg-accent-soft text-accent-ink",
    good: "bg-good-soft text-good-ink",
    warn: "bg-warn-soft text-warn-ink",
    bad: "bg-bad-soft text-bad-ink",
    outline: "border border-line-strong text-ink-2",
  };
  return (
    <span
      className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap", tones[tone], className)}
      {...props}
    />
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cn("kbd", className)}>{children}</kbd>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} role="separator" />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-3 [&>svg]:size-5">{icon}</div>
      ) : null}
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-ink-3">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorBanner({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div role="alert" className={cn("rounded-xl border border-bad/20 bg-bad-soft px-4 py-3 text-[14px] text-bad-ink animate-fade-in", className)}>
      {children}
    </div>
  );
}

export function SuccessBanner({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div role="status" className={cn("rounded-xl border border-good/20 bg-good-soft px-4 py-3 text-[14px] text-good-ink animate-fade-in", className)}>
      {children}
    </div>
  );
}
