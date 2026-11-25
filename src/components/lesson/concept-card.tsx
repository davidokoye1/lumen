"use client";

import { ArrowRight, Check, FlaskConical, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConceptStep } from "@/lib/curriculum/types";

export function ConceptCard({ step, onContinue }: { step: ConceptStep; onContinue: () => void }) {
  return (
    <article className="mx-auto w-full max-w-2xl animate-rise">
      <div className="mb-4 flex items-center gap-2 text-[13px] font-medium text-accent-ink">
        <Lightbulb className="size-4" /> Concept
      </div>
      <h1 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink sm:text-[34px]">{step.title}</h1>
      <div className="mt-6 space-y-5 font-serif text-[18px] leading-[1.75] text-ink-2">
        {step.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <div className="mb-3 text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Key ideas</div>
        <ul className="space-y-2.5">
          {step.takeaways.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-[15px] text-ink">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      {step.evidence ? (
        <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-ink-3">
          <FlaskConical className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <span className="font-medium text-ink-2">Research: </span>
            {step.evidence}
          </span>
        </p>
      ) : null}
      <div className="mt-10">
        <Button size="lg" onClick={onContinue} autoFocus>
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </article>
  );
}
