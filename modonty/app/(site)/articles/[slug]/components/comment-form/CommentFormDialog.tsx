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
import { trackCtaClick } from "@/lib/analytics/cta-tracking";

import { CommentForm } from "./CommentForm";
import { AuthPromptLazy } from "../auth-prompt/AuthPromptLazy";
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
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] rounded-xl sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>أضف تعليق</DialogTitle>
          <DialogDescription>اكتب تعليقك على المقال وسيظهر بعد المراجعة.</DialogDescription>
        </DialogHeader>
        <CommentForm
          onSubmit={(content) => submitComment(articleId, articleSlug, content)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
          placeholder="اكتب تعليقك هنا..."
          submitLabel="إرسال التعليق"
        />
      </DialogContent>
    </Dialog>
  );
}
