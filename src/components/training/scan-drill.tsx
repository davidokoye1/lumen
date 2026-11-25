"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScanSearch } from "lucide-react";
import { submitDrillAction, type DrillResult } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { ErrorBanner } from "@/components/ui/misc";
import { tokenize } from "@/lib/reading/text";
import { readingFontClass } from "@/lib/preferences";
import { cn, shuffle } from "@/lib/utils";
import { FocusFrame, IntroCard } from "./focus-frame";
import { DrillResults } from "./drill-results";
import type { PlayerContext, ReadingPrefs, ReadingText } from "./types";

const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export function ScanDrill({
  ctx,
  text: textProp,
  prefs,
  targets: initialTargets = 6,
}: {
  ctx: PlayerContext;
  text: ReadingText;
  prefs: ReadingPrefs;
  targets?: number;
}) {
  const [text] = useState(textProp);
  const [count, setCount] = useState(initialTargets);
  const tokens = useMemo(() => tokenize(text.paragraphs), [text.paragraphs]);
  const byParagraph = useMemo(() => {
    const out: (typeof tokens)[] = [];
    for (const t of tokens) (out[t.paragraph] ??= []).push(t);
    return out;
  }, [tokens]);
  const candidates = useMemo(() => {
    const freq = new Map<string, number>();
    for (const t of tokens) freq.set(clean(t.text), (freq.get(clean(t.text)) ?? 0) + 1);
    return tokens.filter((t) => {
      const c = clean(t.text);
      return c.length >= 5 && freq.get(c) === 1 && !/^\d+$/.test(c);
    });
  }, [tokens]);

  const [phase, setPhase] = useState<"intro" | "run" | "results">("intro");
  const [order, setOrder] = useState<number[]>([]);
  const [k, setK] = useState(0);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState<{ i: number; ok: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrillResult | null>(null);
  const [now, setNow] = useState(0);
  const st = useRef({ start: 0, targetStart: 0, misses: 0, times: [] as number[], skipped: 0 });

  const begin = () => {
    const picks = shuffle(candidates).slice(0, Math.min(count, candidates.length)).map((t) => t.index);
    setOrder(picks);
    setK(0);
    setFound(new Set());
    st.current = { start: performance.now(), targetStart: performance.now(), misses: 0, times: [], skipped: 0 };
    setResult(null);
    setPhase("run");
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (phase !== "run") return;
    const id = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(id);
  }, [phase]);

  const finish = useCallback(async () => {
    const s = st.current;
    const foundN = s.times.length;
    const avg = foundN ? s.times.reduce((a, b) => a + b, 0) / foundN / 1000 : 30;
    const res = await submitDrillAction({
      exercise: "scan",
      durationMs: Math.max(1000, Math.round(performance.now() - s.start)),
      trials: foundN + s.misses + s.skipped,
      correct: foundN,
      score: Math.round(avg * 10) / 10,
      difficulty: text.difficulty ?? 2,
      sourceSlug: text.source.type === "passage" ? text.source.slug : undefined,
      meta: { targets: order.length, misses: s.misses, skipped: s.skipped },
      lessonId: ctx.lessonId,
    }).catch(() => null);
    if (!res) setError("Network error. Your result wasn't saved.");
    else if (!res.ok) setError(res.error);
    else {
      setResult(res.data);
      setPhase("results");
      window.scrollTo({ top: 0 });
    }
  }, [order.length, text, ctx.lessonId]);

  const advance = useCallback(() => {
    if (k + 1 >= order.length) void finish();
    else {
      setK(k + 1);
      st.current.targetStart = performance.now();
    }
  }, [k, order.length, finish]);

  const click = (i: number) => {
    if (phase !== "run" || k >= order.length) return;
    const target = order[k];
    if (clean(tokens[i].text) === clean(tokens[target].text)) {
      st.current.times.push(performance.now() - st.current.targetStart);
      setFound((f) => new Set(f).add(i));
      setFlash({ i, ok: true });
      setTimeout(() => setFlash(null), 500);
      advance();
    } else {
      st.current.misses++;
      setFlash({ i, ok: false });
      setTimeout(() => setFlash(null), 400);
    }
  };

  const skip = () => {
    st.current.skipped++;
    advance();
  };

  const fontCls = readingFontClass[prefs.readingFont];

  if (phase === "results" && result) {
    const s = st.current;
    const foundN = s.times.length;
    const avg = foundN ? s.times.reduce((a, b) => a + b, 0) / foundN / 1000 : null;
    const acc = foundN / Math.max(1, foundN + s.misses + s.skipped);
    return (
      <FocusFrame title="Scan hunt" subtitle={text.title} exitHref={ctx.exitHref}>
        <DrillResults
          title={acc >= 0.85 ? "Sharp eyes" : "Scan complete"}
          stats={[
            { label: "Avg per target", value: avg != null ? Math.round(avg * 10) / 10 : null, decimals: 1, suffix: "s", emphasis: true, hint: "Lower is better" },
            { label: "Accuracy", value: Math.round(acc * 100), suffix: "%", hint: `${s.misses} wrong tap${s.misses === 1 ? "" : "s"}` },
            { label: "Found", value: foundN, suffix: `/ ${order.length}`, hint: s.skipped ? `${s.skipped} skipped` : "No skips" },
          ]}
          note={{
            tone: "neutral",
            text: "Scanning is search, not reading. Hold the word's shape in mind and sweep in a zigzag, using its length and first letter as anchors.",
          }}
          rewards={result.rewards}
          ctx={ctx}
          outcome={{ exercise: "scan", accuracy: acc, score: avg, rewards: result.rewards }}
          onAgain={begin}
        />
      </FocusFrame>
    );
  }

  if (phase === "intro") {
    return (
      <FocusFrame title="Scan hunt" subtitle={text.title} exitHref={ctx.exitHref}>
        <IntroCard
          icon={<ScanSearch />}
          eyebrow="Strategic reading"
          title="Find it without reading it"
          description="A target word appears at the top. Find it in the passage and tap it, as fast as you can. Don't read the text, just search for the word's shape."
          facts={[
            { label: "Targets", value: Math.min(count, candidates.length) },
            { label: "Passage", value: `${text.words} words` },
            { label: "Skip after", value: "20s" },
          ]}
          actions={
            <Button size="lg" onClick={begin} disabled={candidates.length < 3}>
              Start
            </Button>
          }
        >
          {!ctx.lessonId ? (
            <div>
              <div className="mb-2 text-[13px] font-medium text-ink-2">Targets</div>
              <Segmented value={count} onChange={setCount} options={[4, 6, 8, 10].map((n) => ({ value: n, label: String(n) }))} />
            </div>
          ) : null}
        </IntroCard>
      </FocusFrame>
    );
  }

  const target = order[k] != null ? tokens[order[k]] : null;
  const waited = (now - st.current.targetStart) / 1000;
  return (
    <FocusFrame
      title="Scan hunt"
      subtitle={`Target ${Math.min(k + 1, order.length)} of ${order.length}`}
      exitHref={ctx.exitHref}
      progress={k / Math.max(1, order.length)}
      right={
        waited > 20 ? (
          <Button size="sm" variant="ghost" onClick={skip}>
            Skip
          </Button>
        ) : null
      }
    >
      <div className="sticky top-[57px] z-10 -mx-4 mb-6 border-b border-line bg-bg/90 px-4 py-4 text-center backdrop-blur sm:-mx-6">
        <div className="text-[12px] font-medium text-ink-3">Find</div>
        <div key={k} className="mt-0.5 text-[28px] font-semibold tracking-[-0.02em] text-accent-ink animate-pop">
          {target ? clean(target.text) : "…"}
        </div>
      </div>
      <article className={cn("prose-reading mx-auto w-full max-w-[68ch] text-ink select-none", fontCls)} style={{ fontSize: prefs.readingSize, lineHeight: prefs.lineHeight }}>
        {byParagraph.map((para, pi) => (
          <p key={pi}>
            {para.map((t) => (
              <span
                key={t.index}
                onClick={() => click(t.index)}
                className={cn(
                  "cursor-pointer rounded-[4px] transition-colors duration-200 hover:bg-surface-2",
                  found.has(t.index) && "bg-good-soft text-good-ink",
                  flash?.i === t.index && (flash.ok ? "bg-good-soft" : "bg-bad-soft animate-shake"),
                )}
              >
                {t.text}{" "}
              </span>
            ))}
          </p>
        ))}
      </article>
      <ErrorBanner className="mx-auto mt-6 w-full max-w-[68ch]">{error}</ErrorBanner>
    </FocusFrame>
  );
}
