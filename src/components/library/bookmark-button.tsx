"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmarkAction } from "@/actions/library";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function BookmarkButton({ slug, saved, size = "md" }: { slug: string; saved: boolean; size?: "sm" | "md" }) {
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, start] = useTransition();
  const { toast } = useToast();
  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={optimistic ? "Remove from saved" : "Save for later"}
      title={optimistic ? "Saved" : "Save for later"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          setOptimistic(!optimistic);
          const res = await toggleBookmarkAction(slug);
          if (!res.ok) toast({ tone: "error", title: "Couldn't update saved list", description: res.error });
        });
      }}
      className={cn(
        "flex items-center justify-center rounded-lg transition-colors",
        size === "sm" ? "size-8" : "size-9",
        optimistic ? "text-accent-vivid hover:bg-accent-soft" : "text-ink-3 hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Bookmark className="size-4" fill={optimistic ? "currentColor" : "none"} />
    </button>
  );
}
