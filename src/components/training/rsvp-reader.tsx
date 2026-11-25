"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Type } from "lucide-react";
import { submitReadingAction, type ReadingResult } from "@/actions/practice";
import { updatePreferencesAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner, Kbd } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { buildFrames, splitAtOrp, tokenize } from "@/lib/reading/text";
import { readingFontClass } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { FocusFrame, IntroCard } from "./focus-frame";
import { Quiz } from "./quiz";
import { ReaderSettings, ShortcutList, TransportBar, type ReaderSettingsValue } from "./reader-controls";
import { ReadingResults } from "./reading-results";
import { usePlayback } from "./use-playback";
import type { PlayerContext, ReadingPrefs, ReadingText } from "./types";

type Phase = "intro" | "run" | "quiz" | "results";

export type RsvpOptions = {
  wpm?: number;
  chunk?: number;
  lockSpeed?: boolean;
  quiz?: boolean;
  title?: string;
  intro?: string;
};

export function RsvpReader({
  text: textProp,
  prefs,
  ctx,
  options = {},
  againHref = "/train/rsvp",
}: {
  text: ReadingText;
  prefs: ReadingPrefs;
  ctx: PlayerContext;
  options?: RsvpOptions;
  againHref?: string;
}) {
  const { toast } = useToast();
  const [text] = useState(textProp);
  const [phase, setPhase] = useState<Phase>("intro");
  const [settings, setSettings] = useState<ReaderSettingsValue>({
    wpm: options.wpm ?? prefs.rsvpWpm,
    chunk: options.chunk ?? prefs.rsvpChunk,
    fontSize: prefs.rsvpFontSize,
    font: prefs.readingFont,
    orp: prefs.orpHighlight,
    pauses: prefs.punctuationPauses,
    easeIn: prefs.easeIn,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [answers, setAnswers] = useState<number[] | null>(null);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState<{ ms: number; words: number; completed: boolean } | null>(null);
  const hasQuiz = (options.quiz ?? true) && text.questions.length > 0;

  const tokens = useMemo(() => tokenize(text.paragraphs), [text.paragraphs]);
  const frames = useMemo(
    () => buildFrames(tokens, settings.wpm, settings.chunk, settings.pauses),
    [tokens, settings.wpm, settings.chunk, settings.pauses],
  );

  const submit = useCallback(
    async (end: { ms: number; words: number; completed: boolean }, a: number[] | null) => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await submitReadingAction({
          exercise: "rsvp",
          source: text.source,
          durationMs: Math.max(1000, Math.round(end.ms)),
          wordsRead: end.words,
          completed: end.completed,
          answers: a ?? undefined,
          wpmSetting: settings.wpm,
          chunk: settings.chunk,
          lessonId: ctx.lessonId,
        });
        if (!res.ok) {
          setError(res.error);
          toast({ tone: "error", title: "Couldn't save this session", description: res.error });
        } else {
          setResult(res.data);
          setPhase("results");
        }
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [text.source, settings.wpm, settings.chunk, ctx.lessonId, toast],
  );

  const finish = useCallback(
    (completed: boolean) => {
      const end = { ms: pb.activeMs.current, words: completed ? text.words : pb.wordsShown(), completed };
      setEnded(end);
      if (hasQuiz && (completed || end.words >= text.words * 0.8)) setPhase("quiz");
      else void submit(end, null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasQuiz, text.words, submit],
  );

  const pb = usePlayback({ frames, tokens, easeIn: settings.easeIn, onEnd: () => finish(true) });

  // Persist reader preferences when used standalone.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (ctx.lessonId) return;
    const t = setTimeout(() => {
      void updatePreferencesAction({
        rsvpWpm: settings.wpm,
        rsvpChunk: settings.chunk,
        rsvpFontSize: settings.fontSize,
        readingFont: settings.font,
        orpHighlight: settings.orp,
        punctuationPauses: settings.pauses,
        easeIn: settings.easeIn,
      });
    }, 800);
    return () => clearTimeout(t);
  }, [settings, ctx.lessonId]);

  const change = (patch: Partial<ReaderSettingsValue>) => setSettings((s) => ({ ...s, ...patch }));
  const speed = (d: number) => !options.lockSpeed && change({ wpm: Math.max(100, Math.min(1000, settings.wpm + d)) });

  useEffect(() => {
    if (phase !== "run") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, dialog")) return;
      if (e.key === " ") {
        e.preventDefault();
        pb.toggle();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        pb.pause();
        if (e.shiftKey) pb.stepSentence(-1);
        else pb.stepFrame(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        pb.pause();
        if (e.shiftKey) pb.stepSentence(1);
        else pb.stepFrame(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        speed(20);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        speed(-20);
      } else if (e.key.toLowerCase() === "r") pb.restart();
      else if (e.key === "Escape") pb.pause();
      else if (e.key === "?") setShowKeys(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const fontCls = readingFontClass[settings.font];
  const title = options.title ?? "RSVP reader";

  if (phase === "results" && result) {
    return (
      <FocusFrame title={title} subtitle={text.title} exitHref={ctx.exitHref}>
        <ReadingResults result={result} questions={text.questions} answers={answers} mode="rsvp" ctx={ctx} againHref={againHref} />
      </FocusFrame>
    );
  }

  if (phase === "quiz" && ended) {
    return (
      <FocusFrame title="Questions" subtitle={text.title} exitHref={ctx.exitHref}>
        <ErrorBanner className="mx-auto mb-6 w-full max-w-2xl">{error}</ErrorBanner>
        <Quiz
          questions={text.questions}
          submitting={submitting}
          onSubmit={(a) => {
            setAnswers(a);
            void submit(ended, a);
          }}
        />
      </FocusFrame>
    );
  }

  if (phase === "intro") {
    return (
      <FocusFrame title={title} subtitle={text.title} exitHref={ctx.exitHref}>
        <IntroCard
          icon={<Type />}
          eyebrow={text.title}
          title={options.lockSpeed ? `RSVP at ${settings.wpm} WPM` : "Words, one glance at a time"}
          description={
            options.intro ??
            "Keep your eyes on the highlighted letter. Words appear in the same place so your eyes don't need to move. Pause any time to see the sentence in context."
          }
          facts={[
            { label: "Length", value: `${text.words.toLocaleString("en-US")} words` },
            { label: "Speed", value: `${settings.wpm} WPM` },
            { label: "Questions", value: hasQuiz ? text.questions.length : "None" },
          ]}
          actions={
            <>
              <Button
                size="lg"
                onClick={() => {
                  setPhase("run");
                  setTimeout(() => pb.play(), 250);
                }}
              >
                Start
              </Button>
              <Button variant="ghost" onClick={() => setShowSettings((s) => !s)}>
                Adjust settings
              </Button>
            </>
          }
        >
          {showSettings ? <ReaderSettings value={settings} onChange={change} mode="rsvp" lockSpeed={options.lockSpeed} /> : null}
        </IntroCard>
      </FocusFrame>
    );
  }

  // Run
  const frame = pb.frame;
  const progress = tokens.length ? Math.min(1, pb.pos / tokens.length) : 0;
  const single = frame && frame.start === frame.end;
  const [left, pivot, right] = frame && single ? splitAtOrp(frame.text) : ["", "", ""];
  const sentenceStart = tokens[Math.min(pb.pos, tokens.length - 1)]?.sentenceStart ?? 0;
  let sentenceEnd = sentenceStart;
  while (sentenceEnd < tokens.length - 1 && !tokens[sentenceEnd].sentenceEnd) sentenceEnd++;

  return (
    <FocusFrame
      title={title}
      subtitle={text.title}
      exitHref={ctx.exitHref}
      right={
        <Button size="sm" variant="ghost" onClick={() => finish(pb.done)} disabled={pb.pos === 0}>
          {pb.done ? "Finish" : "End early"}
        </Button>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="relative flex w-full max-w-3xl cursor-pointer items-center justify-center py-16 select-none"
          onClick={pb.toggle}
          role="button"
          aria-label={pb.playing ? "Pause" : "Play"}
          tabIndex={-1}
        >
          {/* reticle */}
          <div className="pointer-events-none absolute inset-x-0 top-6 h-px bg-line" />
          <div className="pointer-events-none absolute inset-x-0 bottom-6 h-px bg-line" />
          {single && settings.orp ? (
            <>
              <div className="pointer-events-none absolute top-6 left-1/2 h-3 w-px -translate-x-1/2 bg-ink-3" />
              <div className="pointer-events-none absolute bottom-6 left-1/2 h-3 w-px -translate-x-1/2 bg-ink-3" />
            </>
          ) : null}
          <div
            className={cn("w-full text-ink", fontCls)}
            style={{ fontSize: settings.fontSize, lineHeight: 1.15 }}
            aria-live="off"
          >
            {!frame ? (
              <div className="text-center text-ink-3" style={{ fontSize: Math.max(18, settings.fontSize * 0.45) }}>
                End of text
              </div>
            ) : single ? (
              <div className="grid grid-cols-[1fr_auto_1fr] items-baseline whitespace-pre">
                <span className="text-right">{left}</span>
                <span className={settings.orp ? "text-accent-vivid" : undefined}>{pivot}</span>
                <span className="text-left">{right}</span>
              </div>
            ) : (
              <div className="text-center">{frame.text}</div>
            )}
          </div>
          {!pb.playing && pb.pos === 0 ? (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[13px] text-ink-3">
              Press <Kbd>Space</Kbd> to play
            </div>
          ) : null}
        </div>

        <div className="h-24 w-full max-w-2xl">
          {!pb.playing && frame ? (
            <p className={cn("text-center text-[17px] leading-relaxed text-ink-3 animate-fade-in", fontCls)}>
              {tokens.slice(sentenceStart, sentenceEnd + 1).map((t) => (
                <span
                  key={t.index}
                  className={cn(
                    "cursor-pointer rounded px-0.5 hover:text-ink",
                    t.index >= frame.start && t.index <= frame.end && "bg-accent-soft-2 text-ink",
                  )}
                  onClick={() => pb.seekToken(t.index)}
                >
                  {t.text}{" "}
                </span>
              ))}
            </p>
          ) : null}
        </div>

        <div className="mt-6 w-full max-w-xl">
          <TransportBar
            playing={pb.playing}
            onToggle={pb.toggle}
            onRestart={pb.restart}
            onBack={() => pb.stepSentence(-1)}
            onForward={() => pb.stepSentence(1)}
            wpm={settings.wpm}
            onSpeed={speed}
            lockSpeed={options.lockSpeed}
            remainingMs={pb.remainingMs}
            progress={progress}
            onSettings={() => setShowSettings((s) => !s)}
            settingsOpen={showSettings}
            onShortcuts={() => setShowKeys(true)}
          />
          {showSettings ? (
            <div className="mt-4">
              <ReaderSettings value={settings} onChange={change} mode="rsvp" lockSpeed={options.lockSpeed} />
            </div>
          ) : null}
          <ErrorBanner className="mt-4">{error}</ErrorBanner>
        </div>
      </div>
      <Dialog open={showKeys} onClose={() => setShowKeys(false)} title="Keyboard shortcuts">
        <ShortcutList lockSpeed={options.lockSpeed} />
      </Dialog>
    </FocusFrame>
  );
}
