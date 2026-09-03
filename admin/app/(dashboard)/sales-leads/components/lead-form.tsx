"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronDown, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createLead, updateLead } from "../actions";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadInput } from "../helpers/lead-schema";

const SOURCE_LABEL: Record<string, string> = {
  REFERRAL: "إحالة", AD: "إعلان", SOCIAL: "سوشال",
  SEARCH: "بحث", PERSONAL: "معرفة شخصية", OTHER: "غير كده",
};
const STATUS_LABEL: Record<string, string> = {
  PROSPECT: "محتمل", ACTIVE: "نشط", ARCHIVED: "مؤرشف",
};
const SOCIALS = ["instagram", "facebook", "tiktok", "snapchat", "twitter", "linkedin"] as const;
// أسماء المنصّات بالحروف العربية لا اللاتينية: السطر كلّه عربيّ، وكلمة لاتينية وسطه تكسر
// العين عند كل انتقال بين الاتجاهين. والتسميات هي نفسها التي كتبها الفريق في سكيما المبيعات.
const SOCIAL_LABEL: Record<string, string> = {
  instagram: "انستقرام",
  facebook: "فيسبوك",
  tiktok: "تيك توك",
  snapchat: "سناب شات",
  twitter: "إكس",
  linkedin: "لينكدإن",
};

interface Props {
  leadId?: string;
  industries: { id: string; name: string }[];
  initial?: Partial<LeadInput>;
}

/**
 * One form for both add and edit. The alternative — two forms — is how a field ends up on
 * the create screen and missing from the edit screen, which reads as data loss to whoever
 * typed it. The only difference between the two modes is which action runs on submit.
 */
