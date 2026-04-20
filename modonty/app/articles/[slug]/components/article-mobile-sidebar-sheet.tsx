"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "@/components/link";
import { ArticleClientCard } from "./sidebar/article-client-card";
import { ArticleTableOfContents } from "./sidebar/client-only-table-of-contents";
import type { SocialLink } from "@/lib/settings/get-platform-social-links";
import { NewsletterCTA } from "./sidebar/newsletter-cta";
import { ArticleCitations } from "./sidebar/article-citations";
import { IconShare, IconLink } from "@/lib/icons";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const SOCIAL_ICON_MAP: Record<string, IconComponent> = {
  facebook:  SocialFacebookOutline,
  linkedin:  Linkedin,
  youtube:   Youtube,
  twitter:   Twitter,
  instagram: Instagram,
  tiktok:    TiktokLogoLight,
  snapchat:  RoundSnapchat,
};

interface ArticleMobileSidebarSheetProps {
  client?: {
    id: string;
    name: string;
    slug: string;
    url?: string | null;
    description?: string | null;
    logoMedia?: { url: string } | null;
    heroImageMedia?: { url: string } | null;
  } | null;
  askClientProps?: {
    articleId: string;
    clientId: string;
    articleTitle?: string;
    user: { name: string | null; email: string | null } | null;
  } | null;
  content: string;
  citations?: string[];
  clientId: string;
  articleId: string;
  articleTitle?: string;
  platformSocialLinks?: SocialLink[];
  newsletterCtaText?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ArticleMobileSidebarSheet({
  client,
  askClientProps,
  content,
  citations = [],
  clientId,
  articleId,
  articleTitle,
  platformSocialLinks = [],
  newsletterCtaText,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ArticleMobileSidebarSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleShare = () => {
    if ("share" in navigator) {
      void navigator.share({ title: articleTitle, url: window.location.href }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    void (navigator as Navigator).clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-hidden flex flex-col p-0"
          dir="rtl"
        >
          <SheetHeader className="p-4 border-b border-border shrink-0">
            <SheetTitle>المزيد</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-5 [&_section]:my-0 [&>div]:my-0">

            {/* 1. Client card */}
            {client && (
              <ArticleClientCard
                client={client}
                askClientProps={askClientProps ?? undefined}
              />
            )}

            <div className="h-px bg-border/40" />

            {/* 2. Newsletter */}
            <div className="[&>div]:mt-0 [&>div]:mb-0">
              <NewsletterCTA clientId={clientId} articleId={articleId} ctaText={newsletterCtaText} />
            </div>

            <div className="h-px bg-border/40" />

            {/* 3. TOC */}
            <ArticleTableOfContents content={content} />

            <div className="h-px bg-border/40" />

            {/* 4. Share */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3">شارك المقال</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="secondary" size="sm" className="gap-2" onClick={handleShare}>
                  <IconShare className="h-3.5 w-3.5" />
                  مشاركة
                </Button>
                <Button variant="secondary" size="sm" className="gap-2" onClick={handleCopyLink}>
                  <IconLink className="h-3.5 w-3.5" />
                  {copied ? "تم النسخ ✓" : "نسخ الرابط"}
                </Button>
              </div>
            </div>

            <div className="h-px bg-border/40" />

            {/* 5. Modonty branding */}
            <div className="flex items-center justify-between gap-3">
              <Link href="/about" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  م
                </div>
                <div>
                  <p className="text-sm font-semibold">مدونتي</p>
                  <p className="text-xs text-muted-foreground">منصة المحتوى العربي</p>
                </div>
              </Link>
              {platformSocialLinks.length > 0 && (
                <nav className="flex items-center gap-0.5 shrink-0" aria-label="وسائل التواصل مدونتي">
                  {platformSocialLinks.map(({ key, href, label }) => {
                    const Icon = SOCIAL_ICON_MAP[key];
                    if (!Icon) return null;
                    return (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* 6. Citations */}
            {citations.length > 0 && (
              <>
                <div className="h-px bg-border/40" />
                <ArticleCitations citations={citations} />
              </>
            )}

          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
