"use client";

import { CHARACTER_URL } from "@/constants";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { MobileFloatingActionPopover } from "@/app/home-components/MobileFloatingActionPopover";
import { IconForward } from "@/lib/icons";


function ModoAvatar({ size }: { size: "trigger" | "content" }) {
  const sizeClass = size === "trigger" ? "size-7" : "size-10";
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full ${sizeClass}`}>
      <OptimizedImage media={asMedia(CHARACTER_URL)} alt="" fill className="object-cover" sizes={size === "trigger" ? "28px" : "40px"} />
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