export function LeadForm({ leadId, industries, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(leadId);

  const [form, setForm] = useState<Record<string, string>>({
    name: initial?.name ?? "",
    company: (initial?.company as string) ?? "",
    phone: (initial?.phone as string) ?? "",
    email: (initial?.email as string) ?? "",
    contactName: (initial?.contactName as string) ?? "",
    contactRole: (initial?.contactRole as string) ?? "",
    city: (initial?.city as string) ?? "",
    website: (initial?.website as string) ?? "",
    googleLocation: (initial?.googleLocation as string) ?? "",
    industryId: (initial?.industryId as string) ?? "",
    countryCode: (initial?.countryCode as string) ?? "",
    source: (initial?.source as string) ?? "",
    status: (initial?.status as string) ?? "PROSPECT",
    notes: (initial?.notes as string) ?? "",
    ...Object.fromEntries(SOCIALS.map((s) => [s, (initial?.[s] as string) ?? ""])),
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // الطيّة تُفتح إن كان خلفها شيء مكتوب. طيٌّ يُخفي بياناتٍ موجودة يُقرأ على أنها ضاعت —
  // وهو أسوأ من نموذجٍ طويل. الحساب من القيم الأوّلية لا من الحالة الجارية، كي لا تنطبق
  // الطيّة تحت يد مَن يمسح آخر حرف في خانةٍ داخلها.
  const [hasExtras] = useState(() =>
    ["city", "website", "googleLocation", ...SOCIALS].some((k) => {
      const v = initial?.[k as keyof LeadInput];
      return typeof v === "string" && v.trim() !== "";
    }),
  );

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Clearing the field's error the moment it is edited: leaving a red message under a box
    // the person is actively fixing tells them their correction did not register.
    if (errors[k]) setErrors((e) => ({ ...e, [k]: [] }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const result = isEdit
      ? await updateLead(leadId!, form as LeadInput)
      : await createLead(form as LeadInput);

    if (result.success) {
      toast({ title: isEdit ? "اتحفظ" : "العميل اتضاف", variant: "success" });
      router.push(`/sales-leads/${result.id}`);
      router.refresh();
      return;
    }

    setSaving(false);
    if (result.fieldErrors) setErrors(result.fieldErrors);
    toast({ title: result.error, variant: "destructive" });
  };

  // `key` on the wrapper, not only where the helper is mapped: the six social inputs are
  // produced by a `.map`, and a helper that returns keyless JSX makes every caller
  // responsible for remembering. Keying it here is the fix that cannot be forgotten later.
  const field = (k: string, label: string, opts: { type?: string; ltr?: boolean; placeholder?: string } = {}) => (
    <div key={k}>
      <Label htmlFor={k} className="text-xs">{label}</Label>
      <Input
        id={k}
        type={opts.type ?? "text"}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={opts.placeholder}
        // Phone, email and URLs are latin runs; inside an RTL page the bidi algorithm
        // reorders their parts on screen while the stored string stays correct.
        dir={opts.ltr ? "ltr" : undefined}
        className={cn("mt-1", errors[k]?.length && "border-destructive")}
        aria-invalid={errors[k]?.length ? true : undefined}
      />
      {errors[k]?.length ? (
        <p className="mt-1 text-[11px] text-destructive">{errors[k][0]}</p>
      ) : null}
    </div>
  );

  const select = (k: string, label: string, options: { v: string; l: string }[], blank: string) => (
    <div>
      <Label htmlFor={k} className="text-xs">{label}</Label>
      <select
        id={k}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">{blank}</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={isEdit ? `/sales-leads/${leadId}` : "/sales-leads"}>
          {/* السهم يدور مع الاتجاه: في صفحة عربية «رجوع» تشير يميناً لا يساراً، وسهمٌ
              يشير عكس المسار يجعل الزرّ يبدو زرَّ تقدّم. */}
          <Button variant="ghost" size="icon" type="button" aria-label="رجوع">
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">{isEdit ? "تعديل بيانات العميل" : "عميل محتمل جديد"}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">مين هو</CardTitle>
              <CardDescription>الاسم بس إلزامي — الباقي املاه لما تعرفه.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {field("name", "الاسم *", { placeholder: "د. محمد الشناوي" })}
              {field("company", "الشركة أو العيادة")}
              {field("phone", "الجوّال", { ltr: true, placeholder: "+2010…" })}
              {field("email", "الإيميل", { type: "email", ltr: true })}
              {field("contactName", "مين نكلّمه")}
              {field("contactRole", "صفته", { placeholder: "المالك · مدير التسويق" })}
            </CardContent>
          </Card>

          {/* تسع خانات خلف طيّة واحدة.
              الحالة الشائعة تسجيلٌ أثناء مكالمة: اسم ورقم وشركة، ثم إغلاق. وإبقاء المدينة
              والموقع وستّة حسابات مفتوحةً يجعل النموذج ثلاثة أضعاف طوله، وكلّها فارغة
              في كل صفٍّ من الصفوف السبعة عشر التي وصلت من النظام القديم — مقيسة، لا مقدَّرة.
              و`<details>` أصليّ: بلا جافاسكربت، ويعمل قبل أن يُحمّل شيء. */}
          <details className="group rounded-lg border bg-card" open={hasExtras}>
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-medium">
              <span>
                تفاصيل زيادة
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  المدينة · الموقع · الحسابات
                </span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="space-y-5 border-t p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {field("city", "المدينة")}
                {field("website", "الموقع", { ltr: true, placeholder: "clinic.com" })}
                <div className="sm:col-span-2">
                  {field("googleLocation", "رابط الموقع على خرايط جوجل", { ltr: true })}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs text-muted-foreground">
                  حساباته — اليوزر أو الرابط كامل، اللي عندك.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {SOCIALS.map((s) => field(s, SOCIAL_LABEL[s], { ltr: true }))}
                </div>
              </div>
            </div>
          </details>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">التصنيف</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {select("status", "الحالة", LEAD_STATUSES.map((s) => ({ v: s, l: STATUS_LABEL[s] })), "محتمل")}
              {select("industryId", "المجال", industries.map((i) => ({ v: i.id, l: i.name })), "مش محدّد")}
              {select("countryCode", "السوق", [{ v: "SA", l: "السعودية" }, { v: "EG", l: "مصر" }], "مش محدّد")}
              {select("source", "جه منين", LEAD_SOURCES.map((s) => ({ v: s, l: SOURCE_LABEL[s] })), "مش محدّد")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={6}
                placeholder="اتقال إيه، طلب إيه، ونتابع معاه إمتى…"
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "بنحفظ…" : isEdit ? "حفظ التعديلات" : "إضافة العميل"}
          </Button>
        </div>
      </div>
    </form>
  );
}
