"use client";

import Link from "next/link";
import { useState } from "react";
import { AlignLeft, ArrowRight, BookOpen, ClipboardCheck, GraduationCap, PenLine, Play, Timer, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Option = { href: string; title: string; description: string; icon: React.ReactNode; recommended?: boolean };

export function QuickStart({
  next,
  checkIn,
  className,
  size = "lg",
}: {
  next: { id: string; number: number; title: string; minutes: number } | null;
  checkIn: boolean;
  className?: string;
  size?: "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const options: Option[] = [
    ...(next
      ? [
          {
            href: `/learn/${next.id}`,
            title: `Session ${next.number}: ${next.title}`,
            description: `Continue your program · ~${next.minutes} min`,
            icon: <GraduationCap className="size-[18px]" />,
            recommended: true,
          },
        ]
      : []),
    ...(checkIn
      ? [{ href: "/check-in", title: "Weekly check-in", description: "Measure your progress on a standardized passage", icon: <ClipboardCheck className="size-[18px]" /> }]
      : []),
    { href: "/train/timed?from=dashboard", title: "Timed reading", description: "A fresh passage at your natural pace, with questions", icon: <Timer className="size-[18px]" /> },
    { href: "/train/pacer?from=dashboard", title: "Guided pacer", description: "Follow a moving highlight at your target speed", icon: <AlignLeft className="size-[18px]" /> },
    { href: "/train/rsvp?from=dashboard", title: "RSVP reader", description: "One word at a time, aligned on the focal letter", icon: <Type className="size-[18px]" /> },
    { href: "/library", title: "Choose from the library", description: "18 articles across six subjects", icon: <BookOpen className="size-[18px]" /> },
    { href: "/library?new=1", title: "Paste your own text", description: "Practice with something you actually need to read", icon: <PenLine className="size-[18px]" /> },
  ];
  return (
    <>
      <Button size={size} onClick={() => setOpen(true)} className={cn("shadow-md", className)} icon={<Play className="size-4" fill="currentColor" />}>
        Start reading
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Start reading" description="Pick up the program, or practice freely.">
        <ul className="-mx-2 space-y-1">
          {options.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-surface-2",
                  o.recommended && "bg-accent-soft hover:bg-accent-soft-2",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    o.recommended ? "bg-accent text-accent-fg" : "bg-surface-2 text-ink-2 group-hover:bg-surface",
                  )}
                >
                  {o.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    <span className="truncate">{o.title}</span>
                    {o.recommended ? (
                      <span className="shrink-0 rounded-full bg-accent px-1.5 py-px text-[10px] font-semibold text-accent-fg uppercase">Next</span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[13px] text-ink-3">{o.description}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}
