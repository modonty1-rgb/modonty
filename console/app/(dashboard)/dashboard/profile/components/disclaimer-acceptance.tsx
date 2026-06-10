"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScrollText, ShieldCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pending, startTransition] = useTransition();

  const isAccepted = !!acceptedAt && (acceptedVersion ?? 0) >= currentVersion;
  const isReaccept = !!acceptedAt && (acceptedVersion ?? 0) < currentVersion;

  function handleAccept() {
    startTransition(async () => {
      const res = await acceptDisclaimer();
      if (res.success) {
        toast.success("تم تسجيل موافقتك");
        setOpen(false);
        setChecked(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "تعذّر تسجيل الموافقة");
      }
    });
  }

  // Already approved → slim inline badge, no wasted vertical space.
  if (isAccepted) {
    return (
      <Badge
        variant="outline"
        className="h-8 gap-1.5 bg-muted/40 px-3 font-medium text-foreground"
        title={`وافقت على إقرار المسؤولية${acceptedAt ? ` · ${dateFmt.format(acceptedAt)}` : ""} · نسخة ${acceptedVersion}`}
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        وافقت على الإقرار
      </Badge>
    );
  }

  // Not yet approved (or version updated) → compact button that opens the dialog.
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 gap-1.5 rounded-full border-amber-500/50 bg-amber-500/10 px-3 text-xs font-medium text-amber-700 hover:bg-amber-500/15 hover:text-amber-800"
      >
        <ScrollText className="h-3.5 w-3.5" />
        {isReaccept ? "تحديث الإقرار — مطلوب" : "إقرار المسؤولية — مطلوب"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <ScrollText className="h-5 w-5 shrink-0" />
              {isReaccept ? "تحديث إقرار المسؤولية" : "إقرار المسؤولية عن المحتوى"}
            </DialogTitle>
            <DialogDescription>
              اقرأ النص ووافق عليه — موافقتك تُسجَّل باسمك وتاريخها.
            </DialogDescription>
          </DialogHeader>

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

          <DialogFooter>
            <Button onClick={handleAccept} disabled={!checked || pending} className="gap-1.5">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {pending ? "جاري التسجيل..." : "أوافق"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
