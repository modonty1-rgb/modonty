import { Skeleton } from "@/components/ui/skeleton";

interface MarketingPageSkeletonProps {
  hasHeroImage?: boolean;
  paragraphs?: number;
  maxWidthClass?: string;
}

export function MarketingPageSkeleton({
  hasHeroImage = false,
  paragraphs = 6,
  maxWidthClass = "max-w-4xl",
}: MarketingPageSkeletonProps) {
  return (
    <div className={`mx-auto ${maxWidthClass}`}>
      {hasHeroImage && (
        <Skeleton className="w-full h-56 rounded-lg mb-6" />
      )}

      <Skeleton className="h-9 w-1/2 mb-4" />

      <div className="space-y-3">
        {Array.from({ length: paragraphs }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-4 ${
              index % 4 === 3 ? "w-2/3" : "w-full"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

