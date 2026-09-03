"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight, ArrowRight, Building2, Globe, Loader2, Mail, MapPin,
  MessageCircle, Pencil, Phone, StickyNote, User,
} from "lucide-react";

import { ConvertDialog } from "./convert-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { setLeadStatus } from "../actions";
import type { LeadDetail } from "../helpers/get-lead";

const STATUS_LABEL: Record<string, string> = { PROSPECT: "محتمل", ACTIVE: "نشط", ARCHIVED: "مؤرشف" };
const STATUS_TONE: Record<string, string> = {
  PROSPECT: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  ARCHIVED: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};
const SOURCE_LABEL: Record<string, string> = {
  REFERRAL: "إحالة", AD: "إعلان", SOCIAL: "سوشال", SEARCH: "بحث", PERSONAL: "معرفة شخصية", OTHER: "غير كده",
};
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

export function LeadCard({ lead, suggestedSlug }: { lead: LeadDetail; suggestedSlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(lead.status);

  const move = (next: "PROSPECT" | "ACTIVE" | "ARCHIVED") =>
    start(async () => {
      const r = await setLeadStatus(lead.id, next);
      if (r.success) {
        setStatus(next);
        toast({ title: `اتنقل إلى «${STATUS_LABEL[next]}»`, variant: "success" });
        router.refresh();
      } else {
        toast({ title: r.error, variant: "destructive" });
      }
    });

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
              <Badge className={cn("border-transparent text-[11px]", STATUS_TONE[status])}>
                {STATUS_LABEL[status]}
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
          ) : (
            <ConvertDialog
              leadId={lead.id}
              leadName={lead.name}
              suggestedSlug={suggestedSlug}
              email={lead.email}
            />
          )}
        </div>
      </div>

      {/* The stage strip IS the action — one click moves them, no dropdown and no save.
          The current stage is not clickable: a button that does nothing invites the click
          that teaches you it does nothing. */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 py-3">
          <span className="text-xs text-muted-foreground">غيّر الحالة إلى:</span>
          {(["PROSPECT", "ACTIVE", "ARCHIVED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending || status === s}
              onClick={() => move(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                status === s
                  ? "cursor-default border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                pending && "opacity-60",
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
          {pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />}
        </CardContent>
      </Card>

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
                ? SOURCE_LABEL[lead.source] ?? lead.source
                : <span className="text-muted-foreground">—</span>}
            </Row>
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

        {lead.notes && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{lead.notes}</p>
            </CardContent>
          </Card>
        )}
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
