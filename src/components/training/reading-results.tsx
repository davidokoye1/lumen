"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, RotateCcw } from "lucide-react";
import type { ReadingResult } from "@/actions/practice";
import { Button, LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signed } from "@/lib/format";
import { QuizReview } from "./quiz";
import { BigStat, Notice, RewardsPanel } from "./results";
import type { PlayerContext, QuizQuestion, StepOutcome } from "./types";

function verdict(r: ReadingResult, mode: "timed" | "rsvp" | "pacer", skim: boolean) {
  if (r.flagged)
    return {
      tone: "warn" as const,
      text: "That pace is faster than full reading allows (over 1,100 WPM). The session is saved, but it's left out of your speed stats. Skimming is fine when you choose it on purpose.",
    };
  if (r.comprehension == null)
    return { tone: "neutral" as const, text: "Comprehension isn't measured for this text, so your speed is shown on its own." };
  if (skim)
    return {
      tone: "neutral" as const,
      text:
        r.comprehension >= 0.6
          ? "Good skim: you caught the main ideas. Skims are logged separately and don't affect your reading-speed stats."
          : "Skimming always trades detail for speed. Focus on titles, first sentences and signal words next time.",
    };
  if (r.comprehension >= 0.8)
    return {
      tone: "good" as const,
      text:
        mode === "timed"
          ? "Strong understanding at your natural pace."
          : "Strong understanding at this speed, so you're ready to try about 10% faster next time.",
    };
  if (r.comprehension >= 0.6)
    return {
      tone: "neutral" as const,
      text: "Solid. Hold this pace until comprehension is consistently above 80%, then step up.",
    };
  return {
    tone: "warn" as const,
    text: "Understanding dropped at this pace. Slow down about 10% next time, because speed only counts when understanding comes with it.",
  };
}

export function ReadingResults({
  result,
  questions,
  answers,
  mode,
  ctx,
  againHref,
  onRetry,
  skim = false,
}: {
  result: ReadingResult;
  questions: QuizQuestion[];
  answers: number[] | null;
  mode: "timed" | "rsvp" | "pacer";
  ctx: PlayerContext;
  againHref: string;
  onRetry?: () => void;
  skim?: boolean;
}) {
  const [showReview, setShowReview] = useState(false);
  const v = verdict(result, mode, skim);
  const vsComfort = ctx.comfortWpm ? (result.wpm - ctx.comfortWpm) / ctx.comfortWpm : null;
  const outcome: StepOutcome = {
    exercise: mode,
    wpm: result.wpm,
    comprehension: result.comprehension,
    rewards: result.rewards,
  };
  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <p className="text-[13px] font-medium text-ink-3">Session complete</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.025em] text-ink">
        {result.comprehension == null
          ? `${result.wpm} words per minute`
          : result.comprehension >= 0.8
            ? "Nicely done"
            : result.comprehension >= 0.6
              ? "Good work"
              : "Worth a slower pass"}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <BigStat
          label={mode === "timed" ? "Reading speed" : "Speed"}
          value={result.wpm}
          suffix="WPM"
          hint={
            vsComfort != null && mode === "timed" && !skim && Math.abs(vsComfort) >= 0.01
              ? `${signed(vsComfort * 100, 0, "%")} vs your average`
              : `${result.words.toLocaleString("en-US")} words`
          }
        />
        <BigStat
          label="Comprehension"
          value={result.comprehension != null ? Math.round(result.comprehension * 100) : null}
          suffix="%"
          hint={
            result.results ? `${result.results.filter(Boolean).length} of ${result.results.length} correct` : "No questions"
          }
        />
        <BigStat
          label="Effective rate"
          value={result.effective}
          suffix="WPM"
          emphasis
          hint="Speed × comprehension"
        />
      </div>

      <div className="mt-4">
        <Notice tone={v.tone}>{v.text}</Notice>
      </div>

      {result.correct && answers ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowReview((s) => !s)}
            className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-[14px] font-medium text-ink-2 hover:text-ink"
            aria-expanded={showReview}
          >
            Review answers
            <ChevronDown className={cn("size-4 transition-transform", showReview && "rotate-180")} />
          </button>
          {showReview ? (
            <div className="mt-2 animate-fade-in">
              <QuizReview questions={questions} answers={answers} correct={result.correct} />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6">
        <RewardsPanel rewards={result.rewards} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {ctx.onComplete ? (
          <Button size="lg" onClick={() => ctx.onComplete!(outcome)}>
            Continue <ArrowRight className="size-4" />
          </Button>
        ) : (
          <>
            {againHref !== ctx.exitHref ? (
              <LinkButton href={againHref} size="lg">
                Read another <ArrowRight className="size-4" />
              </LinkButton>
            ) : null}
            {onRetry ? (
              <Button variant="secondary" size="lg" onClick={onRetry} icon={<RotateCcw className="size-4" />}>
                Same text again
              </Button>
            ) : null}
            <LinkButton href={ctx.exitHref} variant={againHref === ctx.exitHref ? "primary" : "ghost"} size="lg">
              Done
            </LinkButton>
          </>
        )}
      </div>
    </div>
  );
}
