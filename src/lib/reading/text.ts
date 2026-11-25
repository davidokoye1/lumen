/**
 * Text engine shared by every reading exercise (client and server safe).
 */

export function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function splitParagraphs(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n|\n(?=\s*[A-Z"“'‘(])/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export type Token = {
  text: string;
  index: number;
  paragraph: number;
  /** Ends with , ; : — or similar soft break */
  clauseEnd: boolean;
  /** Ends with . ! ? */
  sentenceEnd: boolean;
  paragraphEnd: boolean;
  /** Index of the first token of this token's sentence */
  sentenceStart: number;
};

const SENTENCE_END = /[.!?…]["”’')\]]*$/;
const CLAUSE_END = /[,;:—–-]["”’')\]]*$/;
const ABBREVIATIONS = new Set(["mr.", "mrs.", "ms.", "dr.", "st.", "vs.", "e.g.", "i.e.", "etc.", "u.s.", "no."]);

export function tokenize(paragraphs: string[]): Token[] {
  const tokens: Token[] = [];
  let sentenceStart = 0;
  paragraphs.forEach((para, p) => {
    const words = para.split(/\s+/).filter(Boolean);
    words.forEach((w, i) => {
      const lower = w.toLowerCase();
      const isAbbrev = ABBREVIATIONS.has(lower);
      const last = i === words.length - 1;
      const sentenceEnd = (SENTENCE_END.test(w) && !isAbbrev) || last;
      tokens.push({
        text: w,
        index: tokens.length,
        paragraph: p,
        clauseEnd: !sentenceEnd && CLAUSE_END.test(w),
        sentenceEnd,
        paragraphEnd: last,
        sentenceStart,
      });
      if (sentenceEnd) sentenceStart = tokens.length;
    });
  });
  return tokens;
}

/**
 * Optimal recognition point: slightly left of centre, where the eye
 * identifies a word fastest. Returns the character index in `word`.
 */
export function orpIndex(word: string): number {
  const lead = word.match(/^[^\p{L}\p{N}]*/u)?.[0].length ?? 0;
  const core = word.slice(lead).replace(/[^\p{L}\p{N}]+$/u, "");
  const L = core.length;
  let i: number;
  if (L <= 1) i = 0;
  else if (L <= 5) i = 1;
  else if (L <= 9) i = 2;
  else if (L <= 13) i = 3;
  else i = 4;
  return Math.min(word.length - 1, lead + i);
}

export function splitAtOrp(word: string): [string, string, string] {
  const i = orpIndex(word);
  return [word.slice(0, i), word.charAt(i), word.slice(i + 1)];
}

function coreLength(word: string) {
  return word.replace(/[^\p{L}\p{N}]/gu, "").length;
}

/** Relative dwell time for a token; 1 = an average word. */
export function dwellFactor(t: Token, punctuationPauses: boolean): number {
  const len = coreLength(t.text);
  let f = 1;
  if (len >= 8) f += 0.25;
  if (len >= 12) f += 0.25;
  if (len <= 2) f -= 0.15;
  if (punctuationPauses) {
    if (t.paragraphEnd) f += 1.4;
    else if (t.sentenceEnd) f += 0.9;
    else if (t.clauseEnd) f += 0.4;
  }
  return f;
}

export type Frame = {
  /** First token index in this frame */
  start: number;
  /** Last token index (inclusive) */
  end: number;
  text: string;
  /** Milliseconds this frame stays on screen at the base rate */
  ms: number;
};

/**
 * Build the presentation schedule for RSVP. Durations are normalised so the
 * overall rate equals `wpm` exactly — pauses at punctuation are paid for by
 * slightly faster short words, so the reported speed stays honest.
 */
export function buildFrames(tokens: Token[], wpm: number, chunkSize: number, punctuationPauses: boolean): Frame[] {
  if (!tokens.length) return [];
  const factors = tokens.map((t) => dwellFactor(t, punctuationPauses));
  const avg = factors.reduce((a, b) => a + b, 0) / factors.length;
  const base = 60_000 / wpm;
  const frames: Frame[] = [];
  let i = 0;
  while (i < tokens.length) {
    let j = i;
    // Grow a chunk up to chunkSize, but never across a sentence end.
    while (j - i + 1 < chunkSize && j + 1 < tokens.length && !tokens[j].sentenceEnd && !tokens[j].clauseEnd) j++;
    let ms = 0;
    for (let k = i; k <= j; k++) ms += (factors[k] / avg) * base;
    frames.push({
      start: i,
      end: j,
      text: tokens
        .slice(i, j + 1)
        .map((t) => t.text)
        .join(" "),
      ms,
    });
    i = j + 1;
  }
  return frames;
}

const PHRASE_STARTERS = new Set([
  "a", "an", "the", "and", "but", "or", "nor", "so", "yet", "because", "although", "though", "while", "when",
  "where", "which", "who", "whom", "whose", "that", "if", "unless", "until", "since", "as", "than",
  "of", "in", "on", "at", "to", "for", "from", "with", "without", "by", "about", "into", "onto", "over",
  "under", "between", "through", "during", "before", "after", "across", "against", "toward", "towards", "around",
]);

export type Phrase = { start: number; end: number; text: string };

/**
 * Segment tokens into meaningful phrases of roughly `target` words,
 * breaking at punctuation and before function words where possible.
 */
export function segmentPhrases(tokens: Token[], target: number): Phrase[] {
  const out: Phrase[] = [];
  let start = 0;
  const close = (end: number) => {
    out.push({
      start,
      end,
      text: tokens
        .slice(start, end + 1)
        .map((t) => t.text)
        .join(" "),
    });
    start = end + 1;
  };
  for (let i = 0; i < tokens.length; i++) {
    const len = i - start + 1;
    const t = tokens[i];
    const next = tokens[i + 1];
    if (!next || t.sentenceEnd || t.clauseEnd || t.paragraphEnd) {
      close(i);
      continue;
    }
    const nextStarts = PHRASE_STARTERS.has(next.text.toLowerCase().replace(/[^a-z]/g, ""));
    if (len >= target + 1) close(i);
    else if (len >= target && (nextStarts || target === 1)) close(i);
    else if (len >= target && len >= 2 && !PHRASE_STARTERS.has(t.text.toLowerCase())) close(i);
  }
  return out;
}

export function estimateMinutes(words: number, wpm: number): number {
  return Math.max(1, Math.round(words / Math.max(60, wpm)));
}

/** Upper bound for a plausible self-paced read with real comprehension. */
export const IMPLAUSIBLE_WPM = 1100;

/** Phrase-based frames for the guided pacer, normalised to the target WPM like buildFrames. */
export function buildPhraseFrames(tokens: Token[], wpm: number, chunk: number, punctuationPauses: boolean): Frame[] {
  if (!tokens.length) return [];
  const factors = tokens.map((t) => dwellFactor(t, punctuationPauses));
  const avg = factors.reduce((a, b) => a + b, 0) / factors.length;
  const base = 60_000 / wpm;
  return segmentPhrases(tokens, chunk).map((p) => {
    let ms = 0;
    for (let k = p.start; k <= p.end; k++) ms += (factors[k] / avg) * base;
    return { start: p.start, end: p.end, text: p.text, ms };
  });
}

/** Index of the frame containing token `pos` (binary search). */
export function frameIndexAt(frames: Frame[], pos: number): number {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (frames[mid].end < pos) lo = mid + 1;
    else if (frames[mid].start > pos) hi = mid - 1;
    else return mid;
  }
  return Math.min(frames.length, lo);
}
