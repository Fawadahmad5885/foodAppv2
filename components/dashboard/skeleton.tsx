export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="h-10 rounded-lg bg-stone-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-stone-50" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-6">
      <div className="h-4 w-24 rounded bg-stone-100" />
      <div className="mt-4 h-8 w-16 rounded bg-stone-200" />
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
