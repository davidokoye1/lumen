import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, PenLine } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth/session";
import { exercises, type ExerciseMeta } from "@/lib/exercises";
import { listSessions, type SessionRecord } from "@/lib/dal/practice";
import { listCustomTexts } from "@/lib/dal/library";
import { formatRelative } from "@/lib/format";
import { mean } from "@/lib/utils";
import { PageHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { exerciseIcons } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Practice" };

function statFor(e: ExerciseMeta, list: SessionRecord[]): { label: string; value: string } | null {
  if (!list.length) return null;
  if (e.id === "timed") {
    const best = Math.max(...list.filter((s) => (s.comprehension ?? 0) >= 0.7 && !s.flagged).map((s) => s.wpm ?? 0), 0);
    return best ? { label: "Best at 70%+", value: `${best} WPM` } : null;
  }
  if (e.id === "rsvp" || e.id === "pacer") {
    const best = Math.max(...list.filter((s) => (s.comprehension ?? 0) >= 0.7).map((s) => s.wpm ?? 0), 0);
    return best ? { label: "Top speed at 70%+", value: `${best} WPM` } : { label: "Last speed", value: `${list.at(-1)!.wpm} WPM` };
  }
  const acc = mean(list.slice(-5).map((s) => s.accuracy ?? 0));
  return acc != null ? { label: "Recent accuracy", value: `${Math.round(acc * 100)}%` } : null;
}

export default async function TrainPage() {
  const user = await requireOnboardedUser();
  const sessions = listSessions(user.id);
  const texts = listCustomTexts(user.id).slice(0, 4);
  const groups: { title: string; description: string; items: ExerciseMeta[] }[] = [
    {
      title: "Reading modes",
      description: "Real passages with comprehension checks. This is where gains are measured.",
      items: exercises.filter((e) => e.kind === "reading"),
    },
    {
      title: "Recognition & focus drills",
      description: "Short, adaptive drills that sharpen specific sub-skills. Follow them with real reading.",
      items: exercises.filter((e) => e.kind === "drill"),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Free practice"
        title="Practice"
        description="Train any skill on its own. Reading modes pick a fresh passage at your level, or you can choose one from the library."
        action={
          <LinkButton href="/library" variant="secondary" icon={<BookOpen className="size-4" />}>
            Choose a text
          </LinkButton>
        }
      />
      <div className="space-y-12">
        {groups.map((g) => (
          <section key={g.title}>
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink">{g.title}</h2>
              <p className="mt-0.5 text-[14px] text-ink-3">{g.description}</p>
            </div>
            <div className={g.items.length === 3 ? "grid gap-3 md:grid-cols-3" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
              {g.items.map((e) => {
                const Icon = exerciseIcons[e.id];
                const list = sessions.filter((s) => s.exercise === e.id || (e.id === "timed" && s.exercise === "assessment"));
                const stat = statFor(e, list);
                const last = list.at(-1);
                return (
                  <Link
                    key={e.id}
                    href={`/train/${e.id}`}
                    className="card group flex flex-col p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                        <Icon className="size-5" />
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-ink-3">
                        <Clock className="size-3" /> ~{e.minutes} min
                      </span>
                    </div>
                    <h3 className="mt-4 text-[16px] font-semibold text-ink">{e.name}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{e.description}</p>
                    <div className="mt-4 flex-1" />
                    <div className="flex items-end justify-between gap-3 border-t border-line pt-3.5">
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-medium tracking-wide text-ink-3 uppercase">{e.skill}</div>
                        <div className="mt-1 truncate text-[13px] text-ink-2">
                          {stat ? (
                            <>
                              <span className="font-semibold text-ink">{stat.value}</span> · {stat.label.toLowerCase()}
                            </>
                          ) : (
                            "Not tried yet"
                          )}
                        </div>
                        {last ? <div className="mt-0.5 text-[12px] text-ink-3">Last: {formatRelative(last.createdAt)}</div> : null}
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink">Your texts</h2>
              <p className="mt-0.5 text-[14px] text-ink-3">Train on what you actually need to read.</p>
            </div>
            <LinkButton href="/library?new=1" variant="ghost" size="sm" icon={<PenLine className="size-3.5" />}>
              Add text
            </LinkButton>
          </div>
          {texts.length ? (
            <ul className="grid gap-2 md:grid-cols-2">
              {texts.map((t) => (
                <li key={t.id} className="card flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-ink">{t.title}</div>
                    <div className="text-[12px] text-ink-3">{t.words.toLocaleString("en-US")} words</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {(["timed", "pacer", "rsvp"] as const).map((m) => {
                      const Icon = exerciseIcons[m];
                      return (
                        <Link
                          key={m}
                          href={`/train/${m}?text=${t.id}`}
                          className="flex size-9 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
                          aria-label={`${m} with ${t.title}`}
                          title={m === "timed" ? "Timed reading" : m === "pacer" ? "Guided pacer" : "RSVP"}
                        >
                          <Icon className="size-4" />
                        </Link>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Link
              href="/library?new=1"
              className="flex items-center gap-4 rounded-2xl border border-dashed border-line-strong p-5 text-[14px] text-ink-2 transition-colors hover:bg-surface"
            >
              <PenLine className="size-5 text-ink-3" />
              Paste an article, report or chapter to practice with it in any reading mode.
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
