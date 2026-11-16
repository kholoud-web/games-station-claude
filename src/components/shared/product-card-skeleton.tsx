import { Skeleton } from '@/components/ui/skeleton';

/** Same outer shell and rough proportions as ProductCard, so the grid does not jump when data arrives. */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-card border border-border bg-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
