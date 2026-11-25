/**
 * Calendar helpers. Dates are handled as "YYYY-MM-DD" keys in the user's
 * timezone so streaks and daily goals follow the user's own day.
 */

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function dateKeyInZone(date: Date, timeZone: string): string {
  const tz = isValidTimeZone(timeZone) ? timeZone : "UTC";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function hourInZone(date: Date, timeZone: string): number {
  const tz = isValidTimeZone(timeZone) ? timeZone : "UTC";
  const h = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(date);
  return Number(h);
}

function keyToUtc(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function utcToKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  const d = keyToUtc(key);
  d.setUTCDate(d.getUTCDate() + days);
  return utcToKey(d);
}

export function diffDays(a: string, b: string): number {
  return Math.round((keyToUtc(a).getTime() - keyToUtc(b).getTime()) / 86_400_000);
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndex(key: string): number {
  return (keyToUtc(key).getUTCDay() + 6) % 7;
}

/** Monday of the week containing `key`. */
export function weekStart(key: string): string {
  return addDays(key, -weekdayIndex(key));
}

export function monthStart(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

export function rangeKeys(from: string, to: string): string[] {
  const out: string[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(k);
  return out;
}

export function greetingFor(hour: number): string {
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
