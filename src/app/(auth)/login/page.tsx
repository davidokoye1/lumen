import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(user.onboarded ? "/dashboard" : "/onboarding");
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-[-0.025em]">Welcome back</h1>
      <p className="mt-1.5 mb-8 text-[15px] text-ink-2">Pick up where you left off.</p>
      <LoginForm next={safe} />
    </>
  );
}
