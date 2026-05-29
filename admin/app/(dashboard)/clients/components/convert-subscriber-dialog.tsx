"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { slugify } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { convertSubscriberToClientAction } from "../actions/convert-subscriber-to-client";

interface SubscriberSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  planName: string;
  country: string;
}

interface Props {
  subscriber: SubscriberSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConvertSubscriberDialog({ subscriber, open, onOpenChange }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [slug, setSlug] = useState("");
  const [pending, startTransition] = useTransition();

  // Pre-fill slug from the subscriber's name (editable — final slug is decided in console/OTP).
  useEffect(() => {
    if (open && subscriber) {
      setSlug(slugify(subscriber.name));
    }
  }, [open, subscriber]);

  function handleConvert() {
    if (!subscriber) return;
    const trimmed = slug.trim();
    if (!trimmed) {
      toast({ title: "السلَج مطلوب", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      const res = await convertSubscriberToClientAction({
        subscriberId: subscriber.id,
        slug: trimmed,
      });
      if (res.ok) {
        toast({
          title: "تم تحويل المشترك إلى عميل",
          description: res.warning
            ? res.warning
            : "تم إرسال إيميل الترحيب + حالة العميل PENDING",
        });
        setSlug("");
        onOpenChange(false);
        router.refresh();
      } else {
        toast({ title: "فشل التحويل", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            تحويل {subscriber?.name} إلى عميل
          </DialogTitle>
          <DialogDescription>
            يتم إنشاء عميل بحالة PENDING. السلَج يقدر العميل يعدّله من console قبل التفعيل.
          </DialogDescription>
        </DialogHeader>

        {subscriber && (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1.5">
              <Row label="الاسم" value={subscriber.name} />
              <Row label="الإيميل" value={subscriber.email} />
              <Row label="الجوال" value={subscriber.phone} />
              <Row label="الباقة" value={subscriber.planName} />
              <Row label="الدولة" value={subscriber.country} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="convert-slug">
                السلَج (إجباري) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="convert-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="مثال: عيادة-الابتسامة"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground">
                يظهر في رابط العميل العام. القطاع وبقية البيانات تُكمَّل لاحقاً من صفحة العميل أو console.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button onClick={handleConvert} disabled={pending || !slug.trim()}>
            {pending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            تأكيد التحويل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
