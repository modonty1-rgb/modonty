"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { CommentForm } from "@/components/shared/comment-form/CommentForm";
import { submitComment } from "../../actions/submit-comment";

/**
 * The comment box itself — Dialog + the form and its validation. Loaded only when a signed-in
 * reader taps «أضف تعليق» (see CommentFormDialog); it was in every article's first load
 * (plan أ١, 3 Oct 2026).
 */
export function CommentFormDialogContent({
  open,
  onOpenChange,
  articleId,
  articleSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  articleSlug: string;
}) {
  // The comment waits for review, so it does not appear on the page. Closing the dialog silently
  // left the reader under «ما فيه تعليقات لحد الآن» thinking it was lost (QA finding #8, 29 Sep
  // 2026) — the dialog now says it arrived, like the reel does.
  const [sent, setSent] = useState(false);
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setSent(false);
      }}
    >
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
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
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
