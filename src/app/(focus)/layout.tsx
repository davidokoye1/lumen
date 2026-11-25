import { requireUser } from "@/lib/auth/session";

/** Distraction-free surface for reading and drills: no navigation chrome. */
export default async function FocusLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <div className="min-h-dvh bg-bg">{children}</div>;
}
