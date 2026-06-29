"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { slugify } from "@/lib/utils";
import {
  requestArticleSlugOtp,
  verifyAndChangeArticleSlug,
} from "../actions/articles-actions/article-slug-otp";

type Step = "idle" | "otp-sent" | "success";

interface ArticleSlugChangeDialogProps {
  articleId: string;
  currentSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newSlug: string) => void;
}

export function ArticleSlugChangeDialog({
  articleId,
  currentSlug,
  open,
  onOpenChange,
  onSuccess,
}: ArticleSlugChangeDialogProps) {
  const [step, setStep] = useState<Step>("idle");
  const [otp, setOtp] = useState("");
  const [newSlugInput, setNewSlugInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const newSlugPreview = newSlugInput.trim() ? slugify(newSlugInput.trim()) : "";

  function handleClose() {
    if (isPending) return;
    setStep("idle");
    setOtp("");
    setNewSlugInput("");
    setError("");
    onOpenChange(false);
  }

  function handleRequestOtp() {
    setError("");
    startTransition(async () => {
      const result = await requestArticleSlugOtp(articleId);
      if (!result.success) {
        setError(result.error ?? "Failed to send OTP");
        return;
      }
      setStep("otp-sent");
    });
  }

  function handleConfirm() {
    if (otp.length < 4) { setError("Enter the 4-digit OTP"); return; }
    if (!newSlugInput.trim()) { setError("New slug is required"); return; }
    setError("");
    startTransition(async () => {
      const result = await verifyAndChangeArticleSlug(articleId, otp, newSlugInput.trim());
      if (!result.success) {
        setError(result.error ?? "Failed to change slug");
        return;
      }
      setStep("success");
      onSuccess(result.newSlug!);
      setTimeout(handleClose, 1500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Article Slug</DialogTitle>
        </DialogHeader>

        {step === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current slug:{" "}
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded" dir="ltr">
                {currentSlug}
              </span>
            </p>
            <div
              className="rounded-md bg-yellow-50 border border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20 px-3 py-2 text-[12px] text-yellow-700 dark:text-yellow-400"
              dir="rtl"
            >
              تغيير الرابط سيكسر أي روابط مفهرسة في Google. سيُرسَل رمز تحقق على Telegram — أدخله مع الرابط الجديد للتأكيد.
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleRequestOtp} disabled={isPending} className="w-full">
              {isPending ? "Sending OTP..." : "Send OTP via Telegram"}
            </Button>
          </div>
        )}

        {step === "otp-sent" && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              OTP sent to Telegram. Enter it below with the new slug.
            </p>

            <div className="space-y-2">
              <Label>OTP Code</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Slug</Label>
              <Input
                value={newSlugInput}
                onChange={(e) => setNewSlugInput(e.target.value)}
                onBlur={(e) => setNewSlugInput(slugify(e.target.value))}
                placeholder="e.g. افضل-عيادات-الاسنان-جدة"
                dir="ltr"
                className="font-mono text-sm"
              />
              {newSlugPreview && (
                <p className="text-[11px] font-mono text-muted-foreground">
                  modonty.com/articles/<span className="text-emerald-500">{newSlugPreview}</span>
                </p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isPending || otp.length < 4 || !newSlugInput.trim()}
                className="flex-1"
              >
                {isPending ? "Confirming..." : "Confirm Change"}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="text-3xl">✅</span>
            <p className="text-sm font-medium">Slug changed successfully</p>
            <p className="text-[11px] font-mono text-muted-foreground">
              New slug: <span className="text-emerald-500">{newSlugPreview}</span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
