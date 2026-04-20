import { OptimizedImage } from "@/components/media/OptimizedImage";

interface HeroCoverProps {
  clientName: string;
  coverImage: string | undefined;
}

const PAGE_COVER_SIZES = "100vw";

export function HeroCover({ clientName, coverImage }: HeroCoverProps) {
  if (!coverImage) {
    return (
      <div className="relative w-full h-40 sm:h-48 md:h-56 overflow-hidden bg-gradient-to-br from-primary/30 via-primary/10 to-background">
        {/* subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* full name watermark */}
        <div className="absolute inset-0 flex items-center justify-center px-6 select-none pointer-events-none">
          <span className="text-4xl sm:text-5xl md:text-6xl font-black text-primary/15 leading-tight text-center break-words">
            {clientName.trim()}
          </span>
        </div>
        {/* bottom fade to merge with hero card */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/40 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="relative w-full aspect-[3/1] sm:aspect-[4/1] md:aspect-[6/1]">
        <OptimizedImage
          src={coverImage}
          alt={`غلاف ${clientName}`}
          fill
          className="object-cover"
          sizes={PAGE_COVER_SIZES}
          preload
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
    </div>
  );
}
