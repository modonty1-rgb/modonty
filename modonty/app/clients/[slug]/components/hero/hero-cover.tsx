import { OptimizedImage } from "@/components/media/OptimizedImage";

interface HeroCoverProps {
  clientName: string;
  coverImage: string | undefined;
}

export function HeroCover({ clientName, coverImage }: HeroCoverProps) {
  return (
    <div className="relative w-full h-48 md:h-56 lg:h-64 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
      {coverImage ? (
        <>
          <OptimizedImage
            src={coverImage}
            alt={`غلاف ${clientName}`}
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1536px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
      )}
    </div>
  );
}
