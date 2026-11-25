export const categories = [
  "science",
  "technology",
  "business",
  "psychology",
  "history",
  "personal-development",
] as const;

export type Category = (typeof categories)[number];

export const categoryLabels: Record<Category, string> = {
  science: "Science",
  technology: "Technology",
  business: "Business",
  psychology: "Psychology",
  history: "History",
  "personal-development": "Personal growth",
};

export type Difficulty = 1 | 2 | 3;

export const difficultyLabels: Record<Difficulty, string> = {
  1: "Accessible",
  2: "Moderate",
  3: "Challenging",
};

export type Question = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  /** What kind of understanding the question checks. */
  kind: "detail" | "main-idea" | "inference" | "vocabulary";
};

export type PassageInput = {
  slug: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  summary: string;
  body: string;
  questions: Question[];
  keyPoints: string[];
};

export type Passage = PassageInput & {
  kind: "library" | "assessment";
  words: number;
  paragraphs: string[];
};

/** A passage with the answer key removed — safe to send to the browser. */
export type PublicPassage = Omit<Passage, "questions"> & {
  questions: { q: string; options: [string, string, string, string]; kind: Question["kind"] }[];
};
