"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";
import { ModontyTrustMark } from "@modonty/shared/components/icons/modonty-trust-mark";

import type { ClientSheetInfo } from "./ClientSheetContent";

// The sheet (Radix Dialog + its content) loads on demand — warmed when a finger or pointer comes
// near the logo, mounted on the tap. Khalid (3 Oct 2026): «تتأكد إنه يكون on demand… البرفورمانس
// تبع الموبايل». The bar itself ships only this button and a logo.
const loadSheet = () => import("./ClientSheetContent");
const ClientSheetContent = dynamic(() => loadSheet().then((m) => ({ default: m.ClientSheetContent })), { ssr: false });

/**
 * The partner's logo between the article's two action buttons (Khalid, 3 Oct 2026). It replaces the
 * partner card that stood between the title and the first sentence: identity stays on screen the
 * whole time, and the details are one tap away instead of 133px in front of the article.
 */
export function ClientSheetButton({
  client,
  details,
  reviewedLabel,
}: {
  client: ClientSheetInfo;
  details?: ReactNode;
  reviewedLabel: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`عن ${client.name}`}
        aria-haspopup="dialog"
        onPointerEnter={() => void loadSheet()}
        onTouchStart={() => void loadSheet()}
        onFocus={() => void loadSheet()}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        // A ring in the brand colour and our trust mark in the corner: a bare logo does not read as something to tap.
        className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-card ring-2 ring-primary/50 transition-transform active:scale-95 motion-reduce:active:scale-100"
      >
        <PartnerAvatar media={client.logoMedia ?? null} name={client.name} size="small" className="rounded-lg" />
        {/* شارةُ الموثوقيّة حقّتنا لا ✓ عامّة (خالد ٣ أكتوبر ٢٠٢٦). */}
        <span aria-hidden className="absolute -bottom-1.5 -end-1.5 rounded-full bg-background p-px">
          <ModontyTrustMark className="size-4" />
        </span>
      </button>
      {mounted ? (
        <ClientSheetContent client={client} open={open} onOpenChange={setOpen} details={details} reviewedLabel={reviewedLabel} />
      ) : null}
    </>
  );
}
