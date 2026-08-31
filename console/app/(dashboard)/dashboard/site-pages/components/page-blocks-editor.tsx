"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Switch } from "@modonty/shared/components/ui/switch";
import { HOME_BLOCKS, type HomeBlockKey, type HomeData } from "@modonty/shared/components/partner-site/free/home";
import { ABOUT_BLOCKS } from "@modonty/shared/components/partner-site/free/about";
import { SERVICES_BLOCKS } from "@modonty/shared/components/partner-site/free/services";
import { GALLERY_BLOCKS } from "@modonty/shared/components/partner-site/free/gallery";
import { FAQ_BLOCKS } from "@modonty/shared/components/partner-site/free/faq";
import { CONTACT_BLOCKS } from "@modonty/shared/components/partner-site/free/contact";
import { BLOG_BLOCKS } from "@modonty/shared/components/partner-site/free/blog";
import { BOOKING_BLOCKS } from "@modonty/shared/components/partner-site/free/booking";
import { REVIEWS_BLOCKS } from "@modonty/shared/components/partner-site/free/testimonials";

import { cn } from "@/lib/utils";
import { saveHiddenBlocks } from "@/lib/my-site/save-hidden-blocks";

import type { BlocksPage } from "../helpers/blocks-pages";

/** Registries live here (client side): a server page cannot pass components/functions as props. */
const PAGE_BLOCKS: Record<BlocksPage, readonly (typeof HOME_BLOCKS)[number][]> = {
  home: HOME_BLOCKS,
  about: ABOUT_BLOCKS,
  services: SERVICES_BLOCKS,
  photos: GALLERY_BLOCKS,
  faq: FAQ_BLOCKS,
  contact: CONTACT_BLOCKS,
  articles: BLOG_BLOCKS,
  book: BOOKING_BLOCKS,
  reviews: REVIEWS_BLOCKS,
};

interface PageBlocksEditorProps {
  page: BlocksPage;
  data: HomeData;
  initialHidden: string[];
}

/**
 * A site page as the visitor will see it, block by block, ONE switch beside each.
 * Off = the block leaves the page. Blocks with no data show greyed with a plain hint.
 * Shared by «الرئيسية» and «من نحن» (same data object, different block lists).
 * UI-first: the switches persist with the wiring step (Khalid 2026-08-18).
 */
export function PageBlocksEditor({ page, data, initialHidden }: PageBlocksEditorProps) {
  const blocks = PAGE_BLOCKS[page];
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(initialHidden));
  const [pending, startTransition] = useTransition();

  // A switch is the save: one round-trip per flip, and the site updates within seconds.
  function toggle(key: HomeBlockKey, on: boolean) {
    const next = new Set(hidden);
    if (on) next.delete(key);
    else next.add(key);
    setHidden(next);
    startTransition(async () => {
      const res = await saveHiddenBlocks(Array.from(next));
      if (!res.success) {
        setHidden(hidden); // roll back what the screen showed
        toast.error(res.error);
      }
    });
  }

  return (
    <div className={cn("space-y-4", pending && "opacity-90")}>
      {blocks.map((b) => {
        const empty = b.isEmpty(data);
        const on = !hidden.has(b.key);
        return (
          <div key={b.key} className="flex items-start gap-3">
            <div className="flex w-16 shrink-0 flex-col items-center gap-1 pt-4">
              {b.toggleable ? (
                <Switch checked={on} disabled={empty} onCheckedChange={(v) => toggle(b.key, v)} aria-label={b.name} />
              ) : (
                <span className="grid h-6 w-6 place-items-center text-muted-foreground" title="ثابت"><Lock className="h-4 w-4" /></span>
              )}
              <span className="text-center text-[11px] leading-tight text-muted-foreground">{b.name}</span>
            </div>
            <div className={cn("min-w-0 flex-1 overflow-hidden rounded-lg ring-1 ring-border transition-opacity", (!on || empty) && "opacity-40")}>
              {empty ? (
                <div className="grid h-24 place-items-center text-sm text-muted-foreground">لا يوجد محتوى لـ«{b.name}» بعد — أضفه وسيظهر هنا.</div>
              ) : (
                <div className="pointer-events-none select-none" aria-hidden>
                  <b.Component data={data} preview />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
