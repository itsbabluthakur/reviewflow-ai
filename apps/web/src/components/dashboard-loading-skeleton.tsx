import { Skeleton } from "@reviewflow/ui";

/** Route-level loading state for the protected shell (app/(protected)/loading.tsx) — UI_GUIDELINES section 19. */
export function DashboardLoadingSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="border-border hidden w-60 shrink-0 flex-col gap-2 border-r p-4 md:flex">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 flex flex-col gap-2">
          {["a", "b", "c", "d", "e"].map((key) => (
            <Skeleton key={key} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="border-border flex h-14 items-center border-b px-4">
          <Skeleton className="h-6 w-40" />
          <div className="ml-auto">
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="mb-6 h-8 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["a", "b", "c"].map((key) => (
              <Skeleton key={key} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
