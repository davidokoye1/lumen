import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SignupForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboarded ? "/dashboard" : "/onboarding");
  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-[-0.025em]">Start reading better</h1>
      <p className="mt-1.5 mb-8 text-[15px] text-ink-2">
        Measure your baseline in five minutes. Then train ten minutes a day.
      </p>
      <SignupForm />
    </>
  );
}
