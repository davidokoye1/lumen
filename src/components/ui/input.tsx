import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-3 shadow-sm transition-[border-color,box-shadow] duration-150 outline-none focus:border-accent-vivid focus:ring-4 focus:ring-[var(--ring)] disabled:opacity-60 aria-[invalid=true]:border-bad aria-[invalid=true]:focus:ring-bad-soft";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(fieldBase, "min-h-32 py-3 leading-relaxed", className)} {...props} />;
});

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-[13px] font-medium text-ink-2", className)} {...props} />;
}

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[13px] text-bad-ink animate-fade-in">
      {children}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <FieldError id={`${htmlFor}-error`}>{error}</FieldError> : hint ? <p className="mt-1.5 text-[13px] text-ink-3">{hint}</p> : null}
    </div>
  );
}

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        fieldBase,
        "h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2385837c%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pr-9",
        className,
      )}
      {...props}
    />
  );
});
