import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("card", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {icon}
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[13px] text-ink-3">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-4", className)}>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-3">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 animate-rise">
        {eyebrow ? <div className="mb-2 text-[13px] font-medium text-ink-3">{eyebrow}</div> : null}
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[32px]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}
