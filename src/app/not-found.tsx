import { LinkButton } from "@/components/ui/button";
import { LogoMark } from "@/components/shell/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="mb-6 size-10" />
      <p className="text-[13px] font-medium text-ink-3">404</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em]">This page isn&apos;t in the library</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink-2">The link may be broken or the page may have moved.</p>
      <LinkButton href="/dashboard" className="mt-6">
        Back to home
      </LinkButton>
    </div>
  );
}
