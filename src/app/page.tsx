import Link from "next/link";
import { AlignLeft, ArrowRight, Eye, FlaskConical, Grid3x3, Layers, LineChart, ScanSearch, Target, Timer, Type } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { stages } from "@/lib/curriculum/lessons";
import { Logo } from "@/components/shell/logo";
import { LinkButton } from "@/components/ui/button";
import { RsvpDemo } from "@/components/marketing/rsvp-demo";

const modes = [
  { icon: Timer, name: "Timed reading", text: "Your real speed and comprehension, measured honestly." },
  { icon: AlignLeft, name: "Guided pacer", text: "A soft highlight that keeps your eyes moving forward." },
  { icon: Type, name: "RSVP", text: "Words at a fixed point, aligned on the focal letter." },
  { icon: Layers, name: "Phrase flash", text: "Read meaningful chunks, not single words." },
  { icon: Eye, name: "Word flash", text: "Single-glance recognition under brief exposure." },
  { icon: Grid3x3, name: "Focus grid", text: "A two-minute attention warm-up." },
  { icon: ScanSearch, name: "Scan hunt", text: "Find facts without reading everything." },
];

export default async function Landing({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const user = await getCurrentUser();
  const { deleted } = await searchParams;
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            {user ? (
              <LinkButton href={user.onboarded ? "/dashboard" : "/onboarding"} size="sm">
                Open Lumen <ArrowRight className="size-3.5" />
              </LinkButton>
            ) : (
              <>
                <LinkButton href="/login" variant="ghost" size="sm">
                  Sign in
                </LinkButton>
                <LinkButton href="/signup" size="sm">
                  Get started
                </LinkButton>
              </>
            )}
          </nav>
        </div>
      </header>

      {deleted ? (
        <div className="mx-auto mt-6 max-w-6xl px-6">
          <div className="rounded-xl border border-line bg-surface px-4 py-3 text-[14px] text-ink-2">Your account and data have been deleted.</div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div className="animate-rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] text-ink-2">
            <FlaskConical className="size-3.5 text-accent-vivid" /> Built on reading research, not hype
          </p>
          <h1 className="text-[44px] leading-[1.04] font-semibold tracking-[-0.04em] text-ink sm:text-[60px]">
            Read faster.
            <br />
            <span className="text-ink-3">Understand more.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[18px] leading-relaxed text-ink-2">
            Lumen is a 25-session reading program that trains your attention, your eyes and your habits. It measures
            your effective reading rate, which is speed times comprehension, so every gain is one you keep.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href={user ? "/dashboard" : "/signup"} size="lg">
              {user ? "Continue reading" : "Measure your baseline"} <ArrowRight className="size-4" />
            </LinkButton>
            <span className="text-[13px] text-ink-3">Free · 5 minutes to your first result</span>
          </div>
        </div>
        <div className="animate-scale-in [animation-delay:120ms]">
          <RsvpDemo />
        </div>
      </section>

      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {[
            {
              icon: Target,
              t: "Comprehension gates speed",
              d: "Your progress is speed × understanding. When comprehension drops below 70%, Lumen slows you down. That's what makes the gains real.",
            },
            {
              icon: LineChart,
              t: "Measured, not guessed",
              d: "Standardized weekly check-ins, honest timing that pauses when you leave the tab, and analytics that show where understanding starts to slip.",
            },
            {
              icon: FlaskConical,
              t: "Honest about the science",
              d: "No 1,000 WPM promises. Lumen trains what research supports: focus, fewer regressions, phrase reading, previewing and retrieval.",
            },
          ].map((f) => (
            <div key={f.t}>
              <f.icon className="size-5 text-accent-vivid" />
              <h3 className="mt-4 text-[17px] font-semibold text-ink">{f.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-[32px] font-semibold tracking-[-0.03em] text-ink">The Lumen Method</h2>
        <p className="mt-2 max-w-2xl text-[16px] text-ink-2">
          Three stages of ten-minute sessions. Each one teaches a technique, trains it, then checks that it carries over
          to real reading.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {stages.map((s) => (
            <div key={s.id} className="card p-6">
              <div className="text-[13px] font-medium text-accent-ink">Stage {s.index + 1}</div>
              <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.015em] text-ink">{s.title}</h3>
              <p className="mt-1 text-[14px] text-ink-3">{s.tagline}</p>
              <ul className="mt-5 space-y-2 text-[14px] text-ink-2">
                {s.outcomes.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-vivid" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-[32px] font-semibold tracking-[-0.03em] text-ink">Seven ways to train</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map((m) => (
            <div key={m.name} className="rounded-2xl border border-line bg-surface p-5">
              <m.icon className="size-5 text-ink-2" />
              <div className="mt-3 text-[15px] font-semibold text-ink">{m.name}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-ink-3">{m.text}</div>
            </div>
          ))}
          <div className="flex flex-col justify-between rounded-2xl bg-accent p-5 text-accent-fg">
            <div className="text-[15px] font-semibold">Plus a library of 18 original articles, and your own texts.</div>
            <Link href={user ? "/library" : "/signup"} className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium">
              Start reading <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-[13px] text-ink-3 sm:flex-row">
          <Logo />
          <span>Read with attention. Measure honestly. © {new Date().getFullYear()} Lumen</span>
        </div>
      </footer>
    </div>
  );
}
