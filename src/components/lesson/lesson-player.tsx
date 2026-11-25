"use client";

import { useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, Clock, Lightbulb, MessageCircle, RotateCcw, Trophy } from "lucide-react";
import { completeLessonAction, type LessonCompletion } from "@/actions/lessons";
import { Button, LinkButton } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/controls";
import { ErrorBanner } from "@/components/ui/misc";
import { exerciseIcons } from "@/components/ui/icons";
import { FocusFrame, LessonStepContext } from "@/components/training/focus-frame";
import { TimedReader } from "@/components/training/timed-reader";
import { RsvpReader } from "@/components/training/rsvp-reader";
import { PacerReader } from "@/components/training/pacer-reader";
import { SpanDrill } from "@/components/training/span-drill";
import { GridDrill } from "@/components/training/grid-drill";
import { ChunkDrill, type PhrasePools } from "@/components/training/chunk-drill";
import { ScanDrill } from "@/components/training/scan-drill";
import { RewardsPanel } from "@/components/training/results";
import type { PlayerContext, ReadingPrefs, ReadingText, StepOutcome } from "@/components/training/types";
import type { ConceptStep, DrillStep, ReflectStep } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";
import { ConceptCard } from "./concept-card";

export type ResolvedStep =
  | ConceptStep
  | ReflectStep
  | (DrillStep & { text?: ReadingText; pools?: PhrasePools })
  | {
      type: "read";
      mode: "timed" | "rsvp" | "pacer";
      title: string;
      intro: string;
      text: ReadingText;
      wpm: number;
      chunk?: number;
      quiz: boolean;
      preview?: number;
      preQuestions?: boolean;
      skimFactor?: number;
      recall?: boolean;
      checkpoint: boolean;
    };

export type LessonView = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  focus: string;
  minutes: number;
  kind: "lesson" | "checkpoint";
  stageTitle: string;
  completed: boolean;
  steps: ResolvedStep[];
};

function stepMeta(s: ResolvedStep): { icon: React.ReactNode; label: string; detail: string } {
  if (s.type === "concept") return { icon: <Lightbulb className="size-4" />, label: s.title, detail: "Concept · 1–2 min" };
  if (s.type === "reflect") return { icon: <MessageCircle className="size-4" />, label: "Reflect", detail: s.prompt };
  if (s.type === "drill") {
    const Icon = exerciseIcons[s.exercise];
    return { icon: <Icon className="size-4" />, label: s.title, detail: "Drill · 2–3 min" };
  }
  const Icon = exerciseIcons[s.mode];
  return {
    icon: <Icon className="size-4" />,
    label: s.title,
    detail: `${s.mode === "timed" ? "Timed read" : s.mode === "rsvp" ? `RSVP · ${s.wpm} WPM` : `Pacer · ${s.wpm} WPM`} · ${s.text.words} words`,
  };
}

