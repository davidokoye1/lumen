"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { submitDrillAction, type DrillResult } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { ErrorBanner, Kbd } from "@/components/ui/misc";
import { wordsOfLength } from "@/lib/content/words";
import { cn, shuffle } from "@/lib/utils";
import { FocusFrame, IntroCard } from "./focus-frame";
import { DrillResults } from "./drill-results";
import type { PlayerContext } from "./types";

type Difficulty = 1 | 2 | 3;
const PRESETS: Record<Difficulty, { exposure: number; minExposure: number; ecc: number; maxEcc: number; len: [number, number] }> = {
  1: { exposure: 320, minExposure: 160, ecc: 3, maxEcc: 10, len: [3, 5] },
  2: { exposure: 220, minExposure: 120, ecc: 5, maxEcc: 13, len: [4, 6] },
  3: { exposure: 160, minExposure: 80, ecc: 7, maxEcc: 16, len: [5, 8] },
};

type Trial = { left: string; right: string; leftOpts: string[]; rightOpts: string[]; ecc: number; exposure: number };
type Stage = "fixate" | "flash" | "mask" | "answer" | "feedback";

function makeTrial(pool: string[], ecc: number, exposure: number): Trial {
  const pick = shuffle(pool).slice(0, 6);
  const [left, right] = pick;
  return {
    left,
    right,
    leftOpts: shuffle([left, pick[2], pick[3]]),
    rightOpts: shuffle([right, pick[4], pick[5]]),
    ecc,
    exposure,
  };
}

