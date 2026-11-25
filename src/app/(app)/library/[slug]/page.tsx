import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlignLeft, ArrowLeft, ArrowRight, Check, Clock, FileText, ScanSearch, Timer, Type } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth/session";
import { categoryLabels, difficultyLabels, getPassage, libraryPassages } from "@/lib/content";
import { listBookmarks } from "@/lib/dal/library";
import { listSessions } from "@/lib/dal/practice";
import { computeOverview } from "@/lib/stats/core";
import { todayFor } from "@/lib/services/rewards";
import { formatReadTime, formatRelative } from "@/lib/format";
import { sessionKindLabel } from "@/lib/exercises";
import { readingFontClass } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/library/bookmark-button";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPassage(slug)?.title ?? "Article" };
}

export default async function PassagePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getPassage(slug);
  if (!p || p.kind !== "library") notFound();
  const user = await requireOnboardedUser();
  const sessions = listSessions(user.id);
  const overview = computeOverview(sessions, user.preferences, todayFor(user), { wpm: user.baselineWpm, comp: user.baselineComp });
  const history = sessions.filter((s) => s.sourceId === p.slug).reverse();
  const saved = listBookmarks(user.id).has(p.slug);
  const related = libraryPassages.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 2);
  const readTime = formatReadTime(p.words, overview.comfortWpm);

  const modes = [
    { href: `/train/timed?passage=${p.slug}&from=library`, icon: Timer, title: "Timed reading", text: "Your natural pace, then five questions", primary: true },
    { href: `/train/pacer?passage=${p.slug}&from=library`, icon: AlignLeft, title: "Guided pacer", text: `A moving highlight at ${user.preferences.pacerWpm} WPM` },
    { href: `/train/rsvp?passage=${p.slug}&from=library`, icon: Type, title: "RSVP", text: `One word at a time at ${user.preferences.rsvpWpm} WPM` },
    { href: `/train/scan?passage=${p.slug}&from=library`, icon: ScanSearch, title: "Scan hunt", text: "Find target words fast" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/library" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-ink">
        <ArrowLeft className="size-4" /> Library
      </Link>
      <header className="animate-rise">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-accent-ink">{categoryLabels[p.category]}</span>
          <BookmarkButton slug={p.slug} saved={saved} />
        </div>
        <h1 className="mt-1 text-[32px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[38px]">{p.title}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{p.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-3">
          <span className="flex items-center gap-1.5">
            <FileText className="size-4" /> {p.words} words
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" /> ~{readTime} at your pace
          </span>
          <span>{difficultyLabels[p.difficulty]}</span>
          <span>{p.questions.length} questions</span>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Practice with this text</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {modes.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className={cn(
                "group flex items-center gap-3.5 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow]",
                m.primary ? "border-accent-vivid/40 bg-accent-soft hover:shadow-[0_0_0_3px_var(--ring)]" : "border-line bg-surface hover:border-line-strong",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  m.primary ? "bg-accent text-accent-fg" : "bg-surface-2 text-ink-2",
                )}
              >
                <m.icon className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">{m.title}</span>
                <span className="block truncate text-[13px] text-ink-3">{m.text}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Opening</h2>
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
          <p
            className={cn("text-ink-2", readingFontClass[user.preferences.readingFont])}
            style={{ fontSize: user.preferences.readingSize - 1, lineHeight: user.preferences.lineHeight }}
          >
            {p.paragraphs[0]}
          </p>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
        </div>
        <p className="mt-2 text-[12px] text-ink-3">The full text opens in your chosen practice mode, so your reading time is measured.</p>
      </section>

      {history.length ? (
        <section className="mt-10">
          <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Your reads</h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {history.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                <span className="flex items-center gap-2 text-ink-2">
                  <Check className="size-4 text-good" />
                  {sessionKindLabel[s.exercise]}
                </span>
                <span className="tabular text-ink">
                  {s.wpm ? `${s.wpm} WPM` : ""}
                  {s.comprehension != null ? ` · ${Math.round(s.comprehension * 100)}%` : ""}
                </span>
                <span className="text-ink-3">{formatRelative(s.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-10">
          <h2 className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">More in {categoryLabels[p.category]}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/library/${r.slug}`} className="card p-4 transition-colors hover:border-line-strong">
                <div className="text-[15px] font-semibold text-ink">{r.title}</div>
                <div className="mt-1 text-[13px] text-ink-3">{r.summary}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
