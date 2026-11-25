"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, BookOpen, Check, Download, KeyRound, Loader2, LogOut, Monitor, Moon, Palette, Shield, Sun, Target, Trash2, User } from "lucide-react";
import {
  changePasswordAction,
  deleteAccountAction,
  setLevelAction,
  signOutOthersAction,
  updatePreferencesAction,
  updateProfileAction,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Segmented, Slider, Switch } from "@/components/ui/controls";
import { Dialog } from "@/components/ui/dialog";
import { ErrorBanner, SuccessBanner } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useTheme, type ThemePref } from "@/components/shell/theme";
import type { Preferences } from "@/lib/preferences";
import { readingFontClass } from "@/lib/preferences";
import type { FormState } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Section = "profile" | "goals" | "reading" | "appearance" | "notifications" | "account";

const sections: { id: Section; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "goals", label: "Goals & level", icon: Target },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account & privacy", icon: Shield },
];

function useAutosave(initial: Preferences) {
  const [prefs, setPrefs] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const pending = useRef<Partial<Preferences>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const update = (patch: Partial<Preferences>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    pending.current = { ...pending.current, ...patch };
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const send = pending.current;
      pending.current = {};
      const res = await updatePreferencesAction(send).catch(() => null);
      setStatus(res?.ok ? "saved" : "error");
      if (res?.ok) router.refresh();
    }, 600);
  };
  return { prefs, update, status };
}

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <span className={cn("flex items-center gap-1.5 text-[12px]", status === "error" ? "text-bad-ink" : "text-ink-3")} aria-live="polite">
      {status === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : status === "saved" ? <Check className="size-3.5 text-good" /> : null}
      {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Couldn't save, try again"}
    </span>
  );
}

function Panel({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-ink-3">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SettingsView({
  user,
  sessionCount,
}: {
  user: { name: string; email: string; level: "foundations" | "fluency" | "mastery"; preferences: Preferences; createdAt: string };
  sessionCount: number;
}) {
  const [section, setSection] = useState<Section>("profile");
  const { prefs, update, status } = useAutosave(user.preferences);
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            aria-current={section === s.id ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-3 text-[14px] font-medium transition-colors",
              section === s.id ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <s.icon className={cn("size-4", section === s.id ? "text-accent-vivid" : "text-ink-3")} />
            {s.label}
          </button>
        ))}
      </nav>
      <div className="min-w-0 space-y-4 animate-fade-in" key={section}>
        {section === "profile" ? <ProfileSection name={user.name} email={user.email} createdAt={user.createdAt} /> : null}
        {section === "goals" ? <GoalsSection prefs={prefs} update={update} status={status} level={user.level} /> : null}
        {section === "reading" ? <ReadingSection prefs={prefs} update={update} status={status} /> : null}
        {section === "appearance" ? <AppearanceSection /> : null}
        {section === "notifications" ? <NotificationsSection prefs={prefs} update={update} status={status} /> : null}
        {section === "account" ? <AccountSection prefs={prefs} update={update} status={status} sessionCount={sessionCount} /> : null}
      </div>
    </div>
  );
}

