"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase, Coffee, GraduationCap, Target, Timer } from "lucide-react";
import { finishOnboardingAction, saveGoalsAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { ChoiceCard, Segmented, Slider } from "@/components/ui/controls";
import { ErrorBanner } from "@/components/ui/misc";
import { Logo } from "@/components/shell/logo";
import { TimedReader } from "@/components/training/timed-reader";
import type { ReadingPrefs, ReadingText, StepOutcome } from "@/components/training/types";
import { stages } from "@/lib/curriculum/lessons";
import type { Preferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";

type Level = "foundations" | "fluency" | "mastery";
type Step = "purpose" | "goals" | "placement-intro" | "placement" | "level";

const purposes: { value: Preferences["purpose"]; title: string; description: string; icon: React.ReactNode }[] = [
  { value: "work", title: "Work", description: "Get through reports, email and documentation faster.", icon: <Briefcase /> },
  { value: "study", title: "Study", description: "Read textbooks and papers with better understanding.", icon: <GraduationCap /> },
  { value: "exam", title: "Exams", description: "Handle timed reading sections with confidence.", icon: <Timer /> },
  { value: "leisure", title: "Leisure", description: "Read more books and enjoy them more.", icon: <Coffee /> },
];

export function recommendLevel(o: { wpm?: number | null; comprehension?: number | null } | null): Level | null {
  if (!o?.wpm || o.comprehension == null) return null;
  const err = o.wpm * o.comprehension;
  if (o.comprehension < 0.6 || err < 200) return "foundations";
  if (err < 320) return "fluency";
  return "mastery";
}

export function OnboardingFlow({
  name,
  initial,
  placement: placementProp,
  prefs,
}: {
  name: string;
  initial: { purpose: Preferences["purpose"]; dailyGoalMinutes: number; weeklyGoalDays: number; targetWpm: number };
  placement: ReadingText;
  prefs: ReadingPrefs;
}) {
  const router = useRouter();
  const [placement] = useState(placementProp);
  const [step, setStep] = useState<Step>("purpose");
  const [goals, setGoals] = useState(initial);
  const [result, setResult] = useState<StepOutcome | null>(null);
  const [level, setLevel] = useState<Level>("foundations");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommended = recommendLevel(result);

  async function saveGoals() {
    setSaving(true);
    setError(null);
    const res = await saveGoalsAction({ ...goals, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" }).catch(() => null);
    setSaving(false);
    if (!res || !res.ok) {
      setError(res && !res.ok ? res.error : "Network error. Try again.");
      return;
    }
    setStep("placement-intro");
  }

  async function finish() {
    setSaving(true);
    setError(null);
    const res = await finishOnboardingAction({ level }).catch(() => null);
    if (!res || !res.ok) {
      setSaving(false);
      setError(res && !res.ok ? res.error : "Network error. Try again.");
      return;
    }
    router.replace("/dashboard?welcome=1");
    router.refresh();
  }

  if (step === "placement") {
    return (
      <TimedReader
        text={placement}
        prefs={prefs}
        ctx={{
          exitHref: "/onboarding",
          comfortWpm: 238,
          onComplete: (o) => {
            setResult(o);
            setLevel(recommendLevel(o) ?? "foundations");
            setStep("level");
          },
        }}
        options={{
          exercise: "placement",
          title: "Placement read",
          intro:
            "Read this short passage the way you normally would. Don't rush, because this is your baseline. Five questions follow, and your result sets your starting point.",
        }}
      />
    );
  }

  const order: Step[] = ["purpose", "goals", "placement-intro", "level"];
  const progress = (order.indexOf(step) + 1) / order.length;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
        <Logo href="/onboarding" />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-surface-3" aria-label="Setup progress">
          <div className="h-full rounded-full bg-accent-vivid transition-[width] duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-10">
        <div key={step} className="animate-rise">
          <ErrorBanner className="mb-6">{error}</ErrorBanner>

          {step === "purpose" ? (
            <>
              <p className="text-[13px] font-medium text-ink-3">Welcome, {name}</p>
              <h1 className="mt-1 text-[30px] leading-tight font-semibold tracking-[-0.025em]">What do you want to read better?</h1>
              <p className="mt-2 text-[15px] text-ink-2">We&apos;ll tune recommendations to what you actually read.</p>
              <div role="radiogroup" className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {purposes.map((p) => (
                  <ChoiceCard
                    key={p.value}
                    selected={goals.purpose === p.value}
                    onClick={() => setGoals({ ...goals, purpose: p.value })}
                    title={p.title}
                    description={p.description}
                    icon={p.icon}
                  />
                ))}
              </div>
              <div className="mt-10 flex justify-end">
                <Button size="lg" onClick={() => setStep("goals")}>
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          ) : null}

          {step === "goals" ? (
            <>
              <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.025em]">Set a habit you&apos;ll keep</h1>
              <p className="mt-2 text-[15px] text-ink-2">
                Short, regular sessions beat occasional marathons. Most people see measurable gains with ten minutes a day.
              </p>
              <div className="mt-8 space-y-7">
                <div>
                  <div className="mb-2.5 text-[14px] font-medium text-ink">Daily practice</div>
                  <Segmented
                    className="w-full"
                    value={goals.dailyGoalMinutes}
                    onChange={(v) => setGoals({ ...goals, dailyGoalMinutes: v })}
                    options={[5, 10, 15, 20, 30].map((m) => ({ value: m, label: `${m} min` }))}
                  />
                </div>
                <div>
                  <div className="mb-2.5 text-[14px] font-medium text-ink">Days per week</div>
                  <Segmented
                    className="w-full"
                    value={goals.weeklyGoalDays}
                    onChange={(v) => setGoals({ ...goals, weeklyGoalDays: v })}
                    options={[3, 4, 5, 6, 7].map((d) => ({ value: d, label: String(d) }))}
                  />
                </div>
                <div>
                  <Slider
                    label="Target reading speed"
                    min={200}
                    max={700}
                    step={10}
                    value={goals.targetWpm}
                    onChange={(v) => setGoals({ ...goals, targetWpm: v })}
                    format={(v) => `${v} WPM`}
                  />
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                    An honest note: with good comprehension, gains of 20–50% over a few months are realistic. Claims of
                    1,000+ WPM with full understanding aren&apos;t supported by research.
                  </p>
                </div>
              </div>
              <div className="mt-10 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep("purpose")} icon={<ArrowLeft className="size-4" />}>
                  Back
                </Button>
                <Button size="lg" onClick={saveGoals} loading={saving}>
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          ) : null}

          {step === "placement-intro" ? (
            <>
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
                <Target className="size-[22px]" />
              </div>
              <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.025em]">Let&apos;s find your starting point</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                You&apos;ll read a short passage (about 380 words) at your normal pace, then answer five questions. Lumen
                combines speed and comprehension into your <span className="font-medium text-ink">effective reading rate</span>,
                the number your training is built around.
              </p>
              <ul className="mt-6 space-y-2.5 text-[14px] text-ink-2">
                <li>• Takes about 3 minutes</li>
                <li>• Read naturally, because rushing only hides your real progress later</li>
                <li>• Find a quiet moment and put notifications away</li>
              </ul>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep("goals")} icon={<ArrowLeft className="size-4" />}>
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setStep("level")}>
                    Skip, I&apos;ll choose a level
                  </Button>
                  <Button size="lg" onClick={() => setStep("placement")}>
                    Start placement
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {step === "level" ? (
            <>
              {result?.wpm ? (
                <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                  {[
                    { l: "Speed", v: `${result.wpm} WPM` },
                    { l: "Comprehension", v: result.comprehension != null ? `${Math.round(result.comprehension * 100)}%` : "—" },
                    {
                      l: "Effective rate",
                      v: result.comprehension != null ? `${Math.round(result.wpm * result.comprehension)}` : "—",
                    },
                  ].map((x) => (
                    <div key={x.l} className="bg-surface px-4 py-3">
                      <div className="text-[12px] text-ink-3">{x.l}</div>
                      <div className="tabular mt-0.5 text-[18px] font-semibold text-ink">{x.v}</div>
                    </div>
                  ))}
                </div>
              ) : null}
              <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.025em]">
                {recommended ? "Here's where we suggest you start" : "Choose where to start"}
              </h1>
              <p className="mt-2 text-[15px] text-ink-2">
                {recommended
                  ? "Based on your placement. Earlier stages stay open, so you can revisit any session."
                  : "You can take the placement later from Settings. Earlier stages stay open either way."}
              </p>
              <div role="radiogroup" className="mt-7 grid gap-2.5">
                {stages.map((s) => (
                  <ChoiceCard
                    key={s.id}
                    selected={level === s.id}
                    onClick={() => setLevel(s.id)}
                    title={
                      <span className="flex items-center gap-2">
                        {s.title}
                        {recommended === s.id ? (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">Recommended</span>
                        ) : null}
                      </span>
                    }
                    description={s.tagline + " · " + s.outcomes.slice(0, 2).join(", ")}
                    icon={<span className={cn("text-[14px] font-semibold")}>{s.index + 1}</span>}
                  />
                ))}
              </div>
              <div className="mt-10 flex justify-end">
                <Button size="lg" onClick={finish} loading={saving}>
                  Start my program <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
