import { OptimizedImage } from "@/components/media/OptimizedImage";

interface HeroCoverProps {
  clientName: string;
  coverImage: string | undefined;
}

const PAGE_COVER_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 2400px";

export function HeroCover({ clientName, coverImage }: HeroCoverProps) {
  return (
    <div
      className={`relative w-full overflow-hidden ${
        coverImage
          ? "bg-gradient-to-br from-primary/10 via-primary/5 to-background"
          : "bg-gradient-to-br from-primary/20 via-primary/10 to-background min-h-48"
      }`}
    >
      {coverImage && (
        <>
          <div className="relative w-full aspect-[6/1]">
            <OptimizedImage
              src={coverImage}
              alt={`غلاف ${clientName}`}
              fill
              className="object-cover"
              sizes={PAGE_COVER_SIZES}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        </>
      )}
    </div>
  );
}
