"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink-2">
        We couldn&apos;t load this page. Your progress is saved, so try again in a moment.
      </p>
      {error.digest ? <p className="mt-2 font-mono text-[12px] text-ink-3">Ref: {error.digest}</p> : null}
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
