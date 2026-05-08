import { Skeleton } from '../Skeleton';

export function PageLoadingState() {
  return (
    <div className="space-y-4 p-6" aria-label="Loading" aria-busy="true">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="space-y-2 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
