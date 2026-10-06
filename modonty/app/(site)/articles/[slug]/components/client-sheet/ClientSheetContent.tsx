"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import { PartnerAvatar } from "@modonty/shared/components/partner-avatar/PartnerAvatar";

export interface ClientSheetInfo {
  name: string;
  slug: string;
  isVerified?: boolean;
  credential?: string | null;
  city?: string | null;
  logoMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null } | null;
}

/**
 * The partner, in a sheet from the bottom — opened from the logo in the article's action bar.
 * Loaded on the first tap only (see ClientSheetButton), so a reader who never asks pays nothing.
 */
export function ClientSheetContent({
  client,
  open,
  onOpenChange,
  details,
  reviewedLabel,
}: {
  client: ClientSheetInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details?: ReactNode;
  reviewedLabel: string;
}) {
  const sub = [client.credential?.trim(), client.city?.trim()].filter(Boolean).join(" · ");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" dir="rtl" className="rounded-t-2xl px-4 pb-6 pt-3 lg:hidden">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
        <div className="flex items-center gap-3">
          <PartnerAvatar media={client.logoMedia ?? null} name={client.name} size="standard" />
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              {client.isVerified && <VerifiedBadge className="h-3.5 w-3.5" label="شريك موثّق" />}
              {reviewedLabel}
            </p>
            <SheetTitle className="text-lg font-extrabold leading-tight">{client.name}</SheetTitle>
            {sub ? <SheetDescription className="mt-0.5 text-[13px] leading-relaxed">{sub}</SheetDescription> : null}
          </div>
        </div>
        {details ? <div className="mt-3 border-t border-border pt-3">{details}</div> : null}
        <Link
          href={`/clients/${client.slug}`}
          className="mt-4 flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
        >
          صفحة {client.name} ←
        </Link>
      </SheetContent>
    </Sheet>
  );
}
