"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Layers } from "lucide-react";
import { submitDrillAction, type DrillResult } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { ErrorBanner, Kbd } from "@/components/ui/misc";
import { cn, shuffle } from "@/lib/utils";
import { FocusFrame, IntroCard } from "./focus-frame";
import { DrillResults } from "./drill-results";
import type { PlayerContext, ReadingPrefs } from "./types";
import { readingFontClass } from "@/lib/preferences";

export type PhrasePools = Record<number, string[]>;

type Trial = { phrase: string; options: string[]; size: number; exposure: number };
type Stage = "fixate" | "flash" | "mask" | "answer" | "feedback";

function distractors(phrase: string, pool: string[], vocab: string[]): string[] {
  const words = phrase.split(" ");
  const out = new Set<string>();
  let guard = 0;
  while (out.size < 3 && guard++ < 60) {
    const w = [...words];
    const mode = guard % 3;
    if (mode === 0 && w.length > 1) {
      // swap two adjacent words
      const i = Math.floor(Math.random() * (w.length - 1));
      [w[i], w[i + 1]] = [w[i + 1], w[i]];
    } else {
      // replace one content word with a word of similar length
      const idxs = w.map((x, i) => ({ x, i })).filter((o) => o.x.replace(/\W/g, "").length >= 3);
      const target = idxs.length ? idxs[Math.floor(Math.random() * idxs.length)] : { x: w[0], i: 0 };
      const len = target.x.replace(/\W/g, "").length;
      const cands = vocab.filter((v) => Math.abs(v.length - len) <= 1 && v.toLowerCase() !== target.x.toLowerCase());
      if (!cands.length) continue;
      w[target.i] = cands[Math.floor(Math.random() * cands.length)];
    }
    const c = w.join(" ");
    if (c !== phrase) out.add(c);
  }
  // Fallback: other phrases from the pool.
  for (const p of shuffle(pool)) {
    if (out.size >= 3) break;
    if (p !== phrase) out.add(p);
  }
  return [...out].slice(0, 3);
}

