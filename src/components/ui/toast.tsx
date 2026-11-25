"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; tone: "success" | "error" | "info" };
type Ctx = { toast: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<Ctx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs.slice(-2), { ...t, id }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {items.map((t) => {
          const Icon = t.tone === "success" ? CircleCheck : t.tone === "error" ? TriangleAlert : Info;
          return (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg animate-rise"
            >
              <Icon
                className={cn(
                  "mt-0.5 size-[18px] shrink-0",
                  t.tone === "success" ? "text-good" : t.tone === "error" ? "text-bad" : "text-ink-3",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{t.title}</p>
                {t.description ? <p className="mt-0.5 text-[13px] text-ink-3">{t.description}</p> : null}
              </div>
              <button
                onClick={() => setItems((xs) => xs.filter((x) => x.id !== t.id))}
                className="text-ink-3 hover:text-ink"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
