"use client";

import { useState } from "react";
import { ArticleMobileEngagementBar } from "./article-mobile-engagement-bar";
import { ArticleMobileSidebarSheet } from "./article-mobile-sidebar-sheet";
import { NewsletterCTA } from "./sidebar/newsletter-cta";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SocialLink } from "@/lib/settings/get-platform-social-links";

interface ArticleMobileLayoutProps {
  barProps: {
    title: string;
    articleId: string;
    articleSlug: string;
    clientId?: string;
    clientLogo?: string | null;
    clientName?: string | null;
    clientSlug?: string | null;
    articleTitle?: string;
    user?: { name: string | null; email: string | null } | null;
    commentsCount?: number;
    likes: number;
    dislikes: number;
    favorites: number;
    userLiked: boolean;
    userDisliked: boolean;
    userFavorited: boolean;
  };
  sheetProps: {
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
  };
}

export function ArticleMobileLayout({ barProps, sheetProps }: ArticleMobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  return (
    <>
      <ArticleMobileEngagementBar
        {...barProps}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenNewsletter={() => setNewsletterOpen(true)}
      />
      <ArticleMobileSidebarSheet
        {...sheetProps}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <Dialog open={newsletterOpen} onOpenChange={setNewsletterOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>اشترك في النشرة</DialogTitle>
          </DialogHeader>
          <NewsletterCTA
            clientId={sheetProps.clientId}
            articleId={sheetProps.articleId}
            ctaText={sheetProps.newsletterCtaText}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
