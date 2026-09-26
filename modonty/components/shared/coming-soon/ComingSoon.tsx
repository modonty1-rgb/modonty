import type { ComponentType, SVGProps } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { messages } from "@/lib/i18n/messages";

interface ComingSoonProps {
  /** The door's own name — «الكورة», «مودو لينك» — drawn as the page title. */
  name: string;
  /** One line on what the finished page will hold. */
  blurb: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * The page behind every door on `/modonty` that is not built yet (Khalid, 26 Sep 2026:
 * «صفحة كامينج سون أنيقة وكاتشي… الأيقونات اللي لسه ما فعلناها نربطها عليها»). Each door keeps
 * its FINAL address (`/modonty/football`, `/modo-link`), so when the real page lands the tile
 * and every shared link stay exactly as they are.
 *
 * One composition, three beats: the door's own mark on a slowly turning ring (the brand's
 * diamond riding it) · its name with a live «قريباً» · what the page will hold, and two ways
 * forward so the visit is not a dead end. All motion is `motion-safe:` and the colours are
 * tokens only, so both themes and reduced-motion hold.
 */
export function ComingSoon({ name, blurb, icon: Icon }: ComingSoonProps) {
  const t = messages.modonty.soon;
  return (
    <section className="relative isolate mx-auto flex min-h-[calc(100svh-14rem)] w-full max-w-xl flex-col items-center justify-center px-4 py-10 text-center">
      {/* A soft brand glow behind the mark, and the logo's dot grid faintly under it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_32%,hsl(var(--primary)/0.16),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--primary)/0.10)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(60%_50%_at_50%_35%,black,transparent)]"
      />

      <div className="relative grid size-40 place-items-center">
        {/* The ring turns once every 24s with the diamond riding its top — alive, not busy. */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 motion-safe:animate-[spin_24s_linear_infinite]"
        >
          {/* `left-1/2`, not `start-1/2`: centring is direction-free, and `start` in RTL would
              need a mirrored translate to land on the same point. */}
          <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 rounded-[3px] bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.7)]" />
        </div>
        <div className="grid size-28 place-items-center rounded-full bg-card shadow-lg ring-1 ring-border">
          <Icon className="size-14 text-foreground [--modonty-ai-body:currentColor] [--modonty-link-body:currentColor]" aria-hidden />
        </div>
      </div>

      <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-foreground ring-1 ring-accent/40">
        <span aria-hidden className="size-2 rounded-full bg-accent motion-safe:animate-pulse" />
        {t.badge}
      </span>

      <h1 className="mt-3 text-balance text-3xl font-black leading-tight text-foreground sm:text-4xl">{name}</h1>
      <p className="mt-3 text-balance text-base leading-relaxed text-foreground/85 sm:text-lg">{blurb}</p>
      <p className="mt-2 text-balance text-sm text-muted-foreground">{t.lead}</p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/modonty" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
          {t.back}
        </Link>
        <Link href="/articles" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto" })}>
          {t.read}
        </Link>
      </div>
    </section>
  );
}
