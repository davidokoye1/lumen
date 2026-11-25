export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

/** 1,284 · 12.9K · 1.2M — for stat tiles. */
export function formatCompact(n: number): string {
  if (Math.abs(n) < 10_000) return formatNumber(n);
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatPercent(fraction: number | null | undefined, digits = 0): string {
  if (fraction == null || Number.isNaN(fraction)) return "—";
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Duration for humans: "45s", "12 min", "3h 20m". */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.round(totalSec / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Clock style for timers: 1:05, 12:30. */
export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Estimated reading time: "45 sec", "1.4 min", "12 min". */
export function formatReadTime(words: number, wpm: number): string {
  const m = words / Math.max(60, wpm);
  if (m < 0.75) return `${Math.max(15, Math.round((m * 60) / 15) * 15)} sec`;
  if (m < 10) return `${m.toFixed(1).replace(/\.0$/, "")} min`;
  return `${Math.round(m)} min`;
}

export function formatHours(ms: number): string {
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.round(ms / 60_000)}m`;
  return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`;
}

export function formatRelative(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = Math.round((now.getTime() - then) / 1000);
  if (diff < 45) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.round(diff / 3600)}h ago`;
  const days = Math.round(diff / 86_400);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateKey(key: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

export function signed(n: number, digits = 0, suffix = ""): string {
  const v = n.toFixed(digits);
  return `${n > 0 ? "+" : n < 0 ? "−" : "±"}${v.replace("-", "")}${suffix}`;
}
