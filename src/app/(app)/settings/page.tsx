import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth/session";
import { listSessions } from "@/lib/dal/practice";
import { PageHeader } from "@/components/ui/card";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  return (
    <div>
      <PageHeader title="Settings" description="Your account, goals and reading preferences." />
      <SettingsView
        user={{ name: user.name, email: user.email, level: user.level, preferences: user.preferences, createdAt: user.createdAt }}
        sessionCount={listSessions(user.id).length}
      />
    </div>
  );
}
