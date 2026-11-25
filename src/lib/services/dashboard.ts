import "server-only";
import type { User } from "@/lib/dal/users";
import { listSessions } from "@/lib/dal/practice";
import { listLessonProgress } from "@/lib/dal/lessons";
import { totalXp } from "@/lib/dal/gamification";
import { lessonStates, nextLesson, programProgress, stageProgress } from "@/lib/curriculum/progress";
import { stages } from "@/lib/curriculum/lessons";
import { levelFromXp } from "@/lib/gamification/levels";
import { recommend } from "@/lib/recommendations";
import { dailyNotes } from "@/lib/content/notes";
import { greetingFor, hourInZone, weekStart } from "@/lib/time";
import { hashString } from "@/lib/utils";
import { loadProgressContext } from "./rewards";

export function checkInAvailable(sessions: { exercise: string; localDate: string }[], today: string) {
  const wk = weekStart(today);
  return sessions.length > 0 && !sessions.some((s) => (s.exercise === "assessment" || s.exercise === "placement") && s.localDate >= wk);
}

export function loadDashboard(user: User) {
  const { sessions, overview, challenges, today } = loadProgressContext(user);
  const states = lessonStates(user.level, listLessonProgress(user.id));
  const next = nextLesson(states, user.level);
  const stageList = stageProgress(states);
  const currentStage = stageList.find((s) => s.id === (next?.stage ?? user.level)) ?? stageList[0];
  const level = levelFromXp(totalXp(user.id));
  const checkIn = checkInAvailable(sessions, today);
  const recs = recommend({ overview, sessions, level: user.level, checkInAvailable: checkIn, today });
  const note = dailyNotes[hashString(today) % dailyNotes.length];
  const hour = hourInZone(new Date(), user.preferences.timezone);
  return {
    greeting: greetingFor(hour),
    today,
    overview,
    level,
    next,
    currentStage,
    program: programProgress(states),
    stages: stageList.map((s) => ({ id: s.id, title: s.title, done: s.done, total: s.total })),
    challenges,
    recommendations: recs,
    recent: [...sessions].reverse().slice(0, 6),
    checkInAvailable: checkIn,
    note,
    stageMeta: stages.find((s) => s.id === currentStage.id)!,
  };
}

export type DashboardData = ReturnType<typeof loadDashboard>;
