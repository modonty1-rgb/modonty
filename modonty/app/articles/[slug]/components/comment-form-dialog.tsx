"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "@/components/link";
import { CommentForm } from "./comment-form";
import { submitComment } from "../actions/comment-actions";
import { useRouter } from "next/navigation";
import { trackCtaClick } from "@/lib/cta-tracking";

interface CommentFormDialogProps {
  articleId: string;
  articleSlug: string;
  userId?: string | null;
  clientId?: string;
  /** Custom trigger (e.g. a strip icon). Defaults to a full-width button. */
  trigger?: ReactNode;
  /** Skip the Card chrome and render just the dialog (for embedding in a thin strip). */
  bare?: boolean;
}

export function CommentFormDialog({ articleId, articleSlug, userId, clientId, trigger, bare }: CommentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (content: string) => {
    return submitComment(articleId, articleSlug, content);
  };

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  const dialog = (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          trackCtaClick({
            type: "FORM",
            label: "أضف تعليق",
            targetUrl: "#",
            articleId,
            clientId,
          });
        }
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="w-full justify-center bg-background border-input text-foreground shadow-sm"
            type="button"
          >
            أضف تعليق
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>أضف تعليق</DialogTitle>
          <DialogDescription>
            اكتب تعليقك على المقال وسيظهر بعد المراجعة.
          </DialogDescription>
        </DialogHeader>
        {userId ? (
          <CommentForm
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            placeholder="اكتب تعليقك هنا..."
            submitLabel="إرسال التعليق"
          />
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              سجّل مجاناً لإضافة تعليق والتفاعل.
            </p>
            <Button asChild variant="default" className="w-full">
              <Link href="/users/register">اشترك مجاناً</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (bare) return dialog;

  return (
    <Card className="min-w-0">
      <div className="px-4 py-3 bg-muted/40 rounded-t-lg">
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">أضف تعليق</span>
      </div>
      <div className="border-b border-border" />
      <CardContent className="p-4 flex flex-col gap-4">{dialog}</CardContent>
    </Card>
  );
}
