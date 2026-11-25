import { Logo } from "@/components/shell/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px] animate-rise">{children}</div>
        </div>
        <p className="text-center text-[12px] text-ink-3 lg:text-left">© {new Date().getFullYear()} Lumen · Built for focused readers</p>
      </div>
      <aside className="relative hidden overflow-hidden border-l border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="text-[13px] font-medium text-ink-3">The Lumen Method</div>
        <div>
          <div className="mb-10 flex h-28 items-center justify-center rounded-3xl border border-line bg-bg">
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-baseline px-6 font-serif text-[40px] tracking-tight text-ink">
              <span className="text-right">compr</span>
              <span className="text-accent-vivid">e</span>
              <span>hension</span>
            </div>
          </div>
          <blockquote className="text-[22px] leading-snug font-medium tracking-[-0.015em] text-ink">
            &ldquo;Speed only counts when understanding comes with it.&rdquo;
          </blockquote>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">
            Lumen measures your effective reading rate (speed × comprehension), so every gain you see is one you
            actually keep.
          </p>
        </div>
        <ul className="grid grid-cols-3 gap-4 text-[13px] text-ink-2">
          <li>
            <div className="text-[22px] font-semibold text-ink">25</div>
            guided sessions
          </li>
          <li>
            <div className="text-[22px] font-semibold text-ink">7</div>
            training modes
          </li>
          <li>
            <div className="text-[22px] font-semibold text-ink">10 min</div>a day
          </li>
        </ul>
      </aside>
    </div>
  );
}
