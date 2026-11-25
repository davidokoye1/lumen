import type { Metadata } from "next";
import { Suspense } from "react";
import { requireOnboardedUser } from "@/lib/auth/session";
import { libraryPassages } from "@/lib/content";
import { listBookmarks, listCustomTexts } from "@/lib/dal/library";
import { listSessions, sourceReadCounts } from "@/lib/dal/practice";
import { computeOverview } from "@/lib/stats/core";
import { todayFor } from "@/lib/services/rewards";
import { PageHeader } from "@/components/ui/card";
import { LibraryBrowser } from "@/components/library/library-browser";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ missing?: string }> }) {
  const user = await requireOnboardedUser();
  const { missing } = await searchParams;
  const saved = listBookmarks(user.id);
  const reads = sourceReadCounts(user.id);
  const overview = computeOverview(listSessions(user.id), user.preferences, todayFor(user), {
    wpm: user.baselineWpm,
    comp: user.baselineComp,
  });
  const items = libraryPassages.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    category: p.category,
    difficulty: p.difficulty,
    words: p.words,
    saved: saved.has(p.slug),
    reads: reads.get(p.slug)?.count ?? 0,
    lastRead: reads.get(p.slug)?.last ?? null,
  }));
  const custom = listCustomTexts(user.id).map((t) => ({
    id: t.id,
    title: t.title,
    words: t.words,
    createdAt: t.createdAt,
    excerpt: t.body.slice(0, 220),
  }));
  return (
    <div>
      <PageHeader
        eyebrow="Reading library"
        title="Library"
        description={`Original articles across six subjects, each with comprehension questions. Reading times are estimated at your current pace of ${overview.comfortWpm} WPM.`}
      />
      {missing ? (
        <div className="mb-6 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[14px] text-ink-2">
          That text couldn&apos;t be found. It may have been deleted. Pick another below.
        </div>
      ) : null}
      <Suspense>
        <LibraryBrowser items={items} custom={custom} comfortWpm={overview.comfortWpm} />
      </Suspense>
    </div>
  );
}
