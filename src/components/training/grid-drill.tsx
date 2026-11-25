"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { submitDrillAction, type DrillResult } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { ErrorBanner } from "@/components/ui/misc";
import { cn, shuffle } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import { FocusFrame, IntroCard } from "./focus-frame";
import { DrillResults } from "./drill-results";
import type { PlayerContext } from "./types";

type Round = { size: number; cells: number[]; next: number; start: number; taps: number; errors: number; ms?: number };

export function GridDrill({ ctx, sizes: fixedSizes }: { ctx: PlayerContext; sizes?: number[] }) {
  const [size, setSize] = useState(fixedSizes?.[0] ?? 5);
  const sizes = fixedSizes ?? [size];
  const [phase, setPhase] = useState<"intro" | "run" | "results">("intro");
  const [roundIdx, setRoundIdx] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [done, setDone] = useState<Round[]>([]);
  const [wrongCell, setWrongCell] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrillResult | null>(null);
  const t0 = useRef(0);

  const startRound = useCallback((s: number) => {
    setRound({ size: s, cells: shuffle(Array.from({ length: s * s }, (_, i) => i + 1)), next: 1, start: performance.now(), taps: 0, errors: 0 });
  }, []);

  const begin = () => {
    t0.current = performance.now();
    setDone([]);
    setRoundIdx(0);
    setResult(null);
    setPhase("run");
    startRound(sizes[0]);
  };

  useEffect(() => {
    if (phase !== "run") return;
    const id = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(id);
  }, [phase]);

  const submit = useCallback(
    async (rounds: Round[]) => {
      const taps = rounds.reduce((a, r) => a + r.taps, 0);
      const correct = rounds.reduce((a, r) => a + r.size * r.size, 0);
      const largest = rounds.reduce((a, r) => (r.size > a.size ? r : a));
      const five = rounds.find((r) => r.size === 5);
      const res = await submitDrillAction({
        exercise: "grid",
        durationMs: Math.max(1000, Math.round(performance.now() - t0.current)),
        trials: taps,
        correct,
        score: Math.round((largest.ms! / 1000) * 10) / 10,
        difficulty: largest.size <= 3 ? 1 : largest.size <= 5 ? 2 : 3,
        meta: {
          sizes: rounds.map((r) => r.size),
          times: rounds.map((r) => Math.round(r.ms! / 100) / 10),
          ...(five ? { best5: Math.round(five.ms! / 100) / 10 } : {}),
        },
        lessonId: ctx.lessonId,
      }).catch(() => null);
      if (!res) setError("Network error. Your result wasn't saved.");
      else if (!res.ok) setError(res.error);
      else {
        setResult(res.data);
        setPhase("results");
      }
    },
    [ctx.lessonId],
  );

  const tap = (n: number, idx: number) => {
    if (!round) return;
    const r = { ...round, taps: round.taps + 1 };
    if (n !== round.next) {
      r.errors += 1;
      setWrongCell(idx);
      setTimeout(() => setWrongCell(null), 350);
      setRound(r);
      return;
    }
    r.next += 1;
    if (r.next > r.size * r.size) {
      r.ms = performance.now() - r.start;
      const all = [...done, r];
      setDone(all);
      if (roundIdx + 1 < sizes.length) {
        setRoundIdx(roundIdx + 1);
        setRound(null);
        setTimeout(() => startRound(sizes[roundIdx + 1]), 700);
      } else {
        setRound(null);
        void submit(all);
      }
      return;
    }
    setRound(r);
  };

  if (phase === "results" && result) {
    const taps = done.reduce((a, r) => a + r.taps, 0);
    const errors = done.reduce((a, r) => a + r.errors, 0);
    const last = done[done.length - 1];
    return (
      <FocusFrame title="Focus grid" exitHref={ctx.exitHref}>
        <DrillResults
          title={errors === 0 ? "Clean run" : "Grid complete"}
          stats={[
            { label: `${last.size}×${last.size} time`, value: Math.round(last.ms! / 100) / 10, decimals: 1, suffix: "s", emphasis: true, hint: errors === 0 ? "No wrong taps" : `${errors} wrong taps` },
            { label: "Accuracy", value: Math.round(((taps - errors) / taps) * 100), suffix: "%", hint: `${errors} wrong tap${errors === 1 ? "" : "s"}` },
            { label: "Grids", value: done.length, hint: done.map((r) => `${r.size}×${r.size}: ${(r.ms! / 1000).toFixed(1)}s`).join(" · ") },
          ]}
          note={{
            tone: "neutral",
            text: "Focus grids train attention and visual search. Their benefit to reading is indirect, so use them as a warm-up before real reading.",
          }}
          rewards={result.rewards}
          ctx={ctx}
          outcome={{ exercise: "grid", accuracy: (taps - errors) / taps, score: last.ms! / 1000, rewards: result.rewards }}
          onAgain={begin}
        />
      </FocusFrame>
    );
  }

  if (phase === "intro") {
    return (
      <FocusFrame title="Focus grid" subtitle="Attention warm-up" exitHref={ctx.exitHref}>
        <IntroCard
          icon={<Grid3x3 />}
          eyebrow="Attention drill"
          title="Find the numbers in order"
          description="Keep your gaze on the center of the grid and tap 1, 2, 3… as fast as you can, using your peripheral vision. Wrong taps count against accuracy, so stay calm and steady."
          facts={[
            { label: "Grids", value: sizes.map((s) => `${s}×${s}`).join(", ") },
            { label: "Numbers", value: sizes.reduce((a, s) => a + s * s, 0) },
            { label: "Typical time", value: `${sizes.reduce((a, s) => a + s * s * 1.4, 0).toFixed(0)}s` },
          ]}
          actions={
            <Button size="lg" onClick={begin}>
              Start
            </Button>
          }
        >
          {!fixedSizes ? (
            <div>
              <div className="mb-2 text-[13px] font-medium text-ink-2">Grid size</div>
              <Segmented value={size} onChange={setSize} options={[3, 4, 5, 6, 7].map((s) => ({ value: s, label: `${s}×${s}` }))} />
            </div>
          ) : null}
        </IntroCard>
      </FocusFrame>
    );
  }

  const elapsed = round ? now - round.start : 0;
  return (
    <FocusFrame
      title="Focus grid"
      subtitle={round ? `Find ${round.next}` : "Next grid…"}
      exitHref={ctx.exitHref}
      progress={round ? (round.next - 1) / (round.size * round.size) : 1}
      right={<span className="tabular px-2 text-[14px] font-semibold text-ink">{formatClock(Math.max(0, elapsed))}</span>}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        {round ? (
          <div
            className="relative grid aspect-square w-full max-w-[min(30rem,80vh)] gap-1.5"
            style={{ gridTemplateColumns: `repeat(${round.size}, minmax(0, 1fr))` }}
          >
            {round.cells.map((n, i) => {
              const found = n < round.next;
              const isCenter = round.size % 2 === 1 && i === (round.size * round.size - 1) / 2;
              return (
                <button
                  key={`${round.size}-${n}`}
                  type="button"
                  onClick={() => tap(n, i)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border font-semibold tabular transition-colors duration-150 select-none",
                    round.size >= 6 ? "text-[17px]" : "text-[22px]",
                    found ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface text-ink hover:bg-surface-2",
                    isCenter && "ring-2 ring-accent-vivid/60 ring-inset",
                    wrongCell === i && "animate-shake border-bad bg-bad-soft",
                  )}
                  aria-label={`Number ${n}`}
                >
                  {n}
                </button>
              );
            })}
            {round.size % 2 === 0 ? (
              <span className="pointer-events-none absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full bg-accent-vivid ring-2 ring-bg" />
            ) : null}
          </div>
        ) : (
          <div className="text-[15px] text-ink-3 animate-fade-in">{done.length && phase === "run" ? "Nice. Next grid…" : "Saving…"}</div>
        )}
        <ErrorBanner className="mt-6 w-full max-w-md">{error}</ErrorBanner>
      </div>
    </FocusFrame>
  );
}
