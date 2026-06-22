"use client";

import { useEffect, useState } from "react";
import Link from "@/components/link";
import { useSession } from "@/components/providers/SessionContext";
import { Button } from "@/components/ui/button";
import { IconInfo } from "@/lib/icons";
import { PlatformSocialLinks } from "@/components/layout/PlatformSocialLinks";
import type { SocialLink } from "@/lib/settings/get-platform-social-links";

interface FeedTopBannerProps {
  platformTagline?: string | null;
  platformDescription?: string | null;
  socialLinks: SocialLink[];
}

const PERKS = "🔔 جديد تخصصك · 🔖 احفظ مقالاتك · 🎁 عروض الشركاء";

// Homepage feed top banner. Logged-out → focused subscribe CTA (the cached/SSR
// default, which is also the majority of visitors). Logged-in → the admin-managed
// welcome banner (tagline + description from Settings). The auth branch lives here
// (client) on purpose: the page is "use cache", so it can't read the session server-side.
export function FeedTopBanner({ platformTagline, platformDescription, socialLinks }: FeedTopBannerProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted && !!session?.user;

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-border border-t-2 border-t-accent bg-muted/30 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">اشترك مجاناً في مدوّنتي</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{PERKS}</p>
          </div>
          <Button asChild size="sm" className="h-10 w-full px-4 text-sm font-semibold sm:h-9 sm:w-auto sm:shrink-0">
            <Link href="/users/register">اشترك مجاناً</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-border border-t-2 border-t-accent bg-muted/30 px-4 py-3">
      {/* Top row — welcome text (start) + «من نحن» in the opposite corner */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold text-foreground">
            {platformTagline ?? "مرحباً بك في مدونتي"}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {platformDescription ?? "منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين في مجالات متنوعة."}
          </p>
        </div>
        <Link
          href="/about"
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <IconInfo className="h-3.5 w-3.5" aria-hidden />
          من نحن
        </Link>
      </div>
      {/* Bottom row — social (start) + «جديد مدونتي» (end) */}
      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
        {socialLinks.length > 0 ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">تابعنا</span>
            <PlatformSocialLinks socialLinks={socialLinks} />
          </div>
        ) : (
          <span />
        )}
        <Link
          href="/news"
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          جديد مدونتي
        </Link>
      </div>
    </div>
  );
}
