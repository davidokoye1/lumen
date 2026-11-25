"use client";

import type { ReactNode } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { Rewards } from "@/lib/services/rewards";
import { Button, LinkButton } from "@/components/ui/button";
import { BigStat, Notice, RewardsPanel } from "./results";
import type { PlayerContext, StepOutcome } from "./types";

export function DrillResults({
  title,
  stats,
  note,
  rewards,
  ctx,
  outcome,
  onAgain,
  extra,
}: {
  title: string;
  stats: { label: string; value: number | null; suffix?: string; hint?: ReactNode; emphasis?: boolean; decimals?: number }[];
  note?: { tone: "good" | "neutral" | "warn"; text: string };
  rewards: Rewards;
  ctx: PlayerContext;
  outcome: StepOutcome;
  onAgain: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <p className="text-[13px] font-medium text-ink-3">Drill complete</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.025em] text-ink">{title}</h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <BigStat key={s.label} {...s} />
        ))}
      </div>
      {note ? (
        <div className="mt-4">
          <Notice tone={note.tone}>{note.text}</Notice>
        </div>
      ) : null}
      {extra ? <div className="mt-4">{extra}</div> : null}
      <div className="mt-6">
        <RewardsPanel rewards={rewards} />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {ctx.onComplete ? (
          <Button size="lg" onClick={() => ctx.onComplete!(outcome)}>
            Continue <ArrowRight className="size-4" />
          </Button>
        ) : (
          <>
            <Button size="lg" onClick={onAgain} icon={<RotateCcw className="size-4" />}>
              Go again
            </Button>
            <LinkButton href={ctx.exitHref} variant="ghost" size="lg">
              Done
            </LinkButton>
          </>
        )}
      </div>
    </div>
  );
}
