"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "./types";

const LETTERS = ["A", "B", "C", "D"];

export function Quiz({
  questions,
  onSubmit,
  submitting,
  title = "Check your understanding",
}: {
  questions: QuizQuestion[];
  onSubmit: (answers: number[]) => void;
  submitting?: boolean;
  title?: string;
}) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const q = questions[i];
  const last = i === questions.length - 1;
  const chosen = answers[i];

  const choose = useCallback(
    (k: number) => setAnswers((a) => a.map((v, j) => (j === i ? k : v))),
    [i],
  );
  const next = useCallback(() => {
    if (answers[i] < 0) return;
    if (last) onSubmit(answers);
    else setI((x) => x + 1);
  }, [answers, i, last, onSubmit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (submitting) return;
      const k = e.key.toLowerCase();
      const idx = ["1", "2", "3", "4"].indexOf(k) >= 0 ? ["1", "2", "3", "4"].indexOf(k) : ["a", "b", "c", "d"].indexOf(k);
      if (idx >= 0) {
        e.preventDefault();
        choose(idx);
      } else if (e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" && i > 0) setI((x) => x - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, next, i, submitting]);

  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink-3">{title}</p>
        <div className="flex items-center gap-1.5" aria-label={`Question ${i + 1} of ${questions.length}`}>
          {questions.map((_, j) => (
            <span
              key={j}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                j === i ? "w-6 bg-accent-vivid" : answers[j] >= 0 ? "w-1.5 bg-ink-3" : "w-1.5 bg-surface-3",
              )}
            />
          ))}
        </div>
      </div>
      <div key={i} className="animate-fade-in">
        <p className="mb-1 text-[13px] text-ink-3">
          Question {i + 1} of {questions.length}
        </p>
        <h2 className="text-[20px] leading-snug font-semibold tracking-[-0.015em] text-ink sm:text-[22px]">{q.q}</h2>
        <div role="radiogroup" aria-label="Answer options" className="mt-6 space-y-2.5">
          {q.options.map((o, k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={chosen === k}
              onClick={() => choose(k)}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-all duration-150",
                chosen === k
                  ? "border-accent-vivid bg-accent-soft text-ink shadow-[0_0_0_3px_var(--ring)]"
                  : "border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold",
                  chosen === k ? "bg-accent text-accent-fg" : "bg-surface-2 text-ink-3",
                )}
              >
                {LETTERS[k]}
              </span>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setI((x) => x - 1)} disabled={i === 0 || submitting} icon={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1 text-[12px] text-ink-3 sm:flex">
            <Kbd>1</Kbd>–<Kbd>4</Kbd> choose · <Kbd>↵</Kbd> next
          </span>
          <Button onClick={next} disabled={chosen < 0} loading={submitting}>
            {last ? "Submit answers" : "Next"}
            {!last ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function QuizReview({
  questions,
  answers,
  correct,
}: {
  questions: QuizQuestion[];
  answers: number[];
  correct: number[];
}) {
  return (
    <ol className="space-y-3">
      {questions.map((q, i) => {
        const ok = answers[i] === correct[i];
        return (
          <li key={i} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                  ok ? "bg-good-soft text-good-ink" : "bg-bad-soft text-bad-ink",
                )}
                aria-label={ok ? "Correct" : "Incorrect"}
              >
                {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink">{q.q}</p>
                {!ok && answers[i] >= 0 ? (
                  <p className="mt-1.5 text-[13px] text-ink-3 line-through decoration-ink-3/50">{q.options[answers[i]]}</p>
                ) : null}
                <p className={cn("mt-1 text-[13px]", ok ? "text-ink-2" : "font-medium text-good-ink")}>{q.options[correct[i]]}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
