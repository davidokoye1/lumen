"use client";

import type { ReactNode } from "react";
import { ThemeProvider, type ThemePref } from "./theme";
import { ToastProvider } from "@/components/ui/toast";
import { updatePreferencesAction } from "@/actions/settings";

export function Providers({ theme, signedIn, children }: { theme: ThemePref | null; signedIn: boolean; children: ReactNode }) {
  return (
    <ThemeProvider
      initial={theme}
      onPersist={
        signedIn
          ? (p) => {
              void updatePreferencesAction({ theme: p });
            }
          : undefined
      }
    >
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