function ProfileSection({ name, email, createdAt }: { name: string; email: string; createdAt: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <Panel title="Profile" description={`Member since ${new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}>
      <form action={action} className="max-w-md space-y-4" noValidate>
        <SuccessBanner>{state?.success}</SuccessBanner>
        <ErrorBanner>{state?.error}</ErrorBanner>
        <Field label="Name" htmlFor="p-name" error={fe.name}>
          <Input id="p-name" name="name" defaultValue={state?.values?.name ?? name} maxLength={60} aria-invalid={!!fe.name} />
        </Field>
        <Field label="Email" htmlFor="p-email" error={fe.email}>
          <Input id="p-email" name="email" type="email" defaultValue={state?.values?.email ?? email} aria-invalid={!!fe.email} />
        </Field>
        <Button type="submit" loading={pending}>
          Save profile
        </Button>
      </form>
    </Panel>
  );
}

type AutoProps = { prefs: Preferences; update: (p: Partial<Preferences>) => void; status: "idle" | "saving" | "saved" | "error" };

function GoalsSection({ prefs, update, status, level }: AutoProps & { level: "foundations" | "fluency" | "mastery" }) {
  const [lvl, setLvl] = useState(level);
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <>
      <Panel title="Learning goals" description="These shape your daily ring, streaks and weekly challenges." action={<SaveStatus status={status} />}>
        <div className="space-y-6">
          <div>
            <div className="mb-2 text-[13px] font-medium text-ink-2">Daily practice goal</div>
            <Segmented
              value={prefs.dailyGoalMinutes}
              onChange={(v) => update({ dailyGoalMinutes: v })}
              options={[5, 10, 15, 20, 30, 45].map((m) => ({ value: m, label: `${m} min` }))}
            />
          </div>
          <div>
            <div className="mb-2 text-[13px] font-medium text-ink-2">Practice days per week</div>
            <Segmented value={prefs.weeklyGoalDays} onChange={(v) => update({ weeklyGoalDays: v })} options={[2, 3, 4, 5, 6, 7].map((d) => ({ value: d, label: String(d) }))} />
          </div>
          <Slider label="Target reading speed" min={200} max={800} step={10} value={prefs.targetWpm} onChange={(v) => update({ targetWpm: v })} format={(v) => `${v} WPM`} className="max-w-md" />
          <div>
            <div className="mb-2 text-[13px] font-medium text-ink-2">Main purpose</div>
            <Segmented
              value={prefs.purpose}
              onChange={(v) => update({ purpose: v })}
              options={[
                { value: "work", label: "Work" },
                { value: "study", label: "Study" },
                { value: "exam", label: "Exams" },
                { value: "leisure", label: "Leisure" },
              ]}
            />
          </div>
        </div>
      </Panel>
      <Panel title="Program level" description="Your level sets which stage of the program you start from. Earlier stages stay open.">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={lvl}
            onChange={setLvl}
            options={[
              { value: "foundations", label: "Foundations" },
              { value: "fluency", label: "Fluency" },
              { value: "mastery", label: "Mastery" },
            ]}
          />
          <Button
            variant="secondary"
            disabled={lvl === level}
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await setLevelAction(lvl);
                if (res.ok) {
                  toast({ tone: "success", title: "Level updated" });
                  router.refresh();
                } else toast({ tone: "error", title: "Couldn't update level", description: res.error });
              })
            }
          >
            Change level
          </Button>
        </div>
        <p className="mt-3 text-[13px] text-ink-3">
          Not sure? Take a <a href="/check-in" className="font-medium text-ink underline-offset-4 hover:underline">check-in</a>. An effective rate under
          200 suggests Foundations, 200–320 Fluency, and above that Mastery.
        </p>
      </Panel>
    </>
  );
}

function ReadingSection({ prefs, update, status }: AutoProps) {
  return (
    <>
      <Panel title="Text appearance" description="Applies to timed reading, the pacer and drills." action={<SaveStatus status={status} />}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-[13px] font-medium text-ink-2">Typeface</div>
              <Segmented
                value={prefs.readingFont}
                onChange={(v) => update({ readingFont: v })}
                options={[
                  { value: "serif", label: <span className="font-serif">Literata</span> },
                  { value: "sans", label: <span className="font-sans">Inter</span> },
                  { value: "hyper", label: <span className="font-hyper">Hyperlegible</span> },
                ]}
              />
            </div>
            <Slider label="Text size" min={15} max={28} value={prefs.readingSize} onChange={(v) => update({ readingSize: v })} format={(v) => `${v}px`} />
            <Slider label="Line spacing" min={1.4} max={2.2} step={0.05} value={prefs.lineHeight} onChange={(v) => update({ lineHeight: v })} format={(v) => v.toFixed(2)} />
            <Switch checked={prefs.showTimer} onChange={(v) => update({ showTimer: v })} label="Show timer during timed reading" description="Some readers focus better without a visible clock." />
          </div>
          <div className="rounded-2xl border border-line bg-bg p-5">
            <div className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Preview</div>
            <p className={cn("text-ink", readingFontClass[prefs.readingFont])} style={{ fontSize: prefs.readingSize, lineHeight: prefs.lineHeight }}>
              Skilled readers rarely start at the first word and plough on. They survey the text first, so that each detail has somewhere to land.
            </p>
          </div>
        </div>
      </Panel>
      <Panel title="RSVP defaults">
        <div className="grid gap-6 md:grid-cols-2">
          <Slider label="Default speed" min={100} max={1000} step={10} value={prefs.rsvpWpm} onChange={(v) => update({ rsvpWpm: v })} format={(v) => `${v} WPM`} />
          <Slider label="Word size" min={28} max={96} value={prefs.rsvpFontSize} onChange={(v) => update({ rsvpFontSize: v })} format={(v) => `${v}px`} />
          <div>
            <div className="mb-2 text-[13px] font-medium text-ink-2">Words per flash</div>
            <Segmented value={prefs.rsvpChunk} onChange={(v) => update({ rsvpChunk: v })} options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))} />
          </div>
        </div>
        <div className="mt-4 divide-y divide-line border-t border-line">
          <Switch checked={prefs.orpHighlight} onChange={(v) => update({ orpHighlight: v })} label="Highlight the focal letter" description="Marks each word's optimal recognition point." />
          <Switch checked={prefs.punctuationPauses} onChange={(v) => update({ punctuationPauses: v })} label="Pause at punctuation" description="Linger at commas and full stops, while overall speed stays the same." />
          <Switch checked={prefs.easeIn} onChange={(v) => update({ easeIn: v })} label="Ease in" description="Start each session a little slower for the first few seconds." />
        </div>
      </Panel>
      <Panel title="Pacer defaults">
        <div className="grid gap-6 md:grid-cols-2">
          <Slider label="Default speed" min={100} max={1000} step={10} value={prefs.pacerWpm} onChange={(v) => update({ pacerWpm: v })} format={(v) => `${v} WPM`} />
          <div>
            <div className="mb-2 text-[13px] font-medium text-ink-2">Words per phrase</div>
            <Segmented value={prefs.pacerChunk} onChange={(v) => update({ pacerChunk: v })} options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))} />
          </div>
        </div>
      </Panel>
    </>
  );
}

function AppearanceSection() {
  const { pref, setPref } = useTheme();
  const opts: { value: ThemePref; label: string; icon: typeof Sun; swatch: string }[] = [
    { value: "light", label: "Light", icon: Sun, swatch: "bg-[#f9f9f7]" },
    { value: "dark", label: "Dark", icon: Moon, swatch: "bg-[#0c0c0b]" },
    { value: "system", label: "System", icon: Monitor, swatch: "bg-gradient-to-r from-[#f9f9f7] from-50% to-[#0c0c0b] to-50%" },
  ];
  return (
    <Panel title="Theme" description="Dark mode is tuned for long, low-light reading sessions.">
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
        {opts.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={pref === o.value}
            onClick={() => setPref(o.value)}
            className={cn(
              "overflow-hidden rounded-2xl border text-left transition-[border-color,box-shadow]",
              pref === o.value ? "border-accent-vivid shadow-[0_0_0_3px_var(--ring)]" : "border-line-strong hover:border-ink-3",
            )}
          >
            <div className={cn("flex h-20 items-end gap-1.5 p-3", o.swatch)}>
              <span className="h-2 w-10 rounded-full bg-[#eb6834]" />
              <span className="h-2 w-6 rounded-full bg-[#85837c]/60" />
            </div>
            <div className="flex items-center gap-2 border-t border-line bg-surface px-3 py-2.5 text-[14px] font-medium text-ink">
              <o.icon className="size-4 text-ink-3" />
              {o.label}
              {pref === o.value ? <Check className="ml-auto size-4 text-accent-vivid" /> : null}
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function NotificationsSection({ prefs, update, status }: AutoProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);
  return (
    <>
      <Panel title="In-app notifications" description="Shown in the bell menu." action={<SaveStatus status={status} />}>
        <div className="divide-y divide-line">
          <Switch checked={prefs.notifyAchievements} onChange={(v) => update({ notifyAchievements: v })} label="Badges, level-ups and challenges" />
          <Switch checked={prefs.notifyStreak} onChange={(v) => update({ notifyStreak: v })} label="Streak reminders" description="An evening nudge when your streak is at risk." />
          <Switch checked={prefs.notifyWeeklyReport} onChange={(v) => update({ notifyWeeklyReport: v })} label="Weekly report" description="A summary of last week, every Monday." />
          <Switch checked={prefs.notifyProgram} onChange={(v) => update({ notifyProgram: v })} label="Program milestones" description="When you complete a stage of the program." />
        </div>
      </Panel>
      <Panel title="Daily reminder" description="A browser notification at your chosen time, if you haven't practiced yet.">
        <Switch
          checked={prefs.dailyReminder}
          onChange={async (v) => {
            if (v && permission === "default") {
              const p = await Notification.requestPermission();
              setPermission(p);
              if (p !== "granted") return;
            }
            update({ dailyReminder: v });
          }}
          disabled={permission === "unsupported" || permission === "denied"}
          label="Remind me to read"
          description={
            permission === "denied"
              ? "Notifications are blocked for this site. Allow them in your browser settings."
              : permission === "unsupported"
                ? "This browser doesn't support notifications."
                : "Works while Lumen is open in a browser tab."
          }
        />
        {prefs.dailyReminder ? (
          <div className="mt-2 flex items-center gap-3">
            <label htmlFor="rem-time" className="text-[13px] font-medium text-ink-2">
              Time
            </label>
            <Input
              id="rem-time"
              type="time"
              value={prefs.reminderTime}
              onChange={(e) => /^\d{2}:\d{2}$/.test(e.target.value) && update({ reminderTime: e.target.value })}
              className="h-10 w-36"
            />
          </div>
        ) : null}
      </Panel>
    </>
  );
}

function AccountSection({ prefs, update, status, sessionCount }: AutoProps & { sessionCount: number }) {
  const [pwState, pwAction, pwPending] = useActionState<FormState, FormData>(changePasswordAction, null);
  const [delState, delAction, delPending] = useActionState<FormState, FormData>(deleteAccountAction, null);
  const [delOpen, setDelOpen] = useState(false);
  const [othersPending, startOthers] = useTransition();
  const { toast } = useToast();
  const pe = pwState?.fieldErrors ?? {};
  const de = delState?.fieldErrors ?? {};
  return (
    <>
      <Panel title="Privacy" action={<SaveStatus status={status} />}>
        <Switch
          checked={prefs.leaderboardOptIn}
          onChange={(v) => update({ leaderboardOptIn: v })}
          label="Appear on the weekly leaderboard"
          description="Shows your first name, last initial and weekly XP to other members who have joined."
        />
      </Panel>
      <Panel title="Password" description="After changing it, other devices are signed out.">
        <form action={pwAction} className="max-w-md space-y-4" noValidate>
          <SuccessBanner>{pwState?.success}</SuccessBanner>
          <ErrorBanner>{pwState?.error}</ErrorBanner>
          <Field label="Current password" htmlFor="pw-cur" error={pe.current}>
            <Input id="pw-cur" name="current" type="password" autoComplete="current-password" aria-invalid={!!pe.current} />
          </Field>
          <Field label="New password" htmlFor="pw-next" error={pe.next} hint="At least 8 characters with a letter and a number.">
            <Input id="pw-next" name="next" type="password" autoComplete="new-password" aria-invalid={!!pe.next} />
          </Field>
          <Field label="Confirm new password" htmlFor="pw-confirm" error={pe.confirm}>
            <Input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" aria-invalid={!!pe.confirm} />
          </Field>
          <Button type="submit" loading={pwPending} icon={<KeyRound className="size-4" />}>
            Update password
          </Button>
        </form>
      </Panel>
      <Panel title="Sessions & data">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[14px] font-medium text-ink">Sign out other devices</div>
            <div className="text-[13px] text-ink-3">Keeps this browser signed in.</div>
          </div>
          <Button
            variant="secondary"
            loading={othersPending}
            icon={<LogOut className="size-4" />}
            onClick={() =>
              startOthers(async () => {
                const res = await signOutOthersAction();
                if (res.ok) toast({ tone: "success", title: res.data.count ? `Signed out ${res.data.count} other session${res.data.count === 1 ? "" : "s"}` : "No other sessions were active" });
                else toast({ tone: "error", title: "Couldn't sign out other sessions", description: res.error });
              })
            }
          >
            Sign out others
          </Button>
        </div>
        <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[14px] font-medium text-ink">Export your data</div>
            <div className="text-[13px] text-ink-3">Your profile, settings, {sessionCount} sessions, lessons and texts as JSON.</div>
          </div>
          <a href="/api/account/export" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-sm hover:bg-surface-2">
            <Download className="size-4" /> Download
          </a>
        </div>
      </Panel>
      <section className="rounded-2xl border border-bad/25 bg-bad-soft/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Delete account</h2>
            <p className="mt-0.5 text-[13px] text-ink-2">Permanently deletes your account and all reading history. This can&apos;t be undone.</p>
          </div>
          <Button variant="danger" onClick={() => setDelOpen(true)} icon={<Trash2 className="size-4" />}>
            Delete account
          </Button>
        </div>
      </section>
      <Dialog open={delOpen} onClose={() => setDelOpen(false)} title="Delete your account?" description="All sessions, progress, badges and texts will be erased." size="sm">
        <form action={delAction} className="space-y-4" noValidate>
          <ErrorBanner>{delState?.error}</ErrorBanner>
          <Field label="Your password" htmlFor="del-pw" error={de.password}>
            <Input id="del-pw" name="password" type="password" autoComplete="current-password" aria-invalid={!!de.password} />
          </Field>
          <Field label='Type "DELETE" to confirm' htmlFor="del-confirm" error={de.confirm}>
            <Input id="del-confirm" name="confirm" autoComplete="off" aria-invalid={!!de.confirm} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDelOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={delPending}>
              Delete forever
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
