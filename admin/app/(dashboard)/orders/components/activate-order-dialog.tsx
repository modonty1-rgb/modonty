"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { activateFromOrder } from "@/lib/orders/activate-from-order";

export type ActivatableOrder = {
  id: string;
  number: string;
  buyerName: string;
  businessName: string | null;
  buyerEmail: string;
  planName: string;
  totalLabel: string;
  termLabel: string;
};

/**
 * حقلان فقط — والباقي معروضٌ للقراءة لا للتعديل.
 *
 * ما يُعرَض (الباقة · المدفوع · المدّة · البريد) مقروءٌ من الطلب، وليس فيه حقلُ إدخالٍ
 * واحد: تغييرُ أيٍّ منها هنا يعني كرتاً يقول غير ما تقوله الفاتورة.
 */
export function ActivateOrderDialog({
  order, open, onOpenChange,
}: {
  order: ActivatableOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !order) return;
    // اسمُ النشاط أوّلاً — هو ما سيظهر على مدونتي. واسمُ المشتري بديلٌ حين لا يُدخله.
    const initial = order.businessName?.trim() || order.buyerName;
    setName(initial);
    setSlug(slugify(initial));
    setSlugTouched(false);
  }, [open, order]);

  function handleName(value: string) {
    setName(value);
    // السلَج يتبع الاسم حتى يلمسه الموظّف، ثمّ يستقلّ — فلا يُمحى ما كتبه بيده.
    if (!slugTouched) setSlug(slugify(value));
  }

  function submit() {
    if (!order) return;
    startTransition(async () => {
      const res = await activateFromOrder({ orderId: order.id, name: name.trim(), slug: slug.trim() });
      if (!res.ok) {
        toast({ title: "لم يُفعَّل", description: res.error, variant: "destructive" });
        return;
      }
      toast({
        title: `فُعّل ${name.trim()}`,
        description: res.warning ?? (res.emailSent ? "أُرسل إيميل الترحيب ببيانات الدخول." : "الحساب جاهز."),
        variant: res.warning ? "destructive" : undefined,
      });
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-4" />
            تفعيل عميل — الطلب {order?.number}
          </DialogTitle>
          <DialogDescription>
            الباقة والسعر والمدّة تُقرأ من الطلب ولا تُسأل هنا. المطلوب الاسم والسلَج.
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            <dl className="space-y-1.5 rounded-md border bg-muted/40 p-3 text-sm">
              <Row label="الباقة" value={order.planName} />
              <Row label="المدفوع" value={order.totalLabel} />
              <Row label="المدّة" value={order.termLabel} />
              <Row label="البريد" value={order.buyerEmail} />
            </dl>

            <div className="space-y-2">
              <Label htmlFor="activate-name">اسم العميل <span className="text-destructive">*</span></Label>
              <Input id="activate-name" value={name} onChange={(e) => handleName(e.target.value)} dir="rtl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activate-slug">السلَج <span className="text-destructive">*</span></Label>
              <Input
                id="activate-slug"
                value={slug}
                onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
                dir="ltr"
                className="text-start"
              />
              <p className="text-xs text-muted-foreground">
                يظهر في رابط العميل على مدونتي — تغييرُه بعد النشر يكسر روابط، فانظر إليه الآن.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>إلغاء</Button>
          <Button onClick={submit} disabled={pending || !name.trim() || !slug.trim()}>
            {pending && <Loader2 className="me-2 size-4 animate-spin" />}
            فعّل الحساب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
