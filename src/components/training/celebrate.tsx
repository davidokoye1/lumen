"use client";

import { useMemo } from "react";

/** A tasteful burst of confetti. Pure CSS, disabled for reduced motion. */
export function Celebration({ count = 42 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 0.25,
        duration: 1.4 + Math.random() * 1.1,
        rotate: Math.random() * 720 - 360,
        drift: Math.random() * 160 - 80,
        size: 5 + Math.random() * 5,
        color: ["var(--accent-vivid)", "var(--series-2)", "var(--series-3)", "var(--warn)", "var(--text-3)"][i % 5],
        round: Math.random() > 0.6,
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden motion-reduce:hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-[-12px]"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 0.45,
              background: p.color,
              borderRadius: p.round ? 999 : 1,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rot": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
