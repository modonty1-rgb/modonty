"use client";

import { cloneElement, useState, type ReactElement } from "react";
import dynamic from "next/dynamic";

import { trackCtaClick } from "@/lib/analytics/cta-tracking";
import { AuthPromptLazy } from "@/components/shared/auth-prompt/AuthPromptLazy";

// Loaded on the first tap, not with the article (plan أ١, 3 Oct 2026): Dialog + the comment
// form + its validation were in every article's first load. Pointing at the trigger warms it.
const loadContent = () => import("./CommentFormDialogContent");
const CommentFormDialogContent = dynamic(
  () => loadContent().then((m) => ({ default: m.CommentFormDialogContent })),
  { ssr: false },
);

interface CommentFormDialogProps {
  articleId: string;
  articleSlug: string;
  userId?: string | null;
  clientId?: string;
  /** The control that opens it — the strip tab, or the button in the empty state. */
  trigger: ReactElement<{ onClick?: () => void; onPointerEnter?: () => void }>;
}

export function CommentFormDialog({ articleId, articleSlug, userId, clientId, trigger }: CommentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Signed out there is no comment box to show, so the trigger opens the one sign-in dialog the
  // whole article shares. It used to open this dialog with its own copy of the Google button
  // under a header promising «اكتب تعليقك… وسيظهر بعد المراجعة» — a title that described a form
  // the reader could not reach.
  if (!userId) {
    return (
      <>
        {cloneElement(trigger, { onClick: () => setOpen(true) })}
        {open && <AuthPromptLazy open onOpenChange={setOpen} action="comment" />}
      </>
    );
  }

  return (
    <>
      {cloneElement(trigger, {
        onPointerEnter: () => void loadContent(),
        onClick: () => {
          trackCtaClick({ type: "FORM", label: "أضف تعليق", targetUrl: "#", articleId, clientId });
          setMounted(true);
          setOpen(true);
        },
      })}
      {mounted && (
        <CommentFormDialogContent open={open} onOpenChange={setOpen} articleId={articleId} articleSlug={articleSlug} />
      )}
    </>
  );
}
