import { requireOnboardedUser } from "@/lib/auth/session";
import { loadShellData } from "@/lib/services/shell";
import { MobileTabBar, MobileTopBar, Sidebar } from "@/components/shell/sidebar";
import { ReminderWatcher } from "@/components/shell/reminder";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();
  const data = loadShellData(user);
  return (
    <div className="min-h-dvh">
      <Sidebar data={data} />
      <MobileTopBar data={data} />
      <main className="pb-24 lg:pb-12 lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
      </main>
      <MobileTabBar />
      <ReminderWatcher
        enabled={user.preferences.dailyReminder}
        time={user.preferences.reminderTime}
        practicedToday={data.practicedToday}
      />
    </div>
  );
}
