"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScrollText, ShieldCheck, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { acceptDisclaimer } from "../actions/profile-actions";

interface DisclaimerAcceptanceProps {
  text: string;
  currentVersion: number;
  acceptedVersion: number | null;
  acceptedAt: Date | null;
}

const dateFmt = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });

export function DisclaimerAcceptance({
  text,
  currentVersion,
  acceptedVersion,
  acceptedAt,
}: DisclaimerAcceptanceProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [pending, startTransition] = useTransition();

  const isAccepted = !!acceptedAt && (acceptedVersion ?? 0) >= currentVersion;
  const isReaccept = !!acceptedAt && (acceptedVersion ?? 0) < currentVersion;

  function handleAccept() {
    startTransition(async () => {
      const res = await acceptDisclaimer();
      if (res.success) {
        toast.success("تم تسجيل موافقتك");
        router.refresh();
      } else {
        toast.error(res.error ?? "تعذّر تسجيل الموافقة");
      }
    });
  }

  if (isAccepted) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-start gap-3 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-700">وافقت على إقرار المسؤولية عن المحتوى</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {acceptedAt ? dateFmt.format(acceptedAt) : ""} · نسخة {acceptedVersion}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <div className="flex items-start gap-3 border-b border-amber-500/20 p-4">
        <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-700">
            {isReaccept
              ? "تحديث إقرار المسؤولية — يلزم موافقتك من جديد"
              : "إقرار المسؤولية عن المحتوى — مطلوب"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            اقرأ النص ووافق عليه — موافقتك تُسجَّل باسمك وتاريخها.
          </p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-lg border bg-background p-4 text-sm leading-relaxed text-foreground" dir="rtl">
          {text}
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm font-medium">
            موافق وأتحمّل المسؤولية الكاملة عن كل ما أزوّد به مدوّنتي
          </span>
        </label>
        <Button onClick={handleAccept} disabled={!checked || pending} className="gap-1.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {pending ? "جاري التسجيل..." : "أوافق"}
        </Button>
      </div>
    </Card>
  );
}
