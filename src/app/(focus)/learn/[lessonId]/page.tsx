import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getLesson, stages } from "@/lib/curriculum/lessons";
import { lessonStates, resolvePick } from "@/lib/curriculum/progress";
import { listLessonProgress } from "@/lib/dal/lessons";
import { listSessions, sourceReadCounts } from "@/lib/dal/practice";
import { computeOverview } from "@/lib/stats/core";
import { todayFor } from "@/lib/services/rewards";
import { passageToText, readingPrefsOf, samplePhrasePools, scanText } from "@/lib/services/training";
import { LessonPlayer, type LessonView, type ResolvedStep } from "@/components/lesson/lesson-player";

type Params = { lessonId: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lessonId } = await params;
  const l = getLesson(lessonId);
  return { title: l ? `${l.number}. ${l.title}` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  const user = await requireOnboardedUser();
  const states = lessonStates(user.level, listLessonProgress(user.id));
  const state = states.find((l) => l.id === lesson.id)!;
  if (state.state === "locked") redirect("/learn?locked=1");

  const overview = computeOverview(listSessions(user.id), user.preferences, todayFor(user), {
    wpm: user.baselineWpm,
    comp: user.baselineComp,
  });
  const comfort = overview.comfortWpm;
  const history = sourceReadCounts(user.id);
  const used = new Set<string>();

  const steps: ResolvedStep[] = lesson.steps.map((s, i) => {
    if (s.type === "read") {
      const p = resolvePick(s.passage, history, `${lesson.id}:${i}`, used);
      used.add(p.slug);
      return {
        type: "read",
        mode: s.mode,
        title: s.title,
        intro: s.intro,
        text: passageToText(p),
        wpm: Math.max(100, Math.round((comfort * (s.speed ?? 1)) / 10) * 10),
        chunk: s.chunk,
        quiz: s.quiz,
        preview: s.preview,
        preQuestions: s.preQuestions,
        skimFactor: s.skimFactor,
        recall: s.recall,
        checkpoint: s.passage.pick === "checkin",
      };
    }
    if (s.type === "drill") {
      if (s.exercise === "scan") {
        const t = scanText(user, s.config.difficulty ?? 2);
        return { ...s, text: t };
      }
      if (s.exercise === "chunks") return { ...s, pools: samplePhrasePools() };
      return s;
    }
    return s;
  });

  const view: LessonView = {
    id: lesson.id,
    number: lesson.number,
    title: lesson.title,
    subtitle: lesson.subtitle,
    focus: lesson.focus,
    minutes: lesson.minutes,
    kind: lesson.kind,
    stageTitle: stages.find((s) => s.id === lesson.stage)!.title,
    completed: state.state === "completed",
    steps,
  };

  return <LessonPlayer lesson={view} prefs={readingPrefsOf(user.preferences)} comfortWpm={comfort} />;
}
