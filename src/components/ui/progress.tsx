import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  tone = "accent",
  size = "md",
  label,
}: {
  value: number;
  className?: string;
  tone?: "accent" | "ink" | "good";
  size?: "xs" | "sm" | "md";
  label?: string;
}) {
  const v = Math.max(0, Math.min(1, value || 0));
  const tones = { accent: "bg-accent-vivid", ink: "bg-ink", good: "bg-good" };
  const track = { accent: "bg-accent-soft-2", ink: "bg-surface-3", good: "bg-good-soft" };
  const heights = { xs: "h-1", sm: "h-1.5", md: "h-2" };
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      aria-label={label}
      className={cn("w-full overflow-hidden rounded-full", heights[size], track[tone], className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out-expo", tones[tone])}
        style={{ width: `${v * 100}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  className,
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const v = Math.max(0, Math.min(1, value || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent-soft-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent-vivid)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
