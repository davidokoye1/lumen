import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger" | "ink";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none transition-[background-color,color,box-shadow,transform,border-color] duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-vivid";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg shadow-sm hover:bg-accent-strong",
  ink: "bg-ink text-bg shadow-sm hover:opacity-90",
  secondary: "bg-surface text-ink border border-line-strong shadow-sm hover:bg-surface-2",
  ghost: "text-ink-2 hover:text-ink hover:bg-surface-2",
  subtle: "bg-surface-2 text-ink hover:bg-surface-3",
  danger: "bg-bad text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-[15px] rounded-xl",
  icon: "h-10 w-10 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: ReactNode };

export function LinkButton({ variant = "primary", size = "md", icon, className, children, ...props }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
