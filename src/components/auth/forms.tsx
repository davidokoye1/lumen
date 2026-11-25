"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, signupAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import type { FormState } from "@/lib/validation";

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-3 hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <ErrorBanner>{state?.error}</ErrorBanner>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          aria-invalid={!!fe.email}
          aria-describedby={fe.email ? "email-error" : undefined}
          required
          autoFocus
        />
      </Field>
      <Field label="Password" htmlFor="password" error={fe.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          aria-invalid={!!fe.password}
          aria-describedby={fe.password ? "password-error" : undefined}
          required
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Sign in
      </Button>
      <p className="text-center text-[14px] text-ink-3">
        New to Lumen?{" "}
        <Link href="/signup" className="font-medium text-ink underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

function passwordStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Za-z]/.test(p) && /\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || /[A-Z]/.test(p)) s++;
  return s;
}

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signupAction, null);
  const [tz, setTz] = useState("UTC");
  const [pw, setPw] = useState("");
  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"), []);
  const fe = state?.fieldErrors ?? {};
  const strength = passwordStrength(pw);
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
  return (
    <form action={action} className="space-y-4" noValidate>
      <ErrorBanner>{state?.error}</ErrorBanner>
      <input type="hidden" name="timezone" value={tz} />
      <Field label="Your name" htmlFor="name" error={fe.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={state?.values?.name}
          aria-invalid={!!fe.name}
          maxLength={60}
          required
          autoFocus
        />
      </Field>
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          aria-invalid={!!fe.email}
          required
        />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        error={fe.password}
        hint="At least 8 characters with a letter and a number."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={!!fe.password}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
      </Field>
      {pw ? (
        <div className="-mt-1 flex items-center gap-2" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ background: i < strength ? (strength >= 3 ? "var(--good)" : "var(--warn)") : "var(--surface-3)" }}
              />
            ))}
          </div>
          <span className="w-16 text-right text-[12px] text-ink-3">{labels[strength]}</span>
        </div>
      ) : null}
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Create account
      </Button>
      <p className="text-center text-[14px] text-ink-3">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
