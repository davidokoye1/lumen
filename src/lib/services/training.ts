import "server-only";
import type { User } from "@/lib/dal/users";
import { categoryLabels, libraryPassages, type Passage } from "@/lib/content";
import { getCustomText, type CustomText } from "@/lib/dal/library";
import { sourceReadCounts } from "@/lib/dal/practice";
import { pickCheckInPassage, pickLibraryPassage } from "@/lib/curriculum/progress";
import { segmentPhrases, splitParagraphs, tokenize } from "@/lib/reading/text";
import type { Preferences } from "@/lib/preferences";
import type { ReadingPrefs, ReadingText } from "@/components/training/types";
import type { PhrasePools } from "@/components/training/chunk-drill";

export function readingPrefsOf(p: Preferences): ReadingPrefs {
  return {
    readingFont: p.readingFont,
    readingSize: p.readingSize,
    lineHeight: p.lineHeight,
    rsvpWpm: p.rsvpWpm,
    rsvpFontSize: p.rsvpFontSize,
    rsvpChunk: p.rsvpChunk,
    orpHighlight: p.orpHighlight,
    punctuationPauses: p.punctuationPauses,
    easeIn: p.easeIn,
    pacerWpm: p.pacerWpm,
    pacerChunk: p.pacerChunk,
    showTimer: p.showTimer,
  };
}

/** Public reading text — answer key stripped. */
export function passageToText(p: Passage): ReadingText {
  return {
    source: { type: "passage", slug: p.slug },
    title: p.title,
    paragraphs: p.paragraphs,
    words: p.words,
    questions: p.questions.map(({ q, options, kind }) => ({ q, options, kind })),
    keyPoints: p.keyPoints,
    difficulty: p.difficulty,
    category: categoryLabels[p.category],
  };
}

export function customToText(t: CustomText): ReadingText {
  return {
    source: { type: "custom", id: t.id },
    title: t.title,
    paragraphs: splitParagraphs(t.body),
    words: t.words,
    questions: [],
    keyPoints: [],
    category: "Your text",
  };
}

/** Pick the reading material for a standalone exercise. */
export function resolveText(
  user: User,
  params: { passage?: string; text?: string },
  fallbackDifficulty: 1 | 2 | 3,
): ReadingText | null {
  if (params.text) {
    const t = getCustomText(user.id, params.text);
    return t ? customToText(t) : null;
  }
  if (params.passage) {
    const p = libraryPassages.find((x) => x.slug === params.passage);
    return p ? passageToText(p) : null;
  }
  const history = sourceReadCounts(user.id);
  return passageToText(pickLibraryPassage(fallbackDifficulty, history, `free:${new Date().toDateString()}`));
}

export function checkInText(user: User): ReadingText {
  return passageToText(pickCheckInPassage(sourceReadCounts(user.id)));
}

export function defaultDifficulty(level: User["level"]): 1 | 2 | 3 {
  return level === "foundations" ? 1 : level === "fluency" ? 2 : 3;
}

let poolsCache: PhrasePools | null = null;

/** Phrase pools by word count, built from the library's own sentences. */
export function phrasePools(): PhrasePools {
  if (poolsCache) return poolsCache;
  const pools: PhrasePools = { 2: [], 3: [], 4: [], 5: [] };
  for (const p of libraryPassages) {
    const tokens = tokenize(p.paragraphs);
    for (const size of [2, 3, 4, 5]) {
      for (const ph of segmentPhrases(tokens, size)) {
        const words = ph.text.replace(/[,;:.!?"“”()—–]+/g, "").split(/\s+/).filter(Boolean);
        if (words.length === size) pools[size].push(words.join(" "));
      }
    }
  }
  for (const k of Object.keys(pools)) pools[Number(k)] = Array.from(new Set(pools[Number(k)]));
  poolsCache = pools;
  return pools;
}

export function scanText(user: User, difficulty: 1 | 2 | 3, slug?: string): ReadingText {
  if (slug) {
    const p = libraryPassages.find((x) => x.slug === slug);
    if (p) return passageToText(p);
  }
  return passageToText(pickLibraryPassage(difficulty, new Map(), `scan:${user.id}:${Date.now() >> 20}`));
}

/** A random sample per size, so the client receives a small payload. */
export function samplePhrasePools(perSize = 120): PhrasePools {
  const all = phrasePools();
  const out: PhrasePools = {};
  for (const [k, list] of Object.entries(all)) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    out[Number(k)] = copy.slice(0, perSize);
  }
  return out;
}
