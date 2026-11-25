"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Popover({
  trigger,
  children,
  align = "right",
  side = "bottom",
  className,
  wrapperClassName,
  label,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  side?: "bottom" | "top";
  className?: string;
  wrapperClassName?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className={cn("relative", wrapperClassName)}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute z-50 rounded-2xl border border-line bg-surface shadow-lg animate-scale-in",
            align === "right" ? "right-0" : "left-0",
            side === "bottom" ? "top-full mt-2 origin-top" : "bottom-full mb-2 origin-bottom",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}
