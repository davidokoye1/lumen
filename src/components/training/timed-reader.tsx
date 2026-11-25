"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Eye, EyeOff, ListChecks, PenLine, Timer } from "lucide-react";
import { submitReadingAction, type ReadingResult } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Kbd, ErrorBanner } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { readingFontClass } from "@/lib/preferences";
import { formatClock, formatReadTime } from "@/lib/format";
import { difficultyLabels } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { FocusFrame, IntroCard } from "./focus-frame";
import { Quiz } from "./quiz";
import { ReadingResults } from "./reading-results";
import type { PlayerContext, ReadingPrefs, ReadingText } from "./types";

type Phase = "intro" | "prequestions" | "preview" | "reading" | "recall" | "quiz" | "results";

export type TimedOptions = {
  exercise?: "timed" | "assessment" | "placement";
  preview?: number;
  preQuestions?: boolean;
  skimFactor?: number;
  recall?: boolean;
  quiz?: boolean;
  title?: string;
  intro?: string;
};

function firstSentence(p: string) {
  const m = p.match(/^.+?[.!?](?=\s|$)/);
  return m ? m[0] : p;
}

/** Stopwatch that pauses while the tab is hidden, so time away never counts as reading. */
function useReadingClock() {
  const acc = useRef(0);
  const start = useRef<number | null>(null);
  const [, force] = useState(0);
  const [away, setAway] = useState(false);
  const running = useRef(false);
  const elapsed = useCallback(() => acc.current + (start.current != null ? performance.now() - start.current : 0), []);
  const begin = useCallback(() => {
    acc.current = 0;
    start.current = performance.now();
    running.current = true;
  }, []);
  const stop = useCallback(() => {
    if (start.current != null) acc.current += performance.now() - start.current;
    start.current = null;
    running.current = false;
    return acc.current;
  }, []);
  useEffect(() => {
    const onVis = () => {
      if (!running.current) return;
      if (document.hidden) {
        if (start.current != null) acc.current += performance.now() - start.current;
        start.current = null;
        setAway(true);
      } else {
        start.current = performance.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    const id = setInterval(() => force((x) => x + 1), 250);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(id);
    };
  }, []);
  return { elapsed, begin, stop, away };
}

export function TimedReader({
  text: textProp,
  prefs,
  ctx,
  options = {},
  againHref = "/train/timed",
}: {
  text: ReadingText;
  prefs: ReadingPrefs;
  ctx: PlayerContext;
  options?: TimedOptions;
  againHref?: string;
}) {
  const { toast } = useToast();
  // Snapshot the text on mount: a server refresh after saving must not swap the passage.
  const [text] = useState(textProp);
  const hasQuiz = (options.quiz ?? true) && text.questions.length > 0;
  const [phase, setPhase] = useState<Phase>("intro");
  const [showTimer, setShowTimer] = useState(prefs.showTimer);
  const [previewLeft, setPreviewLeft] = useState(options.preview ?? 0);
  const [durationMs, setDurationMs] = useState(0);
  const [recallText, setRecallText] = useState("");
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [recalled, setRecalled] = useState<boolean[]>(() => text.keyPoints.map(() => false));
  const [answers, setAnswers] = useState<number[] | null>(null);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clock = useReadingClock();
  const exercise = options.exercise ?? "timed";
  const skim = !!options.skimFactor;
  const limitMs = skim ? (text.words / (ctx.comfortWpm * options.skimFactor!)) * 60_000 : null;
  const estTime = formatReadTime(text.words, ctx.comfortWpm);

  const startReading = useCallback(() => {
    setPhase("reading");
    clock.begin();
    window.scrollTo({ top: 0 });
  }, [clock]);

  const beginFlow = useCallback(() => {
    if (options.preQuestions && hasQuiz) setPhase("prequestions");
    else if (options.preview) setPhase("preview");
    else startReading();
  }, [options.preQuestions, options.preview, hasQuiz, startReading]);

  const submit = useCallback(
    async (finalAnswers: number[] | null, ms: number) => {
      setSubmitting(true);
      setError(null);
      const recallScore = options.recall && text.keyPoints.length ? recalled.filter(Boolean).length / text.keyPoints.length : undefined;
      try {
        const res = await submitReadingAction({
          exercise,
          source: text.source,
          durationMs: Math.max(1000, Math.round(ms)),
          wordsRead: text.words,
          completed: true,
          answers: finalAnswers ?? undefined,
          skim: skim || undefined,
          preview: options.preview ? true : undefined,
          recallScore,
          lessonId: ctx.lessonId,
        });
        if (!res.ok) {
          setError(res.error);
          toast({ tone: "error", title: "Couldn't save this session", description: res.error });
        } else {
          setResult(res.data);
          setPhase("results");
          window.scrollTo({ top: 0 });
        }
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [exercise, text, skim, options.preview, options.recall, recalled, ctx.lessonId, toast],
  );

  const finishReading = useCallback(() => {
    const ms = clock.stop();
    setDurationMs(ms);
    window.scrollTo({ top: 0 });
    if (options.recall) setPhase("recall");
    else if (hasQuiz) setPhase("quiz");
    else void submit(null, ms);
  }, [clock, options.recall, hasQuiz, submit]);

  // Preview countdown
  useEffect(() => {
    if (phase !== "preview") return;
    if (previewLeft <= 0) {
      startReading();
      return;
    }
    const t = setTimeout(() => setPreviewLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, previewLeft, startReading]);

  // Skim limit
  useEffect(() => {
    if (phase !== "reading" || !limitMs) return;
    const id = setInterval(() => {
      if (clock.elapsed() >= limitMs) finishReading();
    }, 200);
    return () => clearInterval(id);
  }, [phase, limitMs, clock, finishReading]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      if (phase === "intro" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        beginFlow();
      } else if (phase === "reading" && e.key === "Enter") {
        e.preventDefault();
        finishReading();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, beginFlow, finishReading]);

  const textStyle = useMemo(
    () => ({ fontSize: prefs.readingSize, lineHeight: prefs.lineHeight }),
    [prefs.readingSize, prefs.lineHeight],
  );
  const fontCls = readingFontClass[prefs.readingFont];
  const elapsed = clock.elapsed();

  const frameTitle = options.title ?? (exercise === "assessment" ? "Check-in" : exercise === "placement" ? "Placement read" : "Timed reading");

  if (phase === "results" && result) {
    return (
      <FocusFrame title={frameTitle} subtitle={text.title} exitHref={ctx.exitHref}>
        <ReadingResults
          result={result}
          questions={text.questions}
          answers={answers}
          mode="timed"
          ctx={exercise === "placement" ? { ...ctx, comfortWpm: 0 } : ctx}
          againHref={againHref}
          skim={skim}
        />
      </FocusFrame>
    );
  }

  if (phase === "intro") {
    return (
      <FocusFrame title={frameTitle} subtitle={text.title} exitHref={ctx.exitHref}>
        <IntroCard
          icon={<Timer />}
          eyebrow={text.category ? `${text.category}${text.difficulty ? ` · ${difficultyLabels[text.difficulty]}` : ""}` : undefined}
          title={text.title}
          description={
            options.intro ??
            (skim
              ? "Skim for the main ideas. The text hides when time runs out."
              : "Read at your natural pace, for understanding. Questions follow, and you can't look back at the text.")
          }
          facts={[
            { label: "Length", value: `${text.words.toLocaleString("en-US")} words` },
            { label: skim ? "Time limit" : "At your pace", value: skim ? formatClock(limitMs!) : `~${estTime}` },
            { label: "Questions", value: hasQuiz ? text.questions.length : "None" },
          ]}
          actions={
            <>
              <Button size="lg" onClick={beginFlow}>
                {options.preQuestions && hasQuiz ? "See the questions" : options.preview ? "Start preview" : "Start reading"}
              </Button>
              <span className="hidden items-center gap-1.5 text-[12px] text-ink-3 sm:flex">
                or press <Kbd>↵</Kbd>
              </span>
            </>
          }
        >
          <ul className="space-y-2 text-[14px] text-ink-2">
            {options.preQuestions && hasQuiz ? (
              <li className="flex gap-2">
                <ListChecks className="mt-0.5 size-4 shrink-0 text-ink-3" /> You&apos;ll see the questions first, so read to find the answers.
              </li>
            ) : null}
            {options.preview ? (
              <li className="flex gap-2">
                <Eye className="mt-0.5 size-4 shrink-0 text-ink-3" /> A {options.preview}-second preview of the structure comes first.
              </li>
            ) : null}
            {options.recall ? (
              <li className="flex gap-2">
                <PenLine className="mt-0.5 size-4 shrink-0 text-ink-3" /> Afterwards you&apos;ll write what you remember before the questions.
              </li>
            ) : null}
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-ink-3" /> The timer pauses if you switch tabs.
            </li>
          </ul>
        </IntroCard>
      </FocusFrame>
    );
  }

  if (phase === "prequestions") {
    return (
      <FocusFrame title={frameTitle} subtitle="Questions first" exitHref={ctx.exitHref}>
        <div className="mx-auto w-full max-w-2xl animate-rise">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Read to answer these</h2>
          <p className="mt-1.5 text-[15px] text-ink-2">Take a moment with each one. You&apos;ll see answer options after reading.</p>
          <ol className="mt-6 space-y-2.5">
            {text.questions.map((q, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-[15px] text-ink">
                <span className="tabular text-ink-3">{i + 1}.</span>
                {q.q}
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Button size="lg" onClick={() => (options.preview ? setPhase("preview") : startReading())}>
              I&apos;m ready, start reading
            </Button>
          </div>
        </div>
      </FocusFrame>
    );
  }

  if (phase === "preview") {
    const total = options.preview ?? 45;
    return (
      <FocusFrame
        title="Preview"
        subtitle={`${previewLeft}s left · survey the structure`}
        exitHref={ctx.exitHref}
        progress={1 - previewLeft / total}
        right={
          <Button size="sm" variant="secondary" onClick={startReading}>
            Start reading
          </Button>
        }
      >
        <article className={cn("mx-auto w-full max-w-[68ch] text-ink", fontCls)} style={textStyle}>
          <h1 className="mb-6 font-sans text-[28px] font-semibold tracking-[-0.02em]">{text.title}</h1>
          {text.paragraphs.map((p, i) => {
            const full = i === 0 || i === text.paragraphs.length - 1;
            return (
              <p key={i} className={cn("mb-5", !full && "text-ink-2")}>
                {full ? p : <>{firstSentence(p)} <span className="text-ink-3">…</span></>}
              </p>
            );
          })}
        </article>
      </FocusFrame>
    );
  }

  if (phase === "reading") {
    const remaining = limitMs ? Math.max(0, limitMs - elapsed) : null;
    return (
      <FocusFrame
        title={text.title}
        subtitle={skim ? "Skimming" : "Reading at your natural pace"}
        exitHref={ctx.exitHref}
        progress={limitMs ? elapsed / limitMs : undefined}
        right={
          <>
            <button
              type="button"
              onClick={() => setShowTimer((s) => !s)}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-ink-3 hover:bg-surface-2 hover:text-ink"
              aria-label={showTimer ? "Hide timer" : "Show timer"}
            >
              {showTimer ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              <span className="tabular min-w-[2.75rem] text-left">{showTimer ? formatClock(remaining ?? elapsed) : "Timer"}</span>
            </button>
          </>
        }
      >
        {clock.away ? (
          <div className="mx-auto mb-6 w-full max-w-[68ch] rounded-xl bg-surface-2 px-4 py-2.5 text-[13px] text-ink-2">
            The timer paused while you were away.
          </div>
        ) : null}
        <article className={cn("prose-reading mx-auto w-full max-w-[68ch] text-ink", fontCls)} style={textStyle}>
          {text.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
        <div className="sticky bottom-0 mx-auto mt-10 flex w-full max-w-[68ch] items-center justify-between gap-3 border-t border-line bg-bg/90 py-4 backdrop-blur">
          <span className="hidden items-center gap-1.5 text-[12px] text-ink-3 sm:flex">
            Press <Kbd>↵</Kbd> when you finish
          </span>
          <Button size="lg" onClick={finishReading} className="w-full sm:w-auto">
            I&apos;ve finished reading
          </Button>
        </div>
      </FocusFrame>
    );
  }

  if (phase === "recall") {
    return (
      <FocusFrame title="Recall" subtitle="Retrieval beats rereading" exitHref={ctx.exitHref}>
        <div className="mx-auto w-full max-w-2xl animate-rise">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">What do you remember?</h2>
          <p className="mt-1.5 text-[15px] text-ink-2">
            Without looking back, write the key ideas in your own words. Even a few phrases count.
          </p>
          <Textarea
            className="mt-5 min-h-40"
            value={recallText}
            onChange={(e) => setRecallText(e.target.value)}
            placeholder="The main idea was…"
            maxLength={2000}
            disabled={recallRevealed}
            aria-label="Your recall"
            autoFocus
          />
          {!recallRevealed ? (
            <div className="mt-5">
              <Button size="lg" onClick={() => setRecallRevealed(true)}>
                Compare with key points
              </Button>
            </div>
          ) : (
            <div className="mt-6 animate-fade-in">
              <p className="mb-3 text-[14px] font-medium text-ink-2">Tick each key point you captured:</p>
              <ul className="space-y-2">
                {text.keyPoints.map((k, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-[14px] text-ink transition-colors hover:bg-surface-2">
                      <input
                        type="checkbox"
                        checked={recalled[i]}
                        onChange={(e) => setRecalled((r) => r.map((v, j) => (j === i ? e.target.checked : v)))}
                        className="mt-1 size-4 accent-[var(--accent-vivid)]"
                      />
                      {k}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button size="lg" onClick={() => (hasQuiz ? setPhase("quiz") : submit(null, durationMs))} loading={submitting}>
                  {hasQuiz ? "Continue to questions" : "Finish"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </FocusFrame>
    );
  }

  // quiz
  return (
    <FocusFrame title="Questions" subtitle={text.title} exitHref={ctx.exitHref}>
      <ErrorBanner className="mx-auto mb-6 w-full max-w-2xl">{error}</ErrorBanner>
      <Quiz
        questions={text.questions}
        submitting={submitting}
        onSubmit={(a) => {
          setAnswers(a);
          void submit(a, durationMs);
        }}
      />
    </FocusFrame>
  );
}
