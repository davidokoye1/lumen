"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible modal built on the native <dialog> element (focus trap + Esc for free). */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-lg open:animate-scale-in",
        widths[size],
        className,
      )}
    >
      <div className="p-6 sm:p-7">
        {title ? (
          <div className="mb-5 flex items-start justify-between gap-4 pr-1">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em]">{title}</h2>
              {description ? <p className="mt-1 text-[14px] text-ink-3">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 flex size-8 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </dialog>
  );
}
