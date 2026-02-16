"use client";

import { useState } from "react";
import { ArticleMobileEngagementBar } from "./article-mobile-engagement-bar";
import { ArticleMobileSidebarSheet } from "./article-mobile-sidebar-sheet";

interface ArticleMobileLayoutProps {
  barProps: {
    title: string;
    articleId: string;
    articleSlug: string;
    userId?: string | null;
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
      ogImageMedia?: { url: string } | null;
    } | null;
    askClientProps?: {
      articleId: string;
      clientId: string;
      articleTitle?: string;
      user: { name: string | null; email: string | null } | null;
    } | null;
    author?: {
      name: string;
      slug: string | null;
      image: string | null;
      jobTitle: string | null;
      bio: string | null;
      credentials: string[];
      expertiseAreas: string[];
      linkedIn: string | null;
      twitter: string | null;
      facebook: string | null;
    } | null;
    content: string;
    citations?: string[];
    clientId: string;
    articleId: string;
    articleSlug: string;
    userId?: string | null;
  };
}

export function ArticleMobileLayout({ barProps, sheetProps }: ArticleMobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <ArticleMobileEngagementBar
        {...barProps}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      <ArticleMobileSidebarSheet
        {...sheetProps}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
    </>
  );
}
