import type { Difficulty } from "@/lib/content/types";
import type { Level } from "@/lib/dal/users";

export type ExerciseId = "rsvp" | "pacer" | "timed" | "span" | "grid" | "chunks" | "scan";

export type PassagePick =
  | { pick: "auto"; difficulty: Difficulty }
  | { pick: "checkin" }
  | { pick: "slug"; slug: string };

export type ConceptStep = {
  type: "concept";
  title: string;
  body: string[];
  takeaways: string[];
  evidence?: string;
};

export type ReadStep = {
  type: "read";
  mode: "timed" | "rsvp" | "pacer";
  title: string;
  intro: string;
  passage: PassagePick;
  /** Multiplier on the reader's comfortable speed (RSVP / pacer). */
  speed?: number;
  chunk?: number;
  quiz: boolean;
  /** Seconds of structural preview before the timed read. */
  preview?: number;
  /** Show question stems before reading. */
  preQuestions?: boolean;
  /** Time limit as a multiple of comfortable speed (skimming). */
  skimFactor?: number;
  /** Free-recall step after reading. */
  recall?: boolean;
};

export type DrillStep = {
  type: "drill";
  exercise: "span" | "grid" | "chunks" | "scan";
  title: string;
  intro: string;
  config: {
    difficulty?: Difficulty;
    trials?: number;
    sizes?: number[];
    startSize?: number;
    maxSize?: number;
    targets?: number;
  };
};

export type ReflectStep = {
  type: "reflect";
  prompt: string;
  options: string[];
};

export type LessonStep = ConceptStep | ReadStep | DrillStep | ReflectStep;

export type Lesson = {
  id: string;
  stage: Level;
  number: number;
  title: string;
  subtitle: string;
  focus: string;
  minutes: number;
  kind: "lesson" | "checkpoint";
  steps: LessonStep[];
};

export type Stage = {
  id: Level;
  index: number;
  title: string;
  tagline: string;
  description: string;
  outcomes: string[];
};
