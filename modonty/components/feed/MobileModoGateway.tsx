"use client";

import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";

import { MobileFloatingActionPopover } from "@/components/shared/MobileFloatingActionPopover";
import { IconForward } from "@/lib/icons";
import { getOptimizedCharacterUrl } from "@/lib/image-utils";

function ModoAvatar({ size }: { size: "trigger" | "content" }) {
  const sizeClass = size === "trigger" ? "size-7" : "size-10";
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full ${sizeClass}`}>
      <OptimizedImage media={asMedia(getOptimizedCharacterUrl(80))} alt="" fill className="object-cover" sizes={size === "trigger" ? "28px" : "40px"} />
    </span>
  );
}

export function MobileModoGateway() {
  return (
    <MobileFloatingActionPopover
      ariaLabel="افتح Modo"
      triggerLabel="مودو"
      triggerVisual={<ModoAvatar size="trigger" />}
      contentVisual={<ModoAvatar size="content" />}
      title="Modo معك"
      description="صف احتياجك، وسأوصلك للمقال أو الشريك المناسب."
      actionLabel="ابدأ مع Modo"
      actionHref="/modo"
      actionIcon={<IconForward className="size-5 text-accent" aria-hidden="true" />}
    />
  );
}