export function LessonPlayer({
  lesson: lessonProp,
  prefs,
  comfortWpm,
}: {
  lesson: LessonView;
  prefs: ReadingPrefs;
  comfortWpm: number;
}) {
  // Passages are picked from read history; freeze them so a refresh mid-lesson can't swap texts.
  const [lesson] = useState(lessonProp);
  const [index, setIndex] = useState(-1);
  const [outcomes, setOutcomes] = useState<StepOutcome[]>([]);
  const [reflections, setReflections] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [completion, setCompletion] = useState<LessonCompletion | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = lesson.steps.length;
  const finishing = useRef(false);

  async function finish(allOutcomes: StepOutcome[], allReflections: string[]) {
    if (finishing.current) return;
    finishing.current = true;
    setSaving(true);
    setError(null);
    const scores = allOutcomes.map((o) => o.comprehension ?? o.accuracy).filter((x): x is number => x != null);
    const score = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    try {
      const res = await completeLessonAction({ lessonId: lesson.id, reflections: allReflections, score });
      if (!res.ok) setError(res.error);
      else setCompletion(res.data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
      finishing.current = false;
    }
    setIndex(total);
    window.scrollTo({ top: 0 });
  }

  function next(outcome?: StepOutcome, reflection?: string) {
    const o = outcome ? [...outcomes, outcome] : outcomes;
    const r = reflection ? [...reflections, reflection] : reflections;
    setOutcomes(o);
    setReflections(r);
    setChoice(null);
    window.scrollTo({ top: 0 });
    if (index + 1 >= total) void finish(o, r);
    else setIndex(index + 1);
  }

  const ctx: PlayerContext = { lessonId: lesson.id, exitHref: "/learn", comfortWpm, onComplete: (o) => next(o) };

  // Overview
  if (index === -1) {
    return (
      <FocusFrame title={`Session ${lesson.number}`} subtitle={lesson.stageTitle} exitHref="/learn">
        <div className="mx-auto w-full max-w-xl animate-rise py-2 sm:py-8">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-3">
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-accent-ink">{lesson.focus}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> ~{lesson.minutes} min
            </span>
          </div>
          <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.025em] text-ink">{lesson.title}</h1>
          <p className="mt-2 text-[16px] text-ink-2">{lesson.subtitle}</p>
          <ol className="mt-8 space-y-2">
            {lesson.steps.map((s, i) => {
              const m = stepMeta(s);
              return (
                <li key={i} className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">{m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-ink">{m.label}</div>
                    <div className="truncate text-[12px] text-ink-3">{m.detail}</div>
                  </div>
                  <span className="tabular text-[12px] text-ink-3">{i + 1}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 flex items-center gap-3">
            <Button size="lg" onClick={() => setIndex(0)} autoFocus>
              {lesson.completed ? "Retake session" : "Begin"} <ArrowRight className="size-4" />
            </Button>
            {lesson.completed ? (
              <span className="flex items-center gap-1.5 text-[13px] text-good-ink">
                <Check className="size-4" /> Completed
              </span>
            ) : null}
          </div>
        </div>
      </FocusFrame>
    );
  }

  // Complete
  if (index >= total) {
    const reads = outcomes.filter((o) => o.wpm != null);
    const comp = outcomes.filter((o) => o.comprehension != null);
    const drills = outcomes.filter((o) => o.accuracy != null);
    return (
      <FocusFrame title={`Session ${lesson.number} complete`} subtitle={lesson.title} exitHref="/learn">
        <div className="mx-auto w-full max-w-2xl animate-rise">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-fg animate-pop">
            <Trophy className="size-7" />
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">
            {completion?.stageCompleted ? `${completion.stageCompleted} complete` : lesson.kind === "checkpoint" ? "Checkpoint passed" : "Session complete"}
          </h1>
          <p className="mt-2 text-[15px] text-ink-2">
            {completion?.promotedTo
              ? `You've moved up to ${completion.promotedTo}. New sessions are unlocked.`
              : completion?.firstTime === false
                ? "Retakes are a great way to consolidate. Your best score is kept."
                : "Nicely done. Consistency is what makes the change stick."}
          </p>
          <ErrorBanner className="mt-4">{error}</ErrorBanner>
          <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            <div className="bg-surface px-4 py-3">
              <dt className="text-[12px] text-ink-3">Reading speed</dt>
              <dd className="tabular mt-0.5 text-[18px] font-semibold text-ink">
                {reads.length ? `${Math.round(reads.reduce((a, o) => a + o.wpm!, 0) / reads.length)} WPM` : "—"}
              </dd>
            </div>
            <div className="bg-surface px-4 py-3">
              <dt className="text-[12px] text-ink-3">Comprehension</dt>
              <dd className="tabular mt-0.5 text-[18px] font-semibold text-ink">
                {comp.length ? `${Math.round((comp.reduce((a, o) => a + o.comprehension!, 0) / comp.length) * 100)}%` : "—"}
              </dd>
            </div>
            <div className="bg-surface px-4 py-3">
              <dt className="text-[12px] text-ink-3">Drill accuracy</dt>
              <dd className="tabular mt-0.5 text-[18px] font-semibold text-ink">
                {drills.length ? `${Math.round((drills.reduce((a, o) => a + o.accuracy!, 0) / drills.length) * 100)}%` : "—"}
              </dd>
            </div>
          </dl>
          {completion ? (
            <div className="mt-6">
              <RewardsPanel rewards={completion.rewards} />
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {error ? (
              <Button size="lg" loading={saving} onClick={() => finish(outcomes, reflections)} icon={<RotateCcw className="size-4" />}>
                Try saving again
              </Button>
            ) : completion?.nextLessonId ? (
              <LinkButton href={`/learn/${completion.nextLessonId}`} size="lg">
                Next session <ArrowRight className="size-4" />
              </LinkButton>
            ) : null}
            <LinkButton href="/learn" variant={completion?.nextLessonId ? "secondary" : "primary"} size="lg" icon={<BookOpen className="size-4" />}>
              Program
            </LinkButton>
            <LinkButton href="/dashboard" variant="ghost" size="lg">
              Home
            </LinkButton>
          </div>
        </div>
      </FocusFrame>
    );
  }

  const step = lesson.steps[index];
  const wrap = (node: React.ReactNode) => (
    <LessonStepContext.Provider value={{ index, total, title: lesson.title }}>{node}</LessonStepContext.Provider>
  );

  if (step.type === "concept")
    return wrap(
      <FocusFrame title={lesson.title} subtitle={`Session ${lesson.number}`} exitHref="/learn">
        <ConceptCard step={step} onContinue={() => next()} />
      </FocusFrame>,
    );

  if (step.type === "reflect")
    return wrap(
      <FocusFrame title={lesson.title} subtitle="Reflection" exitHref="/learn">
        <div className="mx-auto w-full max-w-xl animate-rise">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-accent-ink">
            <MessageCircle className="size-4" /> Reflect
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">{step.prompt}</h1>
          <p className="mt-2 text-[14px] text-ink-3">Noticing how reading feels is part of the skill. There are no wrong answers.</p>
          <div role="radiogroup" className="mt-6 grid gap-2.5">
            {step.options.map((o) => (
              <ChoiceCard key={o} selected={choice === o} onClick={() => setChoice(o)} title={o} />
            ))}
          </div>
          <div className="mt-8">
            <Button size="lg" disabled={!choice} loading={saving} onClick={() => next(undefined, choice!)}>
              {index + 1 >= total ? "Finish session" : "Continue"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </FocusFrame>,
    );

  if (step.type === "drill") {
    const k = `step-${index}`;
    if (step.exercise === "span") return wrap(<SpanDrill key={k} ctx={ctx} difficulty={step.config.difficulty ?? 1} trials={step.config.trials ?? 12} />);
    if (step.exercise === "grid") return wrap(<GridDrill key={k} ctx={ctx} sizes={step.config.sizes ?? [4]} />);
    if (step.exercise === "chunks")
      return wrap(
        <ChunkDrill
          key={k}
          ctx={ctx}
          pools={step.pools!}
          prefs={prefs}
          startSize={step.config.startSize ?? 2}
          maxSize={step.config.maxSize ?? 3}
          trials={step.config.trials ?? 14}
        />,
      );
    return wrap(<ScanDrill key={k} ctx={ctx} text={step.text!} prefs={prefs} targets={step.config.targets ?? 6} />);
  }

  // read step
  const k = `step-${index}`;
  if (step.mode === "timed")
    return wrap(
      <TimedReader
        key={k}
        text={step.text}
        prefs={prefs}
        ctx={ctx}
        options={{
          exercise: step.checkpoint ? "assessment" : "timed",
          title: step.title,
          intro: step.intro,
          preview: step.preview,
          preQuestions: step.preQuestions,
          skimFactor: step.skimFactor,
          recall: step.recall,
          quiz: step.quiz,
        }}
      />,
    );
  if (step.mode === "rsvp")
    return wrap(
      <RsvpReader
        key={k}
        text={step.text}
        prefs={prefs}
        ctx={ctx}
        options={{ wpm: step.wpm, chunk: step.chunk, lockSpeed: true, quiz: step.quiz, title: step.title, intro: step.intro }}
      />,
    );
  return wrap(
    <PacerReader
      key={k}
      text={step.text}
      prefs={prefs}
      ctx={ctx}
      options={{ wpm: step.wpm, chunk: step.chunk, lockSpeed: true, quiz: step.quiz, title: step.title, intro: step.intro }}
    />,
  );
}

export function StepDots({ total, index }: { total: number; index: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1 w-6 rounded-full", i <= index ? "bg-accent-vivid" : "bg-surface-3")} />
      ))}
    </div>
  );
}
