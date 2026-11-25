"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePreferencesAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function LeaderboardToggle({ optedIn }: { optedIn: boolean }) {
  const [pending, start] = useTransition();
  const [on, setOn] = useState(optedIn);
  const router = useRouter();
  const { toast } = useToast();
  return (
    <Button
      variant={on ? "ghost" : "primary"}
      size="sm"
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await updatePreferencesAction({ leaderboardOptIn: !on });
          if (!res.ok) toast({ tone: "error", title: "Couldn't update", description: res.error });
          else {
            setOn(!on);
            toast({ tone: "success", title: !on ? "You've joined the leaderboard" : "You've left the leaderboard" });
            router.refresh();
          }
        })
      }
    >
      {on ? "Leave leaderboard" : "Join the leaderboard"}
    </Button>
  );
}
