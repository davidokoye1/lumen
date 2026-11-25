import type { Preferences } from "@/lib/preferences";
import type { Rewards } from "@/lib/services/rewards";

export type QuizQuestion = { q: string; options: [string, string, string, string]; kind: string };

export type ReadingText = {
  source: { type: "passage"; slug: string } | { type: "custom"; id: string };
  title: string;
  paragraphs: string[];
  words: number;
  questions: QuizQuestion[];
  keyPoints: string[];
  difficulty?: 1 | 2 | 3;
  category?: string;
};

export type ReadingPrefs = Pick<
  Preferences,
  | "readingFont"
  | "readingSize"
  | "lineHeight"
  | "rsvpWpm"
  | "rsvpFontSize"
  | "rsvpChunk"
  | "orpHighlight"
  | "punctuationPauses"
  | "easeIn"
  | "pacerWpm"
  | "pacerChunk"
  | "showTimer"
>;

/** What a finished step reports back to the lesson player. */
export type StepOutcome = {
  exercise: string;
  wpm?: number | null;
  comprehension?: number | null;
  accuracy?: number | null;
  score?: number | null;
  rewards: Rewards | null;
};

export type PlayerContext = {
  /** Lesson id when running inside the program */
  lessonId?: string;
  /** Called when the user continues past the results screen */
  onComplete?: (o: StepOutcome) => void;
  /** Where "exit" goes when standalone */
  exitHref: string;
  /** Average natural WPM for comparisons */
  comfortWpm: number;
};
