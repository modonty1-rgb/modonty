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
import { cn } from "@/lib/utils";
import { convertLeadToClient } from "../actions";

/**
 * الباقات بأسمائها الحقيقية — تصل من القاعدة عبر `tierLabels`.
 *
 * كانت أسماءً مكتوبةً هنا («الاحترافية») لا وجود لها في أيّ عرضٍ أُرسل لعميل، بينما الاسم
 * المتّفق عليه «الزخم». والترتيب ثابتٌ لأنه ترتيب السعر لا الأبجدية.
 */
const TIER_ORDER = ["BASIC", "STANDARD", "PRO", "PREMIUM"] as const;

interface Props {
  leadId: string;
  leadName: string;
  suggestedSlug: string;
  email: string | null;
  /** الباقة التي عُرضت على العميل فعلاً — هي الافتراضيّ، لا أرخص باقة. */
  expectedTier: string | null;
  /** أسماء الباقات من `modonty_plans`. */
  tierLabels: Record<string, string>;
  /** يمرّره العمود الجانبيّ ليمدّ الزرّ على عرضه — الشكل قرارُ المكان لا قرارُ الحوار. */
  className?: string;
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
export function ConvertDialog({
  leadId, leadName, suggestedSlug, email, expectedTier, tierLabels, className,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState(suggestedSlug);
  const [mail, setMail] = useState(email ?? "");
  /**
   * تبدأ من الباقة المعروضة لا من أرخص باقة.
   *
   * كانت ثابتةً على `BASIC`: تُعرض «الزخم» على العميلة، ثم تُحوَّل فتصير الأرخص — وفرقُ ما
   * بينهما إيرادٌ يضيع بصمت لأن الحوار لا يعرض ما تغيّر.
   *
   * والاحتياطيّ **أوّل باقةٍ في القاعدة** لا `BASIC` المكتوبة هنا: `modonty_plans` لا تحوي
   * صفّاً لـ`BASIC` (مقيس — الحوار كان يعرض `BASIC` خاماً بين «الانطلاقة» و«الزخم»
   * و«الريادة»)، فقيمةٌ لا يقابلها صفّ تُرسل إلى القاعدة أو تُعرض بالإنجليزية في شاشةٍ عربية.
   */
  const [tier, setTier] = useState<string>(
    expectedTier ?? TIER_ORDER.find((t) => tierLabels[t]) ?? "",
  );
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const r = await convertLeadToClient(leadId, { slug, email: mail, subscriptionTier: tier });
    setBusy(false);
    if (r.success) {
      toast({ title: `${leadName} صار عميلاً`, variant: "success" });
      setOpen(false);
      router.refresh();
    } else {
      toast({ title: r.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={cn("gap-1.5", className)}>
          <ArrowLeftRight className="size-3.5 rtl:rotate-180" aria-hidden /> حوّله إلى عميل
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-start">تحويل «{leadName}» لعميل</DialogTitle>
          <DialogDescription className="text-start">
            سيُفتح له حساب على مدونتي وصفحة باسمه. الباقي منقول من بياناته — وهذه الثلاثة
            التي تحتاج تأكيدك.
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
              الإيميل {email ? "" : "— غير موجود عنده، لا بدّ من كتابته"}
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
            <p className="mt-1 text-[11px] text-muted-foreground">يدخل به على لوحته.</p>
          </div>

          <div>
            <Label htmlFor="ctier" className="text-xs">الباقة</Label>
            <select
              id="ctier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {/**
               * الباقة التي لا اسم لها في القاعدة **لا تُعرض إطلاقاً**.
               *
               * كان الشرط `|| t === tier` يُبقيها إن كانت هي المختارة، والمختارة الافتراضية
               * كانت `BASIC` — فظهر المفتاح اللاتينيّ الخام أوّلَ خيارٍ ومحدَّداً وسط ثلاثة
               * أسماء عربية (مقيس في حوار التحويل). والافتراضيّ صار أوّل باقةٍ لها صفّ، فسقط
               * سبب الاستثناء معه.
               */}
              {TIER_ORDER.filter((t) => tierLabels[t]).map((t) => (
                <option key={t} value={t}>{tierLabels[t]}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button onClick={run} disabled={busy || !slug.trim() || !mail.trim()} className="gap-2">
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {busy ? "جارٍ التحويل…" : "حوّله إلى عميل"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
