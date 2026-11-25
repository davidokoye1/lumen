import { libraryA } from "./library-a";
import { libraryB } from "./library-b";
import { assessmentPassages } from "./assessments";
import type { Passage, PassageInput, PublicPassage } from "./types";
import { countWords } from "@/lib/reading/text";
import { hashString, seededRandom, shuffle } from "@/lib/utils";

/**
 * Deterministically reorder answer options so the correct letter carries no
 * pattern: answer positions rotate through A–D within each passage, and the
 * distractors are shuffled around it.
 */
function shuffleQuestions(input: PassageInput): PassageInput["questions"] {
  const offset = hashString(input.slug) % 4;
  return input.questions.map((q, i) => {
    const target = (offset + i) % 4;
    const rand = seededRandom(hashString(`${input.slug}:${i}`));
    const distractors = shuffle(
      [0, 1, 2, 3].filter((o) => o !== q.answer),
      rand,
    );
    const order = [...distractors];
    order.splice(target, 0, q.answer);
    return {
      ...q,
      options: order.map((o) => q.options[o]) as typeof q.options,
      answer: target as typeof q.answer,
    };
  });
}

function build(input: PassageInput, kind: Passage["kind"]): Passage {
  const paragraphs = input.body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return { ...input, questions: shuffleQuestions(input), kind, paragraphs, words: countWords(input.body) };
}

export const libraryPassages: Passage[] = [...libraryA, ...libraryB].map((p) => build(p, "library"));
export const checkInPassages: Passage[] = assessmentPassages.map((p) => build(p, "assessment"));

const bySlug = new Map<string, Passage>([...libraryPassages, ...checkInPassages].map((p) => [p.slug, p]));

export function getPassage(slug: string): Passage | null {
  return bySlug.get(slug) ?? null;
}

export function toPublicPassage(p: Passage): PublicPassage {
  return {
    ...p,
    questions: p.questions.map(({ q, options, kind }) => ({ q, options, kind })),
  };
}

/** Grade answers against the key. Unanswered (-1) counts as wrong. */
export function gradeAnswers(p: Passage, answers: number[]) {
  const correct = p.questions.map((q) => q.answer);
  const results = correct.map((c, i) => answers[i] === c);
  const score = results.filter(Boolean).length;
  return { correct, results, score, total: correct.length, fraction: correct.length ? score / correct.length : 0 };
}

export * from "./types";
