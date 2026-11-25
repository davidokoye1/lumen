import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { checkInText, readingPrefsOf } from "@/lib/services/training";
import { OnboardingFlow } from "@/components/onboarding/flow";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboarded) redirect("/dashboard");
  return (
    <OnboardingFlow
      name={user.name.split(" ")[0]}
      initial={{
        purpose: user.preferences.purpose,
        dailyGoalMinutes: user.preferences.dailyGoalMinutes,
        weeklyGoalDays: user.preferences.weeklyGoalDays,
        targetWpm: user.preferences.targetWpm,
      }}
      placement={checkInText(user)}
      prefs={readingPrefsOf(user.preferences)}
    />
  );
}
