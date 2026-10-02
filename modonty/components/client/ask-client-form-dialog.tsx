"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { askClientSchema, type AskClientFormData } from "./ask-client-schema";
import { submitAskClient } from "./submit-ask-client";

export interface AskClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  clientName?: string;
  articleTitle?: string;
  user: { name: string | null; email: string | null } | null;
}

/**
 * The «ask the client» form — loaded only when a reader taps the trigger in `AskClientDialog`
 * (plan أ١, 3 Oct 2026). Dialog + react-hook-form + zod were in the article's first load for a
 * form most readers never open.
 */
export function AskClientFormDialog({ open, onOpenChange, articleId, clientName, articleTitle, user }: AskClientFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLoggedIn = Boolean(user?.email);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AskClientFormData>({
    resolver: zodResolver(askClientSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      question: "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name ?? "");
      setValue("email", user.email ?? "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: AskClientFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitAskClient(data, articleId);
    setIsSubmitting(false);
    if (!result.success) {
      setSubmitError(result.error ?? "فشل إرسال السؤال");
      return;
    }
    reset();
    onOpenChange(false);
    // Server Component re-fetches pendingFaqs from page.tsx Promise.all
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{clientName ? `تواصل مع ${clientName}` : "اسأل العميل"}</DialogTitle>
          <DialogDescription>
            {articleTitle ? `اطرح سؤالك حول: ${articleTitle}` : "اطرح سؤالك وسيتم الرد عليه لاحقاً."}
          </DialogDescription>
        </DialogHeader>
        {!isLoggedIn ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              سجّل مجاناً لطرح سؤالك على الشركة.
            </p>
            <Button asChild variant="default" className="w-full">
              <Link href="/users/register">سجّل مجاناً</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {submitError && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{submitError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="ask-name">الاسم</Label>
              <Input
                id="ask-name"
                {...register("name")}
                placeholder="الاسم"
                className="text-right bg-muted"
                readOnly
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ask-email">البريد الإلكتروني</Label>
              <Input
                id="ask-email"
                type="email"
                {...register("email")}
                placeholder="example@email.com"
                className="text-right bg-muted"
                readOnly
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ask-question">السؤال</Label>
              <Textarea
                id="ask-question"
                {...register("question")}
                placeholder="اكتب سؤالك هنا..."
                rows={4}
                className="text-right resize-none"
              />
              {errors.question && (
                <p className="text-sm text-destructive">{errors.question.message}</p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإرسال..." : "إرسال السؤال"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