export function ChunkDrill({
  ctx,
  pools: poolsProp,
  prefs,
  startSize: initialStart = 2,
  maxSize = 5,
  trials: totalTrials = 16,
  lockSize,
}: {
  ctx: PlayerContext;
  pools: PhrasePools;
  prefs: ReadingPrefs;
  startSize?: number;
  maxSize?: number;
  trials?: number;
  lockSize?: boolean;
}) {
  const [pools] = useState(poolsProp);
  const [startSize, setStartSize] = useState(initialStart);
  const [phase, setPhase] = useState<"intro" | "run" | "results">("intro");
  const [stage, setStage] = useState<Stage>("fixate");
  const [trialNo, setTrialNo] = useState(0);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrillResult | null>(null);
  const s = useRef({ size: initialStart, streak: 0, misses: 0, correct: 0, best: 0, start: 0, words: 0, speedup: 1 });
  const vocab = useRef<string[]>([]);

  useEffect(() => {
    const all = new Set<string>();
    Object.values(pools).forEach((list) => list.forEach((p) => p.split(" ").forEach((w) => w.length >= 3 && all.add(w))));
    vocab.current = [...all];
  }, [pools]);

  const newTrial = useCallback(() => {
    const size = s.current.size;
    const pool = pools[size] ?? pools[Math.min(...Object.keys(pools).map(Number))];
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    const options = shuffle([phrase, ...distractors(phrase, pool, vocab.current)]);
    const exposure = Math.round((140 + 105 * size) * s.current.speedup);
    setTrial({ phrase, options, size, exposure });
    setPicked(null);
    setStage("fixate");
  }, [pools]);

  const begin = () => {
    s.current = { size: startSize, streak: 0, misses: 0, correct: 0, best: 0, start: performance.now(), words: 0, speedup: 1 };
    setTrialNo(0);
    setResult(null);
    setPhase("run");
    newTrial();
  };

  useEffect(() => {
    if (phase !== "run" || !trial) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (stage === "fixate") t = setTimeout(() => setStage("flash"), 650);
    else if (stage === "flash") t = setTimeout(() => setStage("mask"), trial.exposure);
    else if (stage === "mask") t = setTimeout(() => setStage("answer"), 160);
    return () => clearTimeout(t);
  }, [stage, trial, phase]);

  const finish = useCallback(async () => {
    const st = s.current;
    const res = await submitDrillAction({
      exercise: "chunks",
      durationMs: Math.max(1000, Math.round(performance.now() - st.start)),
      trials: totalTrials,
      correct: st.correct,
      score: st.best,
      difficulty: Math.min(3, Math.max(1, startSize - 1)) as 1 | 2 | 3,
      words: st.words,
      meta: { startSize, endSize: st.size },
      lessonId: ctx.lessonId,
    }).catch(() => null);
    if (!res) setError("Network error. Your result wasn't saved.");
    else if (!res.ok) setError(res.error);
    else {
      setResult(res.data);
      setPhase("results");
    }
  }, [totalTrials, startSize, ctx.lessonId]);

  const choose = useCallback(
    (i: number) => {
      if (stage !== "answer" || !trial) return;
      setPicked(i);
      const ok = trial.options[i] === trial.phrase;
      const st = s.current;
      st.words += trial.size;
      if (ok) {
        st.correct++;
        st.best = Math.max(st.best, trial.size);
        st.streak++;
        st.misses = 0;
        if (st.streak >= 3) {
          st.streak = 0;
          if (!lockSize && st.size < maxSize && pools[st.size + 1]?.length) st.size++;
          else st.speedup = Math.max(0.6, st.speedup * 0.88);
        }
      } else {
        st.streak = 0;
        st.misses++;
        if (st.misses >= 2) {
          st.misses = 0;
          if (!lockSize && st.size > Math.max(2, startSize - 1)) st.size--;
          else st.speedup = Math.min(1.3, st.speedup * 1.12);
        }
      }
      setStage("feedback");
      setTimeout(() => {
        const next = trialNo + 1;
        if (next >= totalTrials) void finish();
        else {
          setTrialNo(next);
          newTrial();
        }
      }, 750);
    },
    [stage, trial, trialNo, totalTrials, maxSize, startSize, pools, lockSize, newTrial, finish],
  );

  useEffect(() => {
    if (phase !== "run") return;
    const onKey = (e: KeyboardEvent) => {
      const i = ["1", "2", "3", "4"].indexOf(e.key);
      if (i >= 0) choose(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose]);

  const fontCls = readingFontClass[prefs.readingFont];

  if (phase === "results" && result) {
    const st = s.current;
    const acc = st.correct / totalTrials;
    return (
      <FocusFrame title="Phrase flash" exitHref={ctx.exitHref}>
        <DrillResults
          title={acc >= 0.8 ? "Reading in phrases" : "Good practice"}
          stats={[
            { label: "Accuracy", value: Math.round(acc * 100), suffix: "%", hint: `${st.correct} of ${totalTrials} phrases` },
            { label: "Largest phrase", value: st.best, suffix: "words", emphasis: true, hint: `Started at ${startSize}` },
            { label: "Words seen", value: st.words, hint: "In single glances" },
          ]}
          note={{
            tone: acc >= 0.7 ? "good" : "neutral",
            text:
              acc >= 0.7
                ? "Phrase size grows after three correct in a row. Next, carry this into reading with the pacer at a matching chunk size."
                : "The drill steps down after misses. Accuracy first, then size.",
          }}
          rewards={result.rewards}
          ctx={ctx}
          outcome={{ exercise: "chunks", accuracy: acc, score: st.best, rewards: result.rewards }}
          onAgain={begin}
        />
      </FocusFrame>
    );
  }

  if (phase === "intro") {
    return (
      <FocusFrame title="Phrase flash" subtitle="Chunking" exitHref={ctx.exitHref}>
        <IntroCard
          icon={<Layers />}
          eyebrow="Recognition drill"
          title="Take in a phrase at a glance"
          description="A short phrase from a real text flashes in the center, then it's masked. Pick the exact phrase you saw. Phrases grow after three correct answers and shrink after misses."
          facts={[
            { label: "Trials", value: totalTrials },
            { label: "Start size", value: `${startSize} words` },
            { label: "Max size", value: `${maxSize} words` },
          ]}
          actions={
            <Button size="lg" onClick={begin}>
              Start drill
            </Button>
          }
        >
          {!ctx.lessonId ? (
            <div>
              <div className="mb-2 text-[13px] font-medium text-ink-2">Starting phrase size</div>
              <Segmented value={startSize} onChange={setStartSize} options={[2, 3, 4, 5].map((n) => ({ value: n, label: `${n} words` }))} />
            </div>
          ) : null}
        </IntroCard>
      </FocusFrame>
    );
  }

  return (
    <FocusFrame
      title="Phrase flash"
      subtitle={`Trial ${trialNo + 1} of ${totalTrials} · ${trial?.size ?? startSize}-word phrases`}
      exitHref={ctx.exitHref}
      progress={trialNo / totalTrials}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className={cn("flex h-40 w-full items-center justify-center text-center text-[30px] sm:text-[36px]", fontCls)}>
          {stage === "fixate" ? <span className="size-2.5 rounded-full bg-accent-vivid" /> : null}
          {stage === "flash" && trial ? <span className="text-ink">{trial.phrase}</span> : null}
          {stage === "mask" && trial ? <span className="text-ink-3">{trial.phrase.replace(/\S/g, "#")}</span> : null}
          {stage === "answer" || stage === "feedback" ? <span className="text-[15px] text-ink-3 font-sans">Which phrase did you see?</span> : null}
        </div>
        <div
          className={cn(
            "grid w-full max-w-xl gap-2 transition-opacity",
            stage === "answer" || stage === "feedback" ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {trial?.options.map((o, i) => {
            const isTruth = o === trial.phrase;
            const fb = stage === "feedback";
            return (
              <button
                key={o + i}
                type="button"
                onClick={() => choose(i)}
                disabled={stage !== "answer"}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[17px] transition-colors",
                  fontCls,
                  fb && isTruth
                    ? "border-good bg-good-soft text-good-ink"
                    : fb && picked === i
                      ? "border-bad bg-bad-soft text-bad-ink"
                      : "border-line-strong bg-surface text-ink hover:bg-surface-2",
                )}
              >
                <Kbd className="hidden sm:inline-flex">{i + 1}</Kbd>
                {o}
              </button>
            );
          })}
        </div>
        <ErrorBanner className="mt-6 w-full max-w-xl">{error}</ErrorBanner>
      </div>
    </FocusFrame>
  );
}
