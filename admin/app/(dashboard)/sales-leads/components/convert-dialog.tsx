"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { convertLeadToClient } from "../actions";

const TIERS = [
  { v: "BASIC", l: "الأساسية" },
  { v: "STANDARD", l: "المتوسّطة" },
  { v: "PRO", l: "الاحترافية" },
  { v: "PREMIUM", l: "المتميّزة" },
] as const;

interface Props {
  leadId: string;
  leadName: string;
  suggestedSlug: string;
  email: string | null;
}

/**
 * The one-way door in this screen, so it asks before it opens.
 *
 * Only three things are collected — the three `Client` refuses to be created without. Every
 * other field the lead already carries (phone, website, industry, and the rep who recorded
 * it) is passed straight through, so Faten is not asked twice for what she already typed.
 *
 * The slug arrives already checked against existing clients, so the usual case is one click.
 */
export function ConvertDialog({ leadId, leadName, suggestedSlug, email }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState(suggestedSlug);
  const [mail, setMail] = useState(email ?? "");
  const [tier, setTier] = useState<string>("BASIC");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const r = await convertLeadToClient(leadId, { slug, email: mail, subscriptionTier: tier });
    setBusy(false);
    if (r.success) {
      toast({ title: `${leadName} بقى عميل`, variant: "success" });
      setOpen(false);
      router.refresh();
    } else {
      toast({ title: r.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <ArrowLeftRight className="size-3.5 rtl:rotate-180" aria-hidden /> حوّله لعميل
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-start">تحويل «{leadName}» لعميل</DialogTitle>
          <DialogDescription className="text-start">
            هيتفتح له حساب على مدونتي وصفحة باسمه. الباقي منقول من بياناته — دي التلاتة
            اللي لازم تتأكّد منها.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cslug" className="text-xs">عنوان صفحته على مدونتي</Label>
            <Input
              id="cslug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              dir="ltr"
              className="mt-1 font-mono text-xs"
            />
            {/* العنوان الحقيقي كما سيُفتح، لا وصفٌ له: رؤيته قبل الضغط تكشف الخطأ المطبعيّ
                بينما تصحيحه ما زال مجّانياً — بعدها يصير تغييرَ عنوانٍ منشور. */}
            <p className="mt-1 text-[11px] text-muted-foreground" dir="ltr">
              modonty.com/clients/{slug || "…"}
            </p>
          </div>

          <div>
            <Label htmlFor="cmail" className="text-xs">
              الإيميل {email ? "" : "— مش موجود عنده، لازم تكتبه"}
            </Label>
            <Input
              id="cmail"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              dir="ltr"
              placeholder="owner@clinic.com"
              className="mt-1"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">بيدخل بيه على لوحته.</p>
          </div>

          <div>
            <Label htmlFor="ctier" className="text-xs">الباقة</Label>
            <select
              id="ctier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIERS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button onClick={run} disabled={busy || !slug.trim() || !mail.trim()} className="gap-2">
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {busy ? "بنحوّله…" : "حوّله لعميل"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
