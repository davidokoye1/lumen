import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M9 9.5h3.2v10.3H20v2.7H9z" fill="var(--accent-fg)" />
      <circle cx="22.2" cy="11.2" r="2.4" fill="var(--accent-fg)" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 rounded-lg", className)} aria-label="Lumen home">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Lumen</span>
    </Link>
  );
}
