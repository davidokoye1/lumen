"use client";

import { useEffect, useMemo, useState } from "react";
import { buildFrames, splitAtOrp, tokenize } from "@/lib/reading/text";

const TEXT =
  "Speed only counts when understanding comes with it. Lumen trains your attention, your eyes and your habits, then measures what you actually understood.";

export function RsvpDemo() {
  const tokens = useMemo(() => tokenize([TEXT]), []);
  const frames = useMemo(() => buildFrames(tokens, 320, 1, true), [tokens]);
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const f = frames[i];
    const t = setTimeout(() => setI((x) => (x + 1) % (frames.length + 4)), f ? f.ms : 260);
    return () => clearTimeout(t);
  }, [i, frames]);
  const f = frames[i];
  const [l, p, r] = f ? splitAtOrp(f.text) : ["", "", ""];
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-6 shadow-lg sm:p-8">
      <div className="flex items-center justify-between text-[12px] text-ink-3">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent-vivid" /> RSVP reader
        </span>
        <span className="tabular">320 WPM</span>
      </div>
      <div className="relative my-8 sm:my-10">
        <div className="absolute inset-x-0 -top-5 h-px bg-line" />
        <div className="absolute inset-x-0 -bottom-5 h-px bg-line" />
        <div className="absolute -top-5 left-1/2 h-2.5 w-px -translate-x-1/2 bg-ink-3" />
        <div className="absolute -bottom-5 left-1/2 h-2.5 w-px -translate-x-1/2 bg-ink-3" />
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center font-serif text-[40px] whitespace-pre text-ink sm:text-[46px]" aria-hidden>
          <span className="text-right">{l}</span>
          <span className="text-accent-vivid">{p}</span>
          <span>{r}</span>
        </div>
        <p className="sr-only">{TEXT}</p>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full bg-accent-vivid transition-[width] duration-200" style={{ width: `${Math.min(1, i / frames.length) * 100}%` }} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        {[
          { v: "312", l: "Speed" },
          { v: "90%", l: "Understood" },
          { v: "281", l: "Effective" },
        ].map((x) => (
          <div key={x.l} className="rounded-xl bg-bg px-2 py-2.5 ring-1 ring-line">
            <div className="text-[17px] font-semibold text-ink">{x.v}</div>
            <div className="text-[11px] text-ink-3">{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
