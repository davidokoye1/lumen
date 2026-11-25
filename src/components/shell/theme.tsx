"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemePref = "system" | "light" | "dark";

/** Runs before paint: applies the stored preference so there's no flash. */
export const themeScript = `(function(){try{var d=document.documentElement;var p=d.getAttribute('data-theme-pref')||localStorage.getItem('lumen-theme')||'system';var dark=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',dark);}catch(e){}})();`;

type Ctx = { pref: ThemePref; resolved: "light" | "dark"; setPref: (p: ThemePref) => void };
const ThemeContext = createContext<Ctx>({ pref: "system", resolved: "light", setPref: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.setAttribute("data-theme-pref", pref);
  return dark ? "dark" : "light";
}

export function ThemeProvider({
  initial,
  children,
  onPersist,
}: {
  initial: ThemePref | null;
  children: ReactNode;
  onPersist?: (p: ThemePref) => void;
}) {
  const [pref, setPrefState] = useState<ThemePref>(initial ?? "system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (initial ?? (localStorage.getItem("lumen-theme") as ThemePref | null)) || "system";
    setPrefState(stored);
    setResolved(apply(stored));
  }, [initial]);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => setResolved(apply("system"));
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [pref]);

  const setPref = useCallback(
    (p: ThemePref) => {
      setPrefState(p);
      localStorage.setItem("lumen-theme", p);
      setResolved(apply(p));
      onPersist?.(p);
    },
    [onPersist],
  );

  return <ThemeContext.Provider value={{ pref, resolved, setPref }}>{children}</ThemeContext.Provider>;
}
