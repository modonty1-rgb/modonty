"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArticleClientCard } from "./sidebar/article-client-card";
import { ArticleAuthorBio } from "./sidebar/article-author-bio";
import { ArticleTableOfContents } from "./sidebar/client-only-table-of-contents";
import { NewsletterCTA } from "./sidebar/newsletter-cta";
import { CommentFormDialog } from "./comment-form-dialog";
import { ArticleCitations } from "./sidebar/article-citations";

interface ArticleMobileSidebarSheetProps {
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ArticleMobileSidebarSheet({
  client,
  askClientProps,
  author,
  content,
  citations = [],
  clientId,
  articleId,
  articleSlug,
  userId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ArticleMobileSidebarSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

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
          <div className="flex-1 overflow-y-auto p-4 space-y-6 [&_section]:my-0 [&>div]:my-0">
            {client && (
              <ArticleClientCard
                client={client}
                askClientProps={askClientProps ?? undefined}
              />
            )}
            {author && <ArticleAuthorBio author={author} />}
            <ArticleTableOfContents content={content} />
            <div className="[&>div]:mt-0 [&>div]:mb-0">
              <NewsletterCTA clientId={clientId} />
            </div>
            <CommentFormDialog
              articleId={articleId}
              articleSlug={articleSlug}
              userId={userId}
            />
            {citations.length > 0 && (
              <ArticleCitations citations={citations} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