export function SpanDrill({ ctx, difficulty: initialDiff = 1, trials: totalTrials = 12 }: { ctx: PlayerContext; difficulty?: Difficulty; trials?: number }) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDiff);
  const preset = PRESETS[difficulty];
  const pool = useMemo(() => wordsOfLength(preset.len[0], preset.len[1]), [preset.len]);
  const [phase, setPhase] = useState<"intro" | "run" | "results">("intro");
  const [stage, setStage] = useState<Stage>("fixate");
  const [trialNo, setTrialNo] = useState(0);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [pickL, setPickL] = useState<string | null>(null);
  const [pickR, setPickR] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrillResult | null>(null);
  const stats = useRef({ correct: 0, ecc: preset.ecc, exposure: preset.exposure, streak: 0, best: 0, start: 0, history: [] as number[] });

  const startTrial = useCallback(() => {
    const s = stats.current;
    setTrial(makeTrial(pool, s.ecc, s.exposure));
    setPickL(null);
    setPickR(null);
    setStage("fixate");
  }, [pool]);

  const begin = () => {
    stats.current = { correct: 0, ecc: preset.ecc, exposure: preset.exposure, streak: 0, best: 0, start: performance.now(), history: [] };
    setTrialNo(0);
    setResult(null);
    setPhase("run");
    startTrial();
  };

  // Stage timing: fixate → flash → mask → answer
  useEffect(() => {
    if (phase !== "run" || !trial) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (stage === "fixate") t = setTimeout(() => setStage("flash"), 750);
    else if (stage === "flash") t = setTimeout(() => setStage("mask"), trial.exposure);
    else if (stage === "mask") t = setTimeout(() => setStage("answer"), 180);
    return () => clearTimeout(t);
  }, [stage, trial, phase]);

  const finishDrill = useCallback(async () => {
    const s = stats.current;
    const durationMs = Math.round(performance.now() - s.start);
    const res = await submitDrillAction({
      exercise: "span",
      durationMs: Math.max(1000, durationMs),
      trials: totalTrials,
      correct: s.correct,
      score: s.best,
      difficulty,
      words: totalTrials * 2,
      meta: { exposure: Math.round(s.exposure), history: s.history.slice(0, 40) },
      lessonId: ctx.lessonId,
    }).catch(() => null);
    if (!res) setError("Network error. Your result wasn't saved.");
    else if (!res.ok) setError(res.error);
    else {
      setResult(res.data);
      setPhase("results");
    }
  }, [totalTrials, difficulty, ctx.lessonId]);

  // Score once both picks are in.
  useEffect(() => {
    if (stage !== "answer" || !trial || pickL == null || pickR == null) return;
    const ok = pickL === trial.left && pickR === trial.right;
    const s = stats.current;
    s.history.push(trial.ecc);
    if (ok) {
      s.correct++;
      s.best = Math.max(s.best, trial.ecc);
      s.streak++;
      if (s.ecc < preset.maxEcc) s.ecc += 1;
      else if (s.streak >= 2) s.exposure = Math.max(preset.minExposure, s.exposure * 0.85);
    } else {
      s.streak = 0;
      s.ecc = Math.max(2, s.ecc - 1);
    }
    setStage("feedback");
  }, [pickL, pickR, stage, trial, preset]);

  // Show feedback briefly, then move on.
  useEffect(() => {
    if (stage !== "feedback") return;
    const t = setTimeout(() => {
      const next = trialNo + 1;
      if (next >= totalTrials) void finishDrill();
      else {
        setTrialNo(next);
        startTrial();
      }
    }, 650);
    return () => clearTimeout(t);
  }, [stage, trialNo, totalTrials, startTrial, finishDrill]);

  // Keyboard: A S D for left, J K L for right
  useEffect(() => {
    if (phase !== "run" || stage !== "answer" || !trial) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const li = ["a", "s", "d"].indexOf(k);
      const ri = ["j", "k", "l"].indexOf(k);
      if (li >= 0) setPickL(trial.leftOpts[li]);
      if (ri >= 0) setPickR(trial.rightOpts[ri]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, stage, trial]);

  if (phase === "results" && result) {
    const s = stats.current;
    const acc = s.correct / totalTrials;
    return (
      <FocusFrame title="Word flash" exitHref={ctx.exitHref}>
        <DrillResults
          title={acc >= 0.75 ? "Sharp recognition" : acc >= 0.5 ? "Good work" : "Keep at it"}
          stats={[
            { label: "Accuracy", value: Math.round(acc * 100), suffix: "%", hint: `${s.correct} of ${totalTrials} pairs` },
            { label: "Widest span", value: s.best, suffix: "chars", hint: "From center, both words correct", emphasis: true },
            { label: "Fastest flash", value: Math.round(s.exposure), suffix: "ms", hint: "Exposure at the end" },
          ]}
          note={{
            tone: acc >= 0.75 ? "good" : "neutral",
            text:
              acc >= 0.75
                ? "The drill got harder as you succeeded. Next time, try a higher difficulty."
                : "Accuracy matters more than width here. The drill adapts to keep you at the edge of your ability.",
          }}
          rewards={result.rewards}
          ctx={ctx}
          outcome={{ exercise: "span", accuracy: acc, score: s.best, rewards: result.rewards }}
          onAgain={begin}
        />
      </FocusFrame>
    );
  }

  if (phase === "intro") {
    return (
      <FocusFrame title="Word flash" subtitle="Peripheral recognition" exitHref={ctx.exitHref}>
        <IntroCard
          icon={<Eye />}
          eyebrow="Recognition drill"
          title="Two words, one glance"
          description="Keep your eyes on the center dot. Two words flash on either side, too briefly for your eyes to move, then they're masked. Pick both words. The words move farther apart as you succeed."
          facts={[
            { label: "Trials", value: totalTrials },
            { label: "Flash", value: `${preset.exposure} ms` },
            { label: "Start width", value: `${preset.ecc} chars` },
          ]}
          actions={
            <Button size="lg" onClick={begin}>
              Start drill
            </Button>
          }
        >
          {!ctx.lessonId ? (
            <div>
              <div className="mb-2 text-[13px] font-medium text-ink-2">Difficulty</div>
              <Segmented
                value={difficulty}
                onChange={(d) => setDifficulty(d as Difficulty)}
                options={[
                  { value: 1, label: "Beginner" },
                  { value: 2, label: "Intermediate" },
                  { value: 3, label: "Advanced" },
                ]}
              />
            </div>
          ) : null}
        </IntroCard>
      </FocusFrame>
    );
  }

  const fb = stage === "feedback" && trial ? { l: pickL === trial.left, r: pickR === trial.right } : null;

  return (
    <FocusFrame title="Word flash" subtitle={`Trial ${trialNo + 1} of ${totalTrials}`} exitHref={ctx.exitHref} progress={trialNo / totalTrials}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden font-mono text-[26px] sm:text-[30px]">
          {stage === "fixate" || stage === "answer" || stage === "feedback" ? (
            <span className="size-2.5 rounded-full bg-accent-vivid" aria-label="Fixation point" />
          ) : null}
          {stage === "flash" && trial ? (
            <>
              <span className="size-2.5 rounded-full bg-accent-vivid" />
              <span className="absolute text-ink" style={{ right: `calc(50% + ${trial.ecc}ch)` }}>
                {trial.left}
              </span>
              <span className="absolute text-ink" style={{ left: `calc(50% + ${trial.ecc}ch)` }}>
                {trial.right}
              </span>
            </>
          ) : null}
          {stage === "mask" && trial ? (
            <>
              <span className="absolute text-ink-3" style={{ right: `calc(50% + ${trial.ecc}ch)` }}>
                {"#".repeat(trial.left.length)}
              </span>
              <span className="size-2.5 rounded-full bg-accent-vivid" />
              <span className="absolute text-ink-3" style={{ left: `calc(50% + ${trial.ecc}ch)` }}>
                {"#".repeat(trial.right.length)}
              </span>
            </>
          ) : null}
        </div>

        <div className={cn("mt-4 grid w-full max-w-xl grid-cols-2 gap-6 transition-opacity", stage === "answer" || stage === "feedback" ? "opacity-100" : "pointer-events-none opacity-0")}>
          {(["l", "r"] as const).map((side) => {
            const opts = side === "l" ? trial?.leftOpts : trial?.rightOpts;
            const pick = side === "l" ? pickL : pickR;
            const setPick = side === "l" ? setPickL : setPickR;
            const keys = side === "l" ? ["A", "S", "D"] : ["J", "K", "L"];
            const truth = side === "l" ? trial?.left : trial?.right;
            return (
              <div key={side}>
                <div className="mb-2 text-center text-[12px] font-medium text-ink-3">{side === "l" ? "Left word" : "Right word"}</div>
                <div className="space-y-2">
                  {opts?.map((o, i) => {
                    const chosen = pick === o;
                    const showTruth = fb && o === truth;
                    const wrong = fb && chosen && o !== truth;
                    return (
                      <button
                        key={o}
                        type="button"
                        disabled={stage !== "answer"}
                        onClick={() => setPick(o)}
                        className={cn(
                          "flex h-12 w-full items-center justify-between rounded-xl border px-4 font-mono text-[16px] transition-colors",
                          showTruth
                            ? "border-good bg-good-soft text-good-ink"
                            : wrong
                              ? "border-bad bg-bad-soft text-bad-ink"
                              : chosen
                                ? "border-accent-vivid bg-accent-soft text-ink"
                                : "border-line-strong bg-surface text-ink-2 hover:text-ink",
                        )}
                      >
                        {o}
                        <Kbd className="hidden sm:inline-flex">{keys[i]}</Kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <ErrorBanner className="mt-6 w-full max-w-xl">{error}</ErrorBanner>
      </div>
    </FocusFrame>
  );
}
