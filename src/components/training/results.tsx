"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Award, CalendarCheck, Medal, Sparkles, TriangleAlert, Zap } from "lucide-react";
import type { Rewards } from "@/lib/services/rewards";
import { achievementIcons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { levelTitle } from "@/lib/gamification/levels";
import { Celebration } from "./celebrate";

export function useCountUp(target: number, duration = 900, decimals = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const f = 10 ** decimals;
      setV(Math.round(target * (1 - Math.pow(1 - p, 3)) * f) / f);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals]);
  return v;
}

export function BigStat({
  label,
  value,
  suffix,
  hint,
  emphasis,
  decimals = 0,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  hint?: ReactNode;
  emphasis?: boolean;
  decimals?: number;
}) {
  const n = useCountUp(value ?? 0, 900, decimals);
  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", emphasis ? "border-accent-vivid/40 bg-accent-soft" : "border-line bg-surface")}>
      <div className="text-[12px] font-medium text-ink-3">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-[30px] leading-none font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
          {value == null ? "—" : n.toFixed(decimals)}
        </span>
        {value != null && suffix ? <span className="text-[14px] font-medium text-ink-3">{suffix}</span> : null}
      </div>
      {hint ? <div className="mt-1.5 text-[12px] text-ink-3">{hint}</div> : null}
    </div>
  );
}

export function RewardsPanel({ rewards }: { rewards: Rewards }) {
  const xp = useCountUp(rewards.xpGained, 1100);
  const leveled = rewards.level.after > rewards.level.before;
  const [w, setW] = useState(leveled ? 0 : Math.max(0, rewards.level.progress - rewards.xpGained / rewards.level.needed));
  useEffect(() => {
    const t = setTimeout(() => setW(rewards.level.progress), 150);
    return () => clearTimeout(t);
  }, [rewards.level.progress]);
  const celebrate = leveled || rewards.achievements.length > 0;
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {celebrate ? <Celebration /> : null}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
            <Zap className="size-[18px]" />
          </span>
          <div>
            <div className="text-[20px] leading-none font-semibold text-ink">+{xp} XP</div>
            <div className="mt-1 text-[12px] text-ink-3">
              {rewards.breakdown.map((b) => `${b.label} +${b.amount}`).join(" · ")}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-ink-3">Level {rewards.level.after}</div>
          <div className="text-[13px] font-semibold text-ink">{rewards.level.title}</div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-accent-vivid transition-[width] duration-1000 ease-out-expo" style={{ width: `${w * 100}%` }} />
      </div>
      <div className="tabular mt-1.5 text-right text-[11px] text-ink-3">
        {rewards.level.intoLevel} / {rewards.level.needed} XP to level {rewards.level.after + 1}
      </div>

      {leveled || rewards.dailyGoalJustMet || rewards.achievements.length || rewards.challenges.length ? (
        <ul className="mt-4 space-y-2 border-t border-line pt-4">
          {leveled ? (
            <RewardRow
              icon={<Sparkles className="size-4" />}
              title={`Level ${rewards.level.after}!`}
              body={
                levelTitle(rewards.level.before) !== rewards.level.title
                  ? `New title: ${rewards.level.title}.`
                  : "Steady practice is paying off."
              }
            />
          ) : null}
          {rewards.dailyGoalJustMet ? (
            <RewardRow
              icon={<CalendarCheck className="size-4" />}
              title="Daily goal reached"
              body={rewards.streak > 1 ? `${rewards.streak}-day streak. Keep it going.` : "See you tomorrow."}
            />
          ) : null}
          {rewards.achievements.map((a) => {
            const Icon = achievementIcons[a.icon] ?? Award;
            return <RewardRow key={a.id} icon={<Icon className="size-4" />} title={`Badge: ${a.title}`} body={a.description} />;
          })}
          {rewards.challenges.map((c) => (
            <RewardRow key={c.title} icon={<Medal className="size-4" />} title="Weekly challenge complete" body={c.title} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function RewardRow({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3 animate-rise">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg">{icon}</span>
      <div>
        <div className="text-[14px] font-semibold text-ink">{title}</div>
        <div className="text-[13px] text-ink-3">{body}</div>
      </div>
    </li>
  );
}

export function Notice({ tone = "neutral", children }: { tone?: "neutral" | "warn" | "good"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[13px] leading-relaxed",
        tone === "warn" ? "bg-warn-soft text-warn-ink" : tone === "good" ? "bg-good-soft text-good-ink" : "bg-surface-2 text-ink-2",
      )}
    >
      {tone === "warn" ? <TriangleAlert className="mt-0.5 size-4 shrink-0" /> : null}
      <div>{children}</div>
    </div>
  );
}
