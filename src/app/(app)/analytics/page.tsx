import type { Metadata } from "next";
import { Suspense } from "react";
import { requireOnboardedUser } from "@/lib/auth/session";
import { listSessions } from "@/lib/dal/practice";
import { unlockedAchievements } from "@/lib/dal/gamification";
import { listLessonProgress } from "@/lib/dal/lessons";
import { achievementById } from "@/lib/gamification/achievements";
import { getLesson } from "@/lib/curriculum/lessons";
import { RANGES, computeAnalytics, computeRecords, computeReport, type Range } from "@/lib/stats/analytics";
import { todayFor } from "@/lib/services/rewards";
import { dateKeyInZone } from "@/lib/time";
import { PageHeader } from "@/components/ui/card";
import { AnalyticsShell, RangeNav, TabsNav } from "@/components/analytics/nav";
import { OverviewView } from "@/components/analytics/overview";
import { ReportsView } from "@/components/analytics/reports";
import { HistoryView } from "@/components/analytics/history";

export const metadata: Metadata = { title: "Progress" };

type Search = { tab?: string; range?: string; period?: string; offset?: string };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireOnboardedUser();
  const sp = await searchParams;
  const tab = sp.tab === "reports" || sp.tab === "history" ? sp.tab : "overview";
  const range: Range = (RANGES as readonly string[]).includes(sp.range ?? "") ? (sp.range as Range) : "30d";
  const sessions = listSessions(user.id);
  const today = todayFor(user);
  const tz = user.preferences.timezone;

  let body: React.ReactNode;
  if (tab === "overview") {
    body = <OverviewView a={computeAnalytics(sessions, range, user.preferences, today)} goalMinutes={user.preferences.dailyGoalMinutes} />;
  } else if (tab === "reports") {
    const period = sp.period === "month" ? "month" : "week";
    const offset = Math.max(-520, Math.min(0, Math.trunc(Number(sp.offset) || 0)));
    const achievements = [...unlockedAchievements(user.id).entries()].map(([id, at]) => ({
      title: achievementById.get(id)?.title ?? id,
      date: dateKeyInZone(new Date(at), tz),
    }));
    const lessons = [...listLessonProgress(user.id).values()].map((l) => ({
      title: getLesson(l.lessonId)?.title ?? l.lessonId,
      date: dateKeyInZone(new Date(l.completedAt), tz),
    }));
    body = (
      <ReportsView r={computeReport(sessions, period, offset, today, { achievements, lessons })} records={computeRecords(sessions, today)} />
    );
  } else {
    body = <HistoryView sessions={[...sessions].reverse()} timeZone={tz} />;
  }

  return (
    <Suspense>
      <AnalyticsShell>
        <PageHeader
          eyebrow="Analytics"
          title="Progress"
          description="Every number here comes from your own sessions. Effective rate (speed × comprehension) is the headline, because understanding is the point."
        />
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsNav tab={tab} />
          {tab === "overview" ? <RangeNav range={range} /> : null}
        </div>
        {body}
      </AnalyticsShell>
    </Suspense>
  );
}
