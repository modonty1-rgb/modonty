import Link from "next/link";
import {
  ArrowLeftRight, ArrowRight, Building2, CalendarClock, Globe, Mail, MapPin,
  MessageCircle, Pencil, Phone, StickyNote, User, Wallet,
} from "lucide-react";

import { ConvertDialog } from "./convert-dialog";
import { LostDialog, ReopenButton } from "./lost-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DUE_TONE, LOST_LABEL, STAGE_DOT, STAGE_LABEL, TIER_LABEL,
  describeDue, formatMoney, type Stage,
} from "../helpers/funnel";
import type { LeadDetail } from "../helpers/get-lead";

/* لا قائمة ثابتة هنا: الاسم يصل محلولاً من الصفحة، ومصدره `lead_source_options`. */
const COUNTRY_LABEL: Record<string, string> = { SA: "السعودية", EG: "مصر" };
const SOCIALS = [
  ["instagram", "انستقرام"], ["facebook", "فيسبوك"], ["tiktok", "تيك توك"],
  ["snapchat", "سناب شات"], ["twitter", "إكس"], ["linkedin", "لينكدإن"],
] as const;

const dateFmt = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  timeZone: "Asia/Riyadh",
});

/** A row that draws nothing when it has nothing — an empty card of dashes says less than a short one. */
function Row({ icon: Icon, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

export function LeadCard({
  lead,
  suggestedSlug,
  sourceLabel,
}: {
  lead: LeadDetail;
  suggestedSlug: string;
  /** اسم المصدر كما يقرأه البشر. يسقط إلى القيمة المخزَّنة لو حُذف صفّه. */
  sourceLabel: string | null;
}) {
  // المرحلة تُقرأ من الصفّ مباشرةً بلا حالةٍ محلّية: لم يبقَ في هذه البطاقة ما يحرّكها، وحالةٌ
  // محلّية لا يكتبها أحد تصير نسخةً ثانية تتأخّر عن الصفّ بعد أوّل تحديث من مكانٍ آخر.
  const stage = lead.stage as Stage;

  const waDigits = (lead.phone ?? "").replace(/[^\d]/g, "");
  const socials = SOCIALS.filter(([k]) => lead[k as keyof LeadDetail]);
  const hasWhere = lead.city || lead.website || lead.googleLocation;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link href="/sales-leads">
            <Button variant="ghost" size="icon" type="button"><ArrowRight className="size-4 rtl:rotate-180" /></Button>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight">{lead.name}</h1>
              <Badge variant="outline" className="gap-1.5 text-[11px]">
                <span className={cn("size-1.5 rounded-full", STAGE_DOT[stage])} aria-hidden />
                {STAGE_LABEL[stage]}
              </Badge>
            </div>
            {lead.company && <p className="mt-0.5 text-sm text-muted-foreground">{lead.company}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/sales-leads/${lead.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="size-3.5" aria-hidden /> تعديل
            </Button>
          </Link>
          {/* بابٌ يُفتح مرّة: بعد التحويل يصير الزرّ رابطاً إلى العميل، لا زرّاً يُضغط ثانيةً
              فيقول «اتحوّل قبل كده». الحالة تُقرأ من الصفّ لا من ذاكرة الشاشة. */}
          {lead.convertedClientId ? (
            <Link href={`/clients/${lead.convertedClientId}`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <ArrowLeftRight className="size-3.5 rtl:rotate-180" aria-hidden /> افتح صفحته كعميل
              </Button>
            </Link>
          ) : stage === "LOST" ? (
            <ReopenButton leadId={lead.id} />
          ) : (
            <>
              <LostDialog leadId={lead.id} leadName={lead.name} />
              <ConvertDialog
                leadId={lead.id}
                leadName={lead.name}
                suggestedSlug={suggestedSlug}
                email={lead.email}
              />
            </>
          )}
        </div>
      </div>

      {/**
       * ── حُذف شريط المراحل من هنا ──────────────────────────────────────────────────────
       *
       * كان يحرّك المرحلة بضغطة، وهو **ثقبٌ في التاريخ**: المرحلة تتحرّك بلا سطرٍ يقول لماذا،
       * فتُقرأ القصة «كان جديداً ثم صار يفاوض» بلا ما بينهما. والجدول كلّه بُني لأجل ذلك
       * «بينهما» (خالد ٤ سبتمبر: «قصة حياته كاملة في الـfollow up»).
       *
       * وكان كذلك مصدراً ثانياً لنفس الفعل: قِيس حيّاً — زرّان بنصّ «بعتّ عرض» في صفحةٍ
       * واحدة، أحدهما هنا والآخر في نموذج المتابعة.
       *
       * فصارت القسمة: الحركة الطبيعية من **نموذج المتابعة** (ومعها سببها وتاريخها)،
       * والتصحيح من **صفحة التعديل**، والعرض من الشارة جوار الاسم فوق.
       */}
      {stage === "WON" || stage === "LOST" ? (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 py-3 text-sm">
            <span className={cn("size-2 rounded-full", STAGE_DOT[stage])} aria-hidden />
            {stage === "WON" ? "العميل ده اتقفل وبقى عميل عندنا." : "العميل ده اتقفل كخسارة."}
            {/* السبب هو كل الفائدة من تسجيل الخسارة — فيُعرض حيث تُعرض الخسارة، لا في تقرير
                منفصل يُفتح مرّة في السنة. */}
            {stage === "LOST" && lead.lostReason && (
              <span className="font-medium">
                — {LOST_LABEL[lead.lostReason as keyof typeof LOST_LABEL] ?? lead.lostReason}
              </span>
            )}
            {stage === "LOST" && lead.lostNote && (
              <span className="text-muted-foreground">«{lead.lostNote}»</span>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">التواصل</CardTitle></CardHeader>
          <CardContent className="divide-y">
            <Row icon={Phone} label="الجوّال">
              {lead.phone ? (
                <span className="flex items-center gap-2">
                  <bdi dir="ltr" className="font-mono text-[13px]">{lead.phone}</bdi>
                  {waDigits && (
                    <a
                      href={`https://wa.me/${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400"
                      aria-label="افتح واتساب"
                    >
                      <MessageCircle className="size-4" aria-hidden />
                    </a>
                  )}
                </span>
              ) : <span className="text-muted-foreground">—</span>}
            </Row>
            <Row icon={Mail} label="الإيميل">
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="underline underline-offset-2">
                  <bdi dir="ltr">{lead.email}</bdi>
                </a>
              ) : <span className="text-muted-foreground">—</span>}
            </Row>
            <Row icon={User} label="مين نكلّمه">
              {lead.contactName
                ? [lead.contactName, lead.contactRole].filter(Boolean).join(" · ")
                : <span className="text-muted-foreground">—</span>}
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">التصنيف</CardTitle></CardHeader>
          <CardContent className="divide-y">
            <Row icon={Building2} label="المجال">
              {lead.industry?.name ?? (
                <span className="text-amber-600 dark:text-amber-400">مش مربوط</span>
              )}
            </Row>
            <Row icon={MapPin} label="السوق">
              {lead.countryCode
                ? COUNTRY_LABEL[lead.countryCode] ?? lead.countryCode
                : <span className="text-muted-foreground">—</span>}
            </Row>
            <Row icon={Globe} label="جه منين">
              {lead.source
                ? <>
                    {sourceLabel ?? lead.source}
                    {/* «إعلان» لصيقةٌ بالقناة لا سطرٌ ثانٍ: هي صفةٌ لها، وقراءتهما معاً
                        «انستقرام · إعلان» هي الجملة التي تُقال فعلاً. */}
                    {lead.isPaidAd && (
                      <span className="ms-1.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                        إعلان
                      </span>
                    )}
                  </>
                : <span className="text-muted-foreground">—</span>}
            </Row>
            {/* يظهر الموجود منهما فقط — فلا يقرأ أحد «مش محدّد» في صفٍّ لا يعنيه. */}
            {lead.isPaidAd && lead.campaign && (
              <Row icon={Globe} label="الحملة">{lead.campaign}</Row>
            )}
            {!lead.isPaidAd && lead.sourceNote && (
              <Row icon={Globe} label="ملاحظة">{lead.sourceNote}</Row>
            )}
          </CardContent>
        </Card>

        {hasWhere && (
          <Card>
            <CardHeader><CardTitle className="text-base">المكان</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {lead.city && <Row icon={MapPin} label="المدينة">{lead.city}</Row>}
              {lead.website && (
                <Row icon={Globe} label="الموقع">
                  <a
                    href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    <bdi dir="ltr">{lead.website}</bdi>
                  </a>
                </Row>
              )}
              {lead.googleLocation && (
                <Row icon={MapPin} label="خرايط جوجل">
                  <a href={lead.googleLocation} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    افتح على الخريطة
                  </a>
                </Row>
              )}
            </CardContent>
          </Card>
        )}

        {socials.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">حساباته</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {socials.map(([k, label]) => {
                const v = String(lead[k as keyof LeadDetail]);
                const href = v.startsWith("http") ? v : null;
                return href ? (
                  <a
                    key={k}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                  >
                    {label}
                  </a>
                ) : (
                  <span key={k} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    {label}: <bdi dir="ltr">{v}</bdi>
                  </span>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* الصفقة — حلّت محلّ كرت «ملاحظات».
            الملاحظات كانت عموداً واحداً يمسحه كل حفظ، وصارت سجلّاً كاملاً تحت هذا الشبكة.
            ومكانها هنا صار للسؤال الذي لم يكن يُسأل: بكام، وأي باقة، ومتى نرجع له. */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">الصفقة</CardTitle></CardHeader>
          <CardContent className="grid gap-x-6 gap-y-1 sm:grid-cols-3">
            <Row icon={Wallet} label="الباقة اللي مهتمّ بيها">
              {lead.expectedTier
                ? TIER_LABEL[lead.expectedTier] ?? lead.expectedTier
                : <span className="text-muted-foreground">لسه مش معروف</span>}
            </Row>
            <Row icon={Wallet} label="متوقّع في الشهر">
              {formatMoney(lead.expectedMonthly, lead.currency) ?? (
                <span className="text-muted-foreground">مش محدّد</span>
              )}
            </Row>
            <Row icon={CalendarClock} label="الموعد الجاي">
              {(() => {
                const due = describeDue(lead.nextActionAt);
                return (
                  <span className={DUE_TONE[due.tone]}>
                    {due.text}
                    {lead.nextActionNote ? ` — ${lead.nextActionNote}` : ""}
                  </span>
                );
              })()}
            </Row>
          </CardContent>
        </Card>
      </div>

      <p className="text-[11px] text-muted-foreground">
        <StickyNote className="me-1 inline size-3" aria-hidden />
        اتضاف {dateFmt.format(lead.createdAt)}
        {lead.createdBy?.name ? ` — سجّله ${lead.createdBy.name}` : ""}
        {lead.convertedClientId ? " · اتحوّل لعميل" : ""}
      </p>
    </div>
  );
}
