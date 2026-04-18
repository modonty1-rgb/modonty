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
  requestSlugChangeOtp,
  verifyAndChangeSlug,
} from "../actions/clients-actions/slug-change-otp";

type Step = "idle" | "otp-sent" | "success";

interface SlugChangeDialogProps {
  clientId: string;
  currentSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newName: string, newSlug: string) => void;
}

export function SlugChangeDialog({
  clientId,
  currentSlug,
  open,
  onOpenChange,
  onSuccess,
}: SlugChangeDialogProps) {
  const [step, setStep] = useState<Step>("idle");
  const [otp, setOtp] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const newSlugPreview = newName.trim() ? slugify(newName.trim()) : "";

  function handleClose() {
    if (isPending) return;
    setStep("idle");
    setOtp("");
    setNewName("");
    setError("");
    onOpenChange(false);
  }

  function handleRequestOtp() {
    setError("");
    startTransition(async () => {
      const result = await requestSlugChangeOtp(clientId);
      if (!result.success) {
        setError(result.error ?? "Failed to send OTP");
        return;
      }
      setStep("otp-sent");
    });
  }

  function handleConfirm() {
    if (otp.length < 4) { setError("Enter the 4-digit OTP"); return; }
    if (!newName.trim()) { setError("New client name is required"); return; }
    setError("");
    startTransition(async () => {
      const result = await verifyAndChangeSlug(clientId, otp, newName.trim());
      if (!result.success) {
        setError(result.error ?? "Failed to change slug");
        return;
      }
      setStep("success");
      onSuccess(newName.trim(), newSlugPreview);
      setTimeout(handleClose, 1500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Client Slug</DialogTitle>
        </DialogHeader>

        {step === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current slug:{" "}
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                {currentSlug}
              </span>
            </p>
            <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-[12px] text-yellow-600 dark:text-yellow-400" dir="rtl">
              سيتم إرسال رمز تحقق على Telegram. بعد التحقق، أدخل الاسم الجديد للعميل — سيتم تحديث الرابط والاسم معاً.
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
              OTP sent to Telegram. Enter it below along with the new client name.
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
              <Label>New Client Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. شركة الرياض للتقنية"
                dir="auto"
              />
              {newSlugPreview && (
                <p className="text-[11px] font-mono text-muted-foreground">
                  New slug: <span className="text-emerald-500">{newSlugPreview}</span>
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
                disabled={isPending || otp.length < 4 || !newName.trim()}
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
            <p className="text-[11px] font-mono text-muted-foreground text-center">
              New slug: <span className="text-emerald-500">{newSlugPreview}</span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
