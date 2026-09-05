import {
  Building2, Globe, Mail, MapPin, MessageCircle, Phone, StickyNote, User,
} from "lucide-react";

import { DetailRow } from "./detail-row";

import { Card, CardContent } from "@/components/ui/card";
import { MARKET_LABEL } from "../helpers/markets";
import { waNumber } from "../helpers/funnel";
import type { LeadDetail } from "../helpers/get-lead";

const SOCIALS = [
  ["instagram", "انستقرام"], ["facebook", "فيسبوك"], ["tiktok", "تيك توك"],
  ["snapchat", "سناب شات"], ["twitter", "إكس"], ["linkedin", "لينكدإن"],
] as const;

const dateFmt = new Intl.DateTimeFormat("ar-SA", {
  day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh",
});

/** عنوان قسمٍ داخل البطاقة — لا `CardHeader` لكل قسم: أربع بطاقات في عمودٍ ضيّق أربعة إطارات. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t px-3 py-2 first:border-t-0">
      <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
        {title}
      </div>
      {children}
    </div>
  );
}

/**
 * العمود الثابت يميناً — **مَن هو**.
 *
 * بيانات مرجعية تُقرأ لمحةً قبل المكالمة ثم لا تُلمس، وكانت تأخذ عرض الصفحة كلّه في بطاقتين
 * ارتفاعهما `244 + 244` (مقيس) فوق السجلّ — أي أن أكثر ما تستعمله المندوبة (تسجيل المكالمة)
 * كان تحت الطيّة دائماً. صارت هنا: تُرى كلّها بلا تمرير، والوسط للعمل.
 */
export function LeadProfileRail({
  lead,
  sourceLabel,
}: {
  lead: LeadDetail;
  /** اسم المصدر كما يقرأه البشر — يشمل المقفول، فاسم مصدرٍ أُقفل يبقى مقروءاً عند عميلٍ قديم. */
  sourceLabel: string | null;
}) {
  const editHref = `/sales-leads/${lead.id}/edit`;
  const waDigits = waNumber(lead.phone, lead.countryCode);
  const socials = SOCIALS.filter(([k]) => lead[k as keyof LeadDetail]);
  const hasWhere = lead.city || lead.website || lead.googleLocation;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Section title="التواصل">
          <DetailRow icon={Phone} label="الجوّال" editHref={editHref}>
            {lead.phone ? (
              <span className="flex flex-wrap items-center gap-2">
                <a href={`tel:${lead.phone}`} className="font-mono text-[13px] underline-offset-4 hover:underline">
                  <bdi dir="ltr">{lead.phone}</bdi>
                </a>
                {waDigits && (
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-6 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-400"
                    aria-label="افتح واتساب"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                  </a>
                )}
              </span>
            ) : null}
          </DetailRow>

          <DetailRow icon={Mail} label="الإيميل" editHref={editHref}>
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className="underline underline-offset-4">
                <bdi dir="ltr">{lead.email}</bdi>
              </a>
            ) : null}
          </DetailRow>

          <DetailRow icon={User} label="من نكلّمه" editHref={editHref}>
            {lead.contactName
              ? [lead.contactName, lead.contactRole].filter(Boolean).join(" · ")
              : null}
          </DetailRow>
        </Section>

        <Section title="التصنيف">
          <DetailRow icon={Building2} label="المجال" editHref={editHref}>
            {lead.industry?.name ?? (lead.industryOther ? `${lead.industryOther} — غير مربوط` : null)}
          </DetailRow>

          <DetailRow icon={MapPin} label="السوق" editHref={editHref}>
            {lead.countryCode ? MARKET_LABEL[lead.countryCode] ?? lead.countryCode : null}
          </DetailRow>

          <DetailRow icon={Globe} label="من أين وصل" editHref={editHref}>
            {lead.source ? (
              <span className="flex flex-wrap items-center gap-1.5">
                {sourceLabel ?? lead.source}
                {/* «إعلان» لصيقةٌ بالقناة لا سطرٌ ثانٍ: هي صفةٌ لها، وقراءتهما معاً
                    «انستقرام · إعلان» هي الجملة التي تُقال فعلاً.
                    و`amber-800` لا `700` في الفاتح: المقيس على خلفيّته `4.48:1` — تحت عتبة
                    `4.5` بشعرة، وهي لصيقةٌ تُقرأ لا زينة. */}
                {lead.isPaidAd && (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-400">
                    إعلان
                  </span>
                )}
              </span>
            ) : null}
          </DetailRow>

          {/* يظهر الموجود منهما فقط — فلا يقرأ أحد صفّاً لا يعنيه. */}
          {lead.isPaidAd && lead.campaign && (
            <DetailRow icon={Globe} label="الحملة">{lead.campaign}</DetailRow>
          )}
          {!lead.isPaidAd && lead.sourceNote && (
            <DetailRow icon={StickyNote} label="ملاحظة على المصدر">{lead.sourceNote}</DetailRow>
          )}
        </Section>

        {hasWhere && (
          <Section title="المكان">
            {lead.city && <DetailRow icon={MapPin} label="المدينة">{lead.city}</DetailRow>}
            {lead.website && (
              <DetailRow icon={Globe} label="الموقع">
                <a
                  href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  <bdi dir="ltr">{lead.website}</bdi>
                </a>
              </DetailRow>
            )}
            {lead.googleLocation && (
              <DetailRow icon={MapPin} label="خرائط جوجل">
                <a
                  href={lead.googleLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  افتح على الخريطة
                </a>
              </DetailRow>
            )}
          </Section>
        )}

        {socials.length > 0 && (
          <Section title="حساباته">
            <div className="flex flex-wrap gap-1.5 pt-1">
              {socials.map(([k, label]) => {
                const v = String(lead[k as keyof LeadDetail]);
                const href = v.startsWith("http") ? v : null;
                return href ? (
                  <a
                    key={k}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-2.5 py-1 text-[11px] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {label}
                  </a>
                ) : (
                  <span key={k} className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
                    {label}: <bdi dir="ltr">{v}</bdi>
                  </span>
                );
              })}
            </div>
          </Section>
        )}

        {/* مَن سجّله ومتى — سطرٌ واحد في القاع، وهو أقلّ ما يُسأل عنه فأخذ أصغر مكان. */}
        <div className="border-t bg-muted/30 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          أُضيف {dateFmt.format(lead.createdAt)}
          {lead.createdBy?.name ? ` — سجّله ${lead.createdBy.name}` : ""}
        </div>
      </CardContent>
    </Card>
  );
}
