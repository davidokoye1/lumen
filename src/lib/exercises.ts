import type { ExerciseId } from "@/lib/curriculum/types";

export type SessionKind = ExerciseId | "assessment" | "placement";

export type ExerciseMeta = {
  id: ExerciseId;
  name: string;
  short: string;
  description: string;
  skill: string;
  kind: "reading" | "drill";
  minutes: number;
};

export const exercises: ExerciseMeta[] = [
  {
    id: "timed",
    name: "Timed reading",
    short: "Timed",
    description: "Read a full passage at your own pace, then answer questions. This is your truest measure of reading.",
    skill: "Natural speed + comprehension",
    kind: "reading",
    minutes: 4,
  },
  {
    id: "pacer",
    name: "Guided pacer",
    short: "Pacer",
    description: "A soft highlight moves through the text at your target speed, keeping your eyes moving forward.",
    skill: "Fewer regressions, steady rhythm",
    kind: "reading",
    minutes: 4,
  },
  {
    id: "rsvp",
    name: "RSVP reader",
    short: "RSVP",
    description: "Words appear one at a time (or in small phrases) at the center of the screen, aligned on the focal letter.",
    skill: "Speed tolerance, focus",
    kind: "reading",
    minutes: 3,
  },
  {
    id: "chunks",
    name: "Phrase flash",
    short: "Chunks",
    description: "Recognize short phrases from a single glance. The phrase size adapts to your accuracy.",
    skill: "Reading in meaningful units",
    kind: "drill",
    minutes: 3,
  },
  {
    id: "span",
    name: "Word flash",
    short: "Span",
    description: "Two words flash on either side of a fixation point, too briefly to move your eyes. It trains single-glance recognition.",
    skill: "Peripheral word recognition",
    kind: "drill",
    minutes: 3,
  },
  {
    id: "grid",
    name: "Focus grid",
    short: "Grid",
    description: "Find numbers in order while keeping your eyes on the center. It's a warm-up for attention and visual search.",
    skill: "Attention, visual search",
    kind: "drill",
    minutes: 2,
  },
  {
    id: "scan",
    name: "Scan hunt",
    short: "Scan",
    description: "Find target words in a passage as fast as you can. Scanning is a strategic skill: searching, not reading.",
    skill: "Strategic scanning",
    kind: "drill",
    minutes: 3,
  },
];

export const exerciseById = new Map(exercises.map((e) => [e.id, e]));

export const sessionKindLabel: Record<SessionKind, string> = {
  timed: "Timed reading",
  pacer: "Guided pacer",
  rsvp: "RSVP",
  chunks: "Phrase flash",
  span: "Word flash",
  grid: "Focus grid",
  scan: "Scan hunt",
  assessment: "Check-in",
  placement: "Placement",
};

export const READING_KINDS: SessionKind[] = ["timed", "pacer", "rsvp", "assessment", "placement"];
export const NATURAL_KINDS: SessionKind[] = ["timed", "assessment", "placement"];
export const DRILL_KINDS: SessionKind[] = ["span", "grid", "chunks", "scan"];
