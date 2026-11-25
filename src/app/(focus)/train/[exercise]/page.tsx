import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { exerciseById } from "@/lib/exercises";
import { listSessions } from "@/lib/dal/practice";
import { computeOverview } from "@/lib/stats/core";
import { todayFor } from "@/lib/services/rewards";
import {
  defaultDifficulty,
  readingPrefsOf,
  resolveText,
  samplePhrasePools,
  scanText,
} from "@/lib/services/training";
import { TimedReader } from "@/components/training/timed-reader";
import { RsvpReader } from "@/components/training/rsvp-reader";
import { PacerReader } from "@/components/training/pacer-reader";
import { SpanDrill } from "@/components/training/span-drill";
import { GridDrill } from "@/components/training/grid-drill";
import { ChunkDrill } from "@/components/training/chunk-drill";
import { ScanDrill } from "@/components/training/scan-drill";
import type { ExerciseId } from "@/lib/curriculum/types";

type Params = { exercise: string };
type Search = { passage?: string; text?: string; wpm?: string; size?: string; difficulty?: string; from?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { exercise } = await params;
  return { title: exerciseById.get(exercise as ExerciseId)?.name ?? "Practice" };
}

function intParam(v: string | undefined, min: number, max: number): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : undefined;
}

export default async function TrainPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
  const { exercise } = await params;
  const sp = await searchParams;
  const meta = exerciseById.get(exercise as ExerciseId);
  if (!meta) notFound();
  const user = await requireOnboardedUser();
  const prefs = readingPrefsOf(user.preferences);
  const overview = computeOverview(listSessions(user.id), user.preferences, todayFor(user), {
    wpm: user.baselineWpm,
    comp: user.baselineComp,
  });
  const exitHref = sp.from === "library" ? "/library" : sp.from === "dashboard" ? "/dashboard" : "/train";
  const ctx = { exitHref, comfortWpm: overview.comfortWpm };
  const diff = (intParam(sp.difficulty, 1, 3) as 1 | 2 | 3 | undefined) ?? defaultDifficulty(user.level);
  const query = new URLSearchParams(Object.entries({ from: sp.from }).filter(([, v]) => v) as [string, string][]).toString();
  const againHref = `/train/${exercise}${query ? `?${query}` : ""}`;

  if (exercise === "timed" || exercise === "rsvp" || exercise === "pacer") {
    const text = resolveText(user, { passage: sp.passage, text: sp.text }, diff);
    if (!text) redirect("/library?missing=1");
    const wpm = intParam(sp.wpm, 100, 1000);
    if (exercise === "timed") return <TimedReader text={text} prefs={prefs} ctx={ctx} againHref={againHref} />;
    if (exercise === "rsvp") return <RsvpReader text={text} prefs={prefs} ctx={ctx} options={{ wpm }} againHref={againHref} />;
    return <PacerReader text={text} prefs={prefs} ctx={ctx} options={{ wpm }} againHref={againHref} />;
  }
  if (exercise === "span") return <SpanDrill ctx={ctx} difficulty={diff} trials={14} />;
  if (exercise === "grid") return <GridDrill ctx={ctx} />;
  if (exercise === "chunks") {
    const size = intParam(sp.size, 2, 5) ?? (user.level === "foundations" ? 2 : 3);
    return <ChunkDrill ctx={ctx} pools={samplePhrasePools()} prefs={prefs} startSize={size} maxSize={5} trials={16} />;
  }
  if (exercise === "scan") return <ScanDrill ctx={ctx} text={scanText(user, diff, sp.passage)} prefs={prefs} targets={6} />;
  notFound();
}
