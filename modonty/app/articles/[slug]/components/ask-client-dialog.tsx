"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "@/components/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { askClientSchema, type AskClientFormData } from "../helpers/schemas/ask-client-schema";
import { submitAskClient, fetchPendingFaqsForArticle } from "../actions/ask-client-actions";
import { Badge } from "@/components/ui/badge";

interface PendingFaq {
  id: string;
  question: string;
  createdAt: Date;
}

interface AskClientDialogProps {
  articleId: string;
  clientId: string;
  articleTitle?: string;
  user: { name: string | null; email: string | null } | null;
  pendingFaqs?: PendingFaq[];
  /** When true, render content only (no Card) for embedding inside another card */
  embedInCard?: boolean;
}

export function AskClientDialog({
  articleId,
  clientId,
  articleTitle,
  user,
  pendingFaqs: pendingFaqsProp,
  embedInCard = false,
}: AskClientDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingFaqsLocal, setPendingFaqsLocal] = useState<PendingFaq[] | null>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const pendingFaqs = pendingFaqsProp ?? pendingFaqsLocal ?? [];
  const useLazyPending = pendingFaqsProp === undefined;

  useEffect(() => {
    if (!pendingOpen || !useLazyPending || !user?.email) return;
    setPendingLoading(true);
    setPendingError(null);
    fetchPendingFaqsForArticle(articleId)
      .then(setPendingFaqsLocal)
      .catch(() => setPendingError("فشل تحميل الأسئلة المعلقة"))
      .finally(() => setPendingLoading(false));
  }, [pendingOpen, useLazyPending, articleId, user?.email]);

  const retryPending = () => {
    setPendingError(null);
    setPendingLoading(true);
    fetchPendingFaqsForArticle(articleId)
      .then(setPendingFaqsLocal)
      .catch(() => setPendingError("فشل تحميل الأسئلة المعلقة"))
      .finally(() => setPendingLoading(false));
  };

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
    setOpen(false);
    if (useLazyPending) {
      const next = await fetchPendingFaqsForArticle(articleId);
      setPendingFaqsLocal(Array.isArray(next) ? next : []);
    }
    router.refresh();
  };

  const content = (
    <>
      {isLoggedIn && (
        <Dialog open={pendingOpen} onOpenChange={setPendingOpen}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-muted-foreground hover:text-foreground"
            type="button"
            onClick={() => setPendingOpen(true)}
          >
            أسئلتك المعلقة{pendingFaqs.length > 0 ? ` (${pendingFaqs.length})` : ""}
          </Button>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>أسئلتك المعلقة</DialogTitle>
              <DialogDescription>الأسئلة التي أرسلتها وتنتظر الرد.</DialogDescription>
            </DialogHeader>
            {pendingLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            ) : pendingError ? (
              <div className="py-4 text-center">
                <p className="text-sm text-destructive mb-2">{pendingError}</p>
                <Button variant="outline" size="sm" onClick={retryPending}>إعادة المحاولة</Button>
              </div>
            ) : pendingFaqs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">لا توجد أسئلة معلقة</p>
            ) : (
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                {pendingFaqs.map((faq) => (
                  <li key={faq.id}>
                    <Card className="p-3">
                      <p className="text-sm text-foreground">{faq.question}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        قيد المراجعة
                      </Badge>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-center bg-background border-input text-foreground shadow-sm"
            type="button"
          >
            اسأل العميل
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>اسأل العميل</DialogTitle>
            <DialogDescription>
              {articleTitle ? `اطرح سؤالك حول: ${articleTitle}` : "اطرح سؤالك وسيتم الرد عليه لاحقاً."}
            </DialogDescription>
          </DialogHeader>
          {!isLoggedIn ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                يجب تسجيل الدخول لطرح سؤال.
              </p>
              <Button asChild variant="default" className="w-full">
                <Link href="/users/login">تسجيل الدخول</Link>
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
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
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
    </>
  );

  if (embedInCard) {
    return (
      <div className="flex flex-col gap-4 border-t border-border pt-4 mt-2">
        {content}
      </div>
    );
  }

  return (
    <Card className="min-w-0">
      <CardContent className="p-4 flex flex-col gap-4">
        {content}
      </CardContent>
    </Card>
  );
}
