"use client";

import { cloneElement, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics/cta-tracking";

import { CommentForm } from "@/components/shared/comment-form/CommentForm";
import { AuthPromptLazy } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { submitComment } from "../../actions/submit-comment";

interface CommentFormDialogProps {
  articleId: string;
  articleSlug: string;
  userId?: string | null;
  clientId?: string;
  /** The control that opens it — the strip tab, or the button in the empty state. */
  trigger: ReactElement<{ onClick?: () => void }>;
}

export function CommentFormDialog({ articleId, articleSlug, userId, clientId, trigger }: CommentFormDialogProps) {
  const [open, setOpen] = useState(false);
  // The comment waits for review, so it does not appear on the page. Closing the dialog silently
  // left the reader under «ما فيه تعليقات لحد الآن» thinking it was lost (QA finding #8, 29 Sep
  // 2026) — the dialog now says it arrived, like the reel does.
  const [sent, setSent] = useState(false);
  const router = useRouter();

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          trackCtaClick({ type: "FORM", label: "أضف تعليق", targetUrl: "#", articleId, clientId });
        }
        setOpen(next);
        if (!next) setSent(false);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] rounded-xl sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>أضف تعليق</DialogTitle>
          <DialogDescription>اكتب تعليقك على المقال وسيظهر بعد المراجعة.</DialogDescription>
        </DialogHeader>
        {sent ? (
          <div role="status" className="space-y-3 text-center">
            <p className="rounded-md bg-primary/10 p-3 text-sm font-medium text-primary">
              وصل تعليقك — يظهر بعد مراجعة الشريك.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              تمام
            </Button>
          </div>
        ) : (
          <CommentForm
            onSubmit={(content) => submitComment(articleId, articleSlug, content)}
            onSuccess={() => {
              setSent(true);
              router.refresh();
            }}
            placeholder="اكتب تعليقك هنا..."
            submitLabel="إرسال التعليق"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
