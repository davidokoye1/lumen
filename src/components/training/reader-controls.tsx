"use client";

import { useState, type ReactNode } from "react";
import { ChevronsLeft, ChevronsRight, Keyboard, Minus, Pause, Play, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import { Kbd } from "@/components/ui/misc";
import { Segmented, Slider, Switch } from "@/components/ui/controls";
import type { Preferences } from "@/lib/preferences";

export const SPEED_PRESETS = [
  { label: "Beginner", wpm: 200 },
  { label: "Intermediate", wpm: 300 },
  { label: "Advanced", wpm: 450 },
  { label: "Expert", wpm: 650 },
];

function IconButton({
  onClick,
  label,
  children,
  disabled,
  className,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-10 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TransportBar({
  playing,
  onToggle,
  onRestart,
  onBack,
  onForward,
  wpm,
  onSpeed,
  lockSpeed,
  remainingMs,
  progress,
  onSettings,
  settingsOpen,
  onShortcuts,
}: {
  playing: boolean;
  onToggle: () => void;
  onRestart: () => void;
  onBack: () => void;
  onForward: () => void;
  wpm: number;
  onSpeed: (delta: number) => void;
  lockSpeed?: boolean;
  remainingMs: number;
  progress: number;
  onSettings: () => void;
  settingsOpen: boolean;
  onShortcuts: () => void;
}) {
  return (
    <div className="w-full">
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden>
        <div className="h-full rounded-full bg-accent-vivid transition-[width] duration-150 ease-linear" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          <IconButton onClick={onRestart} label="Restart (R)">
            <RotateCcw className="size-[18px]" />
          </IconButton>
          <IconButton onClick={onBack} label="Previous sentence (Shift+←)">
            <ChevronsLeft className="size-5" />
          </IconButton>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? "Pause (Space)" : "Play (Space)"}
          className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="ml-0.5 size-6" fill="currentColor" />}
        </button>
        <div className="flex items-center gap-0.5">
          <IconButton onClick={onForward} label="Next sentence (Shift+→)">
            <ChevronsRight className="size-5" />
          </IconButton>
          <IconButton onClick={onSettings} label="Reading settings" className={settingsOpen ? "bg-surface-2 text-ink" : undefined}>
            <SlidersHorizontal className="size-[18px]" />
          </IconButton>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px] text-ink-3">
        <div className="flex items-center gap-1">
          {lockSpeed ? (
            <span className="tabular rounded-lg bg-surface-2 px-2 py-1 font-medium text-ink-2">{wpm} WPM · session speed</span>
          ) : (
            <div className="flex items-center rounded-lg bg-surface-2">
              <button type="button" className="flex size-7 items-center justify-center hover:text-ink" onClick={() => onSpeed(-20)} aria-label="Slower (↓)">
                <Minus className="size-3.5" />
              </button>
              <span className="tabular min-w-[4.5rem] text-center font-semibold text-ink">{wpm} WPM</span>
              <button type="button" className="flex size-7 items-center justify-center hover:text-ink" onClick={() => onSpeed(20)} aria-label="Faster (↑)">
                <Plus className="size-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="tabular">{formatClock(remainingMs)} left</span>
          <button type="button" onClick={onShortcuts} className="hidden items-center gap-1 hover:text-ink sm:flex" aria-label="Keyboard shortcuts">
            <Keyboard className="size-3.5" /> Shortcuts
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShortcutList({ lockSpeed }: { lockSpeed?: boolean }) {
  const rows: [ReactNode, string][] = [
    [<Kbd key="s">Space</Kbd>, "Play / pause"],
    [<><Kbd>←</Kbd> <Kbd>→</Kbd></>, "Previous / next word"],
    [<><Kbd>⇧</Kbd>+<Kbd>←</Kbd> <Kbd>→</Kbd></>, "Previous / next sentence"],
    ...(lockSpeed ? [] : ([[<><Kbd>↑</Kbd> <Kbd>↓</Kbd></>, "Faster / slower (20 WPM)"]] as [ReactNode, string][])),
    [<Kbd key="r">R</Kbd>, "Restart"],
    [<Kbd key="esc">Esc</Kbd>, "Pause"],
  ];
  return (
    <ul className="grid gap-2 text-[13px] text-ink-2 sm:grid-cols-2">
      {rows.map(([k, label], i) => (
        <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2">
          <span>{label}</span>
          <span className="flex items-center gap-1">{k}</span>
        </li>
      ))}
    </ul>
  );
}

export type ReaderSettingsValue = {
  wpm: number;
  chunk: number;
  fontSize: number;
  font: Preferences["readingFont"];
  orp?: boolean;
  pauses: boolean;
  easeIn: boolean;
  lineHeight?: number;
};

export function ReaderSettings({
  value,
  onChange,
  mode,
  lockSpeed,
}: {
  value: ReaderSettingsValue;
  onChange: (v: Partial<ReaderSettingsValue>) => void;
  mode: "rsvp" | "pacer";
  lockSpeed?: boolean;
}) {
  const [tab, setTab] = useState<"speed" | "look">(lockSpeed ? "look" : "speed");
  return (
    <div className="w-full rounded-2xl border border-line bg-surface p-5 shadow-md animate-scale-in">
      {!lockSpeed ? (
        <Segmented
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { value: "speed", label: "Speed" },
            { value: "look", label: "Appearance" },
          ]}
          className="mb-5"
        />
      ) : null}
      {tab === "speed" && !lockSpeed ? (
        <div className="space-y-5">
          <Slider label="Reading speed" min={100} max={1000} step={10} value={value.wpm} onChange={(wpm) => onChange({ wpm })} format={(v) => `${v} WPM`} />
          <div className="flex flex-wrap gap-1.5">
            {SPEED_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange({ wpm: p.wpm })}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors",
                  value.wpm === p.wpm ? "border-accent-vivid bg-accent-soft text-accent-ink" : "border-line-strong text-ink-2 hover:text-ink",
                )}
              >
                {p.label} · {p.wpm}
              </button>
            ))}
          </div>
          <div>
            <div className="mb-2 text-[13px] font-medium text-ink-2">Words per {mode === "rsvp" ? "flash" : "phrase"}</div>
            <Segmented
              value={value.chunk}
              onChange={(chunk) => onChange({ chunk })}
              options={(mode === "rsvp" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]).map((n) => ({ value: n, label: String(n) }))}
            />
          </div>
          <Switch
            checked={value.pauses}
            onChange={(pauses) => onChange({ pauses })}
            label="Pause at punctuation"
            description="Linger at commas and full stops. Overall speed stays the same."
          />
          <Switch
            checked={value.easeIn}
            onChange={(easeIn) => onChange({ easeIn })}
            label="Ease in"
            description="Start a little slower for the first few seconds."
          />
        </div>
      ) : (
        <div className="space-y-5">
          <Slider
            label="Text size"
            min={mode === "rsvp" ? 28 : 15}
            max={mode === "rsvp" ? 96 : 28}
            value={value.fontSize}
            onChange={(fontSize) => onChange({ fontSize })}
            format={(v) => `${v}px`}
          />
          {mode === "pacer" && value.lineHeight != null ? (
            <Slider
              label="Line spacing"
              min={1.4}
              max={2.2}
              step={0.05}
              value={value.lineHeight}
              onChange={(lineHeight) => onChange({ lineHeight })}
              format={(v) => v.toFixed(2)}
            />
          ) : null}
          <div>
            <div className="mb-2 text-[13px] font-medium text-ink-2">Typeface</div>
            <Segmented
              value={value.font}
              onChange={(font) => onChange({ font })}
              options={[
                { value: "serif", label: <span className="font-serif">Serif</span> },
                { value: "sans", label: <span className="font-sans">Sans</span> },
                { value: "hyper", label: <span className="font-hyper">Legible</span>, title: "Atkinson Hyperlegible" },
              ]}
            />
          </div>
          {mode === "rsvp" && value.orp != null ? (
            <Switch
              checked={value.orp}
              onChange={(orp) => onChange({ orp })}
              label="Highlight focal letter"
              description="Marks the optimal recognition point, so your eyes stay still."
            />
          ) : null}
          {lockSpeed ? (
            <Switch checked={value.pauses} onChange={(pauses) => onChange({ pauses })} label="Pause at punctuation" />
          ) : null}
        </div>
      )}
    </div>
  );
}
