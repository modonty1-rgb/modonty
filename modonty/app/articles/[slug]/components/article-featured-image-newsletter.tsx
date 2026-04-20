"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewsletterCTA } from "./sidebar/newsletter-cta";

interface ArticleFeaturedImageNewsletterProps {
  clientId: string;
  clientName: string;
  articleId?: string;
  ctaText?: string | null;
}

export function ArticleFeaturedImageNewsletter({
  clientId,
  clientName,
  articleId,
  ctaText,
}: ArticleFeaturedImageNewsletterProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Scrim + trigger — mobile only */}
      <div className="lg:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-4 pb-4 pt-16 flex items-center gap-2 flex-wrap">
        <p className="text-white text-sm font-semibold drop-shadow">
          جديد {clientName} في بريدك 🔔
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-white/90 text-sm underline underline-offset-2 hover:text-white transition-colors whitespace-nowrap"
        >
          اشترك الآن ←
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>اشترك في نشرة {clientName}</DialogTitle>
          </DialogHeader>
          <NewsletterCTA
            clientId={clientId}
            articleId={articleId}
            ctaText={ctaText}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
