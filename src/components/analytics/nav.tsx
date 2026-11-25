"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Segmented } from "@/components/ui/controls";
import { cn } from "@/lib/utils";

const PendingContext = createContext<{ pending: boolean; go: (patch: Record<string, string | null>) => void }>({
  pending: false,
  go: () => {},
});

/** URL-driven filters. While new data loads, the previous render stays visible, dimmed. */
export function AnalyticsShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const go = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null) next.delete(k);
      else next.set(k, v);
    }
    start(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  return (
    <PendingContext.Provider value={{ pending, go }}>
      <div className={cn("transition-opacity duration-200", pending && "opacity-60")} aria-busy={pending}>
        {children}
      </div>
    </PendingContext.Provider>
  );
}

export function useAnalyticsNav() {
  return useContext(PendingContext);
}

export function TabsNav({ tab }: { tab: string }) {
  const { go } = useAnalyticsNav();
  return (
    <Segmented
      value={tab}
      onChange={(t) => go({ tab: t === "overview" ? null : t, period: null, offset: null })}
      label="Analytics sections"
      options={[
        { value: "overview", label: "Overview" },
        { value: "reports", label: "Reports" },
        { value: "history", label: "History" },
      ]}
    />
  );
}

export function RangeNav({ range }: { range: string }) {
  const { go } = useAnalyticsNav();
  return (
    <Segmented
      size="sm"
      value={range}
      onChange={(r) => go({ range: r === "30d" ? null : r })}
      label="Date range"
      options={[
        { value: "30d", label: "30 days" },
        { value: "90d", label: "90 days" },
        { value: "12m", label: "12 months" },
        { value: "all", label: "All time" },
      ]}
    />
  );
}

export function PeriodNav({
  period,
  offset,
  label,
  canBack,
  canForward,
}: {
  period: "week" | "month";
  offset: number;
  label: string;
  canBack: boolean;
  canForward: boolean;
}) {
  const { go } = useAnalyticsNav();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented
        size="sm"
        value={period}
        onChange={(p) => go({ period: p === "week" ? null : p, offset: null })}
        label="Report period"
        options={[
          { value: "week", label: "Weekly" },
          { value: "month", label: "Monthly" },
        ]}
      />
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!canBack}
          onClick={() => go({ offset: String(offset - 1) })}
          className="flex size-8 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 disabled:opacity-30"
          aria-label={`Previous ${period}`}
        >
          ‹
        </button>
        <span className="tabular min-w-[11rem] text-center text-[14px] font-semibold text-ink">{label}</span>
        <button
          type="button"
          disabled={!canForward}
          onClick={() => go({ offset: offset + 1 === 0 ? null : String(offset + 1) })}
          className="flex size-8 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 disabled:opacity-30"
          aria-label={`Next ${period}`}
        >
          ›
        </button>
      </div>
    </div>
  );
}
