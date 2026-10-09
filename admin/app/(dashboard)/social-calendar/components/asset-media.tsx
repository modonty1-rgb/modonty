import type { SocialAssetKind } from "@prisma/client";

import { cn } from "@/lib/utils";

/**
 * معاينة أصل واحد — صورة أو فيديو — بنسبته الحقيقية بلا قصّ (`object-contain`).
 * `<img>` لا `next/image`: الإبداع يُعرض بحجمه للمراجعة، ورابط الفيديو من Bunny Stream.
 */
export function AssetMedia({
  asset,
  className,
  controls = true,
  autoPlay = false,
}: {
  asset: { kind: SocialAssetKind; url: string; label: string | null; width?: number | null; height?: number | null };
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
}) {
  if (asset.kind === "VIDEO") {
    return (
      <video
        key={asset.url}
        src={asset.url}
        controls={controls}
        autoPlay={autoPlay}
        muted={!controls}
        preload="metadata"
        className={cn("bg-black", className)}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- معاينة إبداع بحجمه الحقيقي من CDN.
    <img
      src={asset.url}
      alt={asset.label ?? ""}
      width={asset.width ?? undefined}
      height={asset.height ?? undefined}
      className={cn("object-contain", className)}
    />
  );
}
