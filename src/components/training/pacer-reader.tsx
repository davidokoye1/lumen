"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlignLeft } from "lucide-react";
import { submitReadingAction, type ReadingResult } from "@/actions/practice";
import { updatePreferencesAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { buildPhraseFrames, tokenize, type Token } from "@/lib/reading/text";
import { readingFontClass } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { FocusFrame, IntroCard } from "./focus-frame";
import { Quiz } from "./quiz";
import { ReaderSettings, ShortcutList, TransportBar, type ReaderSettingsValue } from "./reader-controls";
import { ReadingResults } from "./reading-results";
import { usePlayback } from "./use-playback";
import type { PlayerContext, ReadingPrefs, ReadingText } from "./types";

type Phase = "intro" | "run" | "quiz" | "results";

export type PacerOptions = { wpm?: number; chunk?: number; lockSpeed?: boolean; quiz?: boolean; title?: string; intro?: string };

/** 0 future · 1 read · 2 phrase start · 3 phrase middle · 4 phrase end · 5 single-word phrase */
type WordState = 0 | 1 | 2 | 3 | 4 | 5;

const Word = memo(function Word({ t, state, onSeek }: { t: Token; state: WordState; onSeek: (i: number) => void }) {
  const lit = state >= 2;
  // The trailing space belongs to the highlight except after the phrase's last word,
  // so the phrase reads as one continuous pill.
  const spaceInside = state === 2 || state === 3;
  return (
    <>
      <span
        data-i={t.index}
        onClick={() => onSeek(t.index)}
        className={cn(
          "cursor-pointer py-[0.08em] transition-[background-color,color] duration-150 box-decoration-clone",
          state === 1 && "text-ink-3",
          lit && "bg-accent-soft-2 text-ink",
          state === 2 && "rounded-l-[5px] pl-[0.12em] -ml-[0.12em]",
          state === 4 && "rounded-r-[5px] pr-[0.12em] -mr-[0.12em]",
          state === 5 && "rounded-[5px] px-[0.12em] -mx-[0.12em]",
        )}
      >
        {t.text}
        {spaceInside ? " " : null}
      </span>
      {spaceInside ? null : " "}
    </>
  );
});

export function PacerReader({
  text: textProp,
  prefs,
  ctx,
  options = {},
  againHref = "/train/pacer",
}: {
  text: ReadingText;
  prefs: ReadingPrefs;
  ctx: PlayerContext;
  options?: PacerOptions;
  againHref?: string;
}) {
  const { toast } = useToast();
  const [text] = useState(textProp);
  const [phase, setPhase] = useState<Phase>("intro");
  const [settings, setSettings] = useState<ReaderSettingsValue>({
    wpm: options.wpm ?? prefs.pacerWpm,
    chunk: options.chunk ?? prefs.pacerChunk,
    fontSize: prefs.readingSize,
    lineHeight: prefs.lineHeight,
    font: prefs.readingFont,
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
  const byParagraph = useMemo(() => {
    const out: Token[][] = [];
    for (const t of tokens) (out[t.paragraph] ??= []).push(t);
    return out;
  }, [tokens]);
  const frames = useMemo(
    () => buildPhraseFrames(tokens, settings.wpm, settings.chunk, settings.pauses),
    [tokens, settings.wpm, settings.chunk, settings.pauses],
  );

  const submit = useCallback(
    async (end: { ms: number; words: number; completed: boolean }, a: number[] | null) => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await submitReadingAction({
          exercise: "pacer",
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
          window.scrollTo({ top: 0 });
        }
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [text.source, settings.wpm, settings.chunk, ctx.lessonId, toast],
  );

  const finish = (completed: boolean) => {
    const end = { ms: pb.activeMs.current, words: completed ? text.words : pb.wordsShown(), completed };
    setEnded(end);
    window.scrollTo({ top: 0 });
    if (hasQuiz && (completed || end.words >= text.words * 0.8)) setPhase("quiz");
    else void submit(end, null);
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  const pb = usePlayback({ frames, tokens, easeIn: settings.easeIn, onEnd: () => finishRef.current(true) });

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (ctx.lessonId) return;
    const t = setTimeout(() => {
      void updatePreferencesAction({
        pacerWpm: settings.wpm,
        pacerChunk: settings.chunk,
        readingSize: settings.fontSize,
        lineHeight: settings.lineHeight,
        readingFont: settings.font,
        punctuationPauses: settings.pauses,
        easeIn: settings.easeIn,
      });
    }, 800);
    return () => clearTimeout(t);
  }, [settings, ctx.lessonId]);

  // Keep the active phrase in the upper third of the viewport.
  const articleRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (phase !== "run" || !pb.frame) return;
    const el = articleRef.current?.querySelector<HTMLElement>(`[data-i="${pb.frame.start}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.top > vh * 0.55 || r.top < 90) {
      window.scrollTo({ top: window.scrollY + r.top - vh * 0.33, behavior: "smooth" });
    }
  }, [pb.frame, phase]);

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

  const seek = useCallback(
    (i: number) => {
      pb.pause();
      pb.seekToken(i);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pb.pause, pb.seekToken],
  );

  const fontCls = readingFontClass[settings.font];
  const title = options.title ?? "Guided pacer";

  if (phase === "results" && result) {
    return (
      <FocusFrame title={title} subtitle={text.title} exitHref={ctx.exitHref}>
        <ReadingResults result={result} questions={text.questions} answers={answers} mode="pacer" ctx={ctx} againHref={againHref} />
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
          icon={<AlignLeft />}
          eyebrow={text.title}
          title={options.lockSpeed ? `Paced read at ${settings.wpm} WPM` : "Follow the highlight"}
          description={
            options.intro ??
            "A soft highlight moves through the text phrase by phrase. Keep your eyes on it and let it carry you forward. If you miss something, keep going, because meaning often resolves in the next sentence."
          }
          facts={[
            { label: "Length", value: `${text.words.toLocaleString("en-US")} words` },
            { label: "Pace", value: `${settings.wpm} WPM` },
            { label: "Questions", value: hasQuiz ? text.questions.length : "None" },
          ]}
          actions={
            <>
              <Button
                size="lg"
                onClick={() => {
                  setPhase("run");
                  setTimeout(() => pb.play(), 400);
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
          {showSettings ? <ReaderSettings value={settings} onChange={change} mode="pacer" lockSpeed={options.lockSpeed} /> : null}
        </IntroCard>
      </FocusFrame>
    );
  }

  const frame = pb.frame;
  const progress = tokens.length ? Math.min(1, pb.pos / tokens.length) : 0;

  return (
    <FocusFrame
      title={text.title}
      subtitle={`${title} · ${settings.wpm} WPM`}
      exitHref={ctx.exitHref}
      progress={progress}
      right={
        <Button size="sm" variant="ghost" onClick={() => finish(pb.done)} disabled={pb.pos === 0}>
          {pb.done ? "Finish" : "End early"}
        </Button>
      }
    >
      <article
        ref={articleRef}
        className={cn("prose-reading mx-auto w-full max-w-[68ch] pb-56 text-ink", fontCls)}
        style={{ fontSize: settings.fontSize, lineHeight: settings.lineHeight }}
      >
        {byParagraph.map((para, pi) => (
          <p key={pi}>
            {para.map((t) => (
              <Word
                key={t.index}
                t={t}
                onSeek={seek}
                state={
                  !frame
                    ? 1
                    : t.index < frame.start
                      ? 1
                      : t.index > frame.end
                        ? 0
                        : frame.start === frame.end
                          ? 5
                          : t.index === frame.start
                            ? 2
                            : t.index === frame.end
                              ? 4
                              : 3
                }
              />
            ))}
          </p>
        ))}
      </article>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {showSettings ? (
            <div className="mb-3 max-h-[50vh] overflow-y-auto">
              <ReaderSettings value={settings} onChange={change} mode="pacer" lockSpeed={options.lockSpeed} />
            </div>
          ) : null}
          <ErrorBanner className="mb-3">{error}</ErrorBanner>
          <TransportBar
            playing={pb.playing}
            onToggle={pb.toggle}
            onRestart={() => {
              pb.restart();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
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
        </div>
      </div>
      <Dialog open={showKeys} onClose={() => setShowKeys(false)} title="Keyboard shortcuts">
        <ShortcutList lockSpeed={options.lockSpeed} />
      </Dialog>
    </FocusFrame>
  );
}
