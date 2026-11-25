"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { SessionLite } from "@/components/sessions/session-row";
import { sessionKindLabel, type SessionKind } from "@/lib/exercises";
import { formatDuration } from "@/lib/format";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { BookOpen } from "lucide-react";

const PAGE = 25;

export function HistoryView({ sessions, timeZone }: { sessions: SessionLite[]; timeZone: string }) {
  const [kind, setKind] = useState<SessionKind | "all">("all");
  const [page, setPage] = useState(0);
  const list = useMemo(() => (kind === "all" ? sessions : sessions.filter((s) => s.exercise === kind)), [sessions, kind]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const rows = list.slice(page * PAGE, page * PAGE + PAGE);
  const kinds = Array.from(new Set(sessions.map((s) => s.exercise)));
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone });

  function exportCsv() {
    const header = ["date", "exercise", "title", "words", "duration_seconds", "wpm", "comprehension", "accuracy", "score", "xp", "flagged"];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(",")].concat(
      list.map((s) =>
        [s.createdAt, s.exercise, s.title, s.words, Math.round(s.durationMs / 1000), s.wpm, s.comprehension, s.accuracy, s.score, s.xp, s.flagged]
          .map(esc)
          .join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumen-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!sessions.length)
    return (
      <div className="card">
        <EmptyState icon={<BookOpen />} title="No sessions yet" description="Every reading and drill you complete is logged here." className="py-20" />
      </div>
    );

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <Select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as SessionKind | "all");
              setPage(0);
            }}
            className="h-9 w-48 text-[13px]"
            aria-label="Filter by exercise"
          >
            <option value="all">All exercises</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {sessionKindLabel[k]}
              </option>
            ))}
          </Select>
          <span className="text-[13px] text-ink-3">{list.length} sessions</span>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv} icon={<Download className="size-3.5" />}>
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[12px] text-ink-3">
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Exercise</th>
              <th className="px-3 py-2.5 font-medium">Text</th>
              <th className="px-3 py-2.5 text-right font-medium">Words</th>
              <th className="px-3 py-2.5 text-right font-medium">Time</th>
              <th className="px-3 py-2.5 text-right font-medium">WPM</th>
              <th className="px-3 py-2.5 text-right font-medium">Understood</th>
              <th className="px-3 py-2.5 text-right font-medium">Accuracy</th>
              <th className="px-5 py-2.5 text-right font-medium">XP</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0 hover:bg-surface-2/50">
                <td className="px-5 py-2.5 whitespace-nowrap text-ink-3">{fmtDate(s.createdAt)}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-ink-2">
                  {sessionKindLabel[s.exercise]}
                  {s.flagged ? <span className="ml-1.5 rounded bg-warn-soft px-1 text-[11px] text-warn-ink">flagged</span> : null}
                  {s.meta.skim ? <span className="ml-1.5 rounded bg-surface-2 px-1 text-[11px] text-ink-3">skim</span> : null}
                </td>
                <td className="max-w-[16rem] truncate px-3 py-2.5 text-ink">{s.title}</td>
                <td className="px-3 py-2.5 text-right text-ink-2">{s.words ? s.words.toLocaleString("en-US") : "—"}</td>
                <td className="px-3 py-2.5 text-right text-ink-2">{formatDuration(s.durationMs)}</td>
                <td className="px-3 py-2.5 text-right text-ink">{s.wpm ?? "—"}</td>
                <td className="px-3 py-2.5 text-right text-ink">{s.comprehension != null ? `${Math.round(s.comprehension * 100)}%` : "—"}</td>
                <td className="px-3 py-2.5 text-right text-ink">{s.accuracy != null ? `${Math.round(s.accuracy * 100)}%` : "—"}</td>
                <td className="px-5 py-2.5 text-right text-accent-ink">+{s.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 ? (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13px] text-ink-3">
          <span>
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
