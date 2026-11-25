import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy aria-label="Loading">
      <div className="h-14 border-b border-line" />
      <div className="mx-auto w-full max-w-xl space-y-4 px-6 py-16">
        <Skeleton className="size-12 rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-6 h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}
