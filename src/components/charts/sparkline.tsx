/** Tiny trend line: de-emphasis gray with the latest point in the accent. */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  className,
}: {
  values: (number | null)[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v != null);
  if (pts.length < 2) return <svg width={width} height={height} className={className} aria-hidden />;
  const min = Math.min(...pts.map((p) => p.v));
  const max = Math.max(...pts.map((p) => p.v));
  const n = values.length - 1 || 1;
  const x = (i: number) => 3 + (i / n) * (width - 6);
  const y = (v: number) => height - 3 - ((v - min) / (max - min || 1)) * (height - 6);
  const d = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <path d={d} fill="none" stroke="var(--series-muted)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r={2.75} fill="var(--accent-vivid)" />
    </svg>
  );
}
