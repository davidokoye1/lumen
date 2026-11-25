import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/literata";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/session";
import { Providers } from "@/components/shell/providers";
import { themeScript } from "@/components/shell/theme";

export const metadata: Metadata = {
  title: { default: "Lumen · Read faster, understand more", template: "%s · Lumen" },
  description:
    "A science-based reading program that builds speed, comprehension and focus. RSVP, guided pacing, phrase training and an honest 25-session curriculum.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const pref = user?.preferences.theme ?? null;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme-pref={pref ?? undefined}
      className={pref === "dark" ? "dark" : undefined}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers theme={pref} signedIn={!!user}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
