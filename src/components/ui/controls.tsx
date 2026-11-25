"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
  size = "md",
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; title?: string }[];
  className?: string;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-xl bg-surface-2 p-1 ring-1 ring-line ring-inset", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex-1 rounded-lg font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150",
              size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[13px]",
              active ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-ink-3 hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[14px] font-medium text-ink">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-[13px] leading-relaxed text-ink-3">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-accent" : "bg-surface-3 ring-1 ring-line-strong ring-inset",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out-expo",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  format,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  format?: (v: number) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
          {label}
        </label>
        <span className="tabular text-[13px] font-semibold text-ink">{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lumen-range w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}

export function ChoiceCard({
  selected,
  onClick,
  title,
  description,
  icon,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150",
        selected
          ? "border-accent-vivid bg-accent-soft shadow-[0_0_0_3px_var(--ring)]"
          : "border-line-strong bg-surface hover:border-ink-3 hover:bg-surface-2",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl [&>svg]:size-[18px]",
            selected ? "bg-accent text-accent-fg" : "bg-surface-2 text-ink-2",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-ink">{title}</span>
        {description ? <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-3">{description}</span> : null}
      </span>
    </button>
  );
}
