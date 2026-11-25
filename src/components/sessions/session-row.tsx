import { exerciseIcons } from "@/components/ui/icons";
import { sessionKindLabel, type SessionKind } from "@/lib/exercises";
import { formatDuration, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SessionLite = {
  id: string;
  exercise: SessionKind;
  title: string;
  words: number;
  durationMs: number;
  wpm: number | null;
  comprehension: number | null;
  accuracy: number | null;
  score: number | null;
  flagged: boolean;
  meta: Record<string, unknown>;
  createdAt: string;
  xp: number;
};

export function sessionMetrics(s: SessionLite): string[] {
  const out: string[] = [];
  if (s.wpm) out.push(`${s.wpm} WPM`);
  if (s.comprehension != null) out.push(`${Math.round(s.comprehension * 100)}% understood`);
  if (s.accuracy != null) out.push(`${Math.round(s.accuracy * 100)}% accuracy`);
  if (s.exercise === "span" && s.score) out.push(`${s.score}-char span`);
  if (s.exercise === "chunks" && s.score) out.push(`${s.score}-word phrases`);
  if (s.exercise === "grid" && s.score) out.push(`${s.score}s`);
  if (s.exercise === "scan" && s.score) out.push(`${s.score}s / target`);
  if (!out.length) out.push(formatDuration(s.durationMs));
  return out;
}

export function SessionRow({ s, compact }: { s: SessionLite; compact?: boolean }) {
  const Icon = exerciseIcons[s.exercise] ?? exerciseIcons.timed;
  const metrics = sessionMetrics(s);
  return (
    <li className={cn("flex items-center gap-3.5", compact ? "py-2.5" : "py-3")}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-medium text-ink">{s.title}</span>
          {s.flagged ? <span className="shrink-0 rounded-full bg-warn-soft px-1.5 text-[11px] font-medium text-warn-ink">flagged</span> : null}
          {s.meta.skim ? <span className="shrink-0 rounded-full bg-surface-2 px-1.5 text-[11px] font-medium text-ink-3">skim</span> : null}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-ink-3">
          {sessionKindLabel[s.exercise]} · {metrics.join(" · ")}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[12px] text-ink-3">{formatRelative(s.createdAt)}</div>
        {s.xp ? <div className="tabular text-[12px] font-medium text-accent-ink">+{s.xp} XP</div> : null}
      </div>
    </li>
  );
}
