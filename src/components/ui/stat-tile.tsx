import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/sparkline";

export function Delta({
  value,
  format = (v) => `${Math.abs(Math.round(v * 100))}%`,
  upIsGood = true,
  label,
  className,
}: {
  value: number | null;
  format?: (v: number) => string;
  upIsGood?: boolean;
  label?: string;
  className?: string;
}) {
  if (value == null || !Number.isFinite(value)) return null;
  const flat = Math.abs(value) < 0.005;
  const good = flat ? null : value > 0 === upIsGood;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[12px] font-medium whitespace-nowrap",
        good == null ? "text-ink-3" : good ? "text-good-ink" : "text-bad-ink",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {flat ? "No change" : format(value)}
      {label ? <span className="ml-1 font-normal text-ink-3">{label}</span> : null}
    </span>
  );
}

export function StatTile({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  deltaFormat,
  upIsGood,
  spark,
  icon,
  className,
  hint,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: number | null;
  deltaLabel?: string;
  deltaFormat?: (v: number) => string;
  upIsGood?: boolean;
  spark?: (number | null)[];
  icon?: ReactNode;
  className?: string;
  hint?: ReactNode;
}) {
  return (
    <div className={cn("card flex min-w-0 flex-col p-4 sm:p-5", className)}>
      <span className="flex items-center gap-1.5 truncate text-[13px] font-medium text-ink-3">
        {icon}
        {label}
      </span>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-1">
          <span className="text-[26px] leading-none font-semibold tracking-[-0.025em] whitespace-nowrap text-ink">{value}</span>
          {unit ? <span className="text-[13px] font-medium text-ink-3">{unit}</span> : null}
        </div>
        {spark ? <Sparkline values={spark} width={64} height={24} className="shrink-0" /> : null}
      </div>
      <div className="mt-2 min-h-[18px] truncate">
        {delta != null ? (
          <Delta value={delta} label={deltaLabel} format={deltaFormat} upIsGood={upIsGood} />
        ) : hint ? (
          <span className="text-[12px] text-ink-3">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
