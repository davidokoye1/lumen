import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth/session";
import { listSessions } from "@/lib/dal/practice";
import { computeOverview } from "@/lib/stats/core";
import { todayFor } from "@/lib/services/rewards";
import { checkInText, readingPrefsOf } from "@/lib/services/training";
import { TimedReader } from "@/components/training/timed-reader";

export const metadata: Metadata = { title: "Weekly check-in" };

export default async function CheckInPage() {
  const user = await requireOnboardedUser();
  const overview = computeOverview(listSessions(user.id), user.preferences, todayFor(user), {
    wpm: user.baselineWpm,
    comp: user.baselineComp,
  });
  return (
    <TimedReader
      text={checkInText(user)}
      prefs={readingPrefsOf(user.preferences)}
      ctx={{ exitHref: "/dashboard", comfortWpm: overview.comfortWpm }}
      options={{
        exercise: "assessment",
        title: "Weekly check-in",
        intro:
          "A standardized passage, read at your natural pace, then five questions. Check-ins use comparable passages, so this is how Lumen measures your real progress week over week.",
      }}
      againHref="/dashboard"
    />
  );
}
