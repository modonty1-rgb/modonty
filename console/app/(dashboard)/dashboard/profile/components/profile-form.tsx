"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "../actions/profile-actions";
import {
  LEGAL_FORMS,
  ORGANIZATION_TYPES,
  normalizeLegalForm,
  normalizeOrganizationType,
} from "@modonty/database/lib/constants/client-classification";
import { Building2, MapPin, Scale, Clock, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Lock, ChevronDown } from "lucide-react";

const DAY_ORDER = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
// Default working days for a new client (Sun–Thu) — Sat & Fri off.
const DEFAULT_WORK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAY_LABELS_AR: Record<string, string> = {
  Saturday: "السبت",
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
};

// Reads the stored 7-day array into a SIMPLE model: one shared shift + which days
// are open. A day counts as "open" only if it's present, not closed, and has times.
function readHours(initial: unknown): { openTime: string; closeTime: string; workDays: Set<string> } {
  const arr = Array.isArray(initial) ? (initial as Record<string, unknown>[]) : [];
  const working = arr.filter(
    (r) => r && typeof r.dayOfWeek === "string" && r.closed !== true && r.opens && r.closes
  );
  return {
    openTime: (working[0]?.opens as string) || "09:00",
    closeTime: (working[0]?.closes as string) || "17:00",
    workDays: working.length
      ? new Set(working.map((r) => r.dayOfWeek as string))
      : new Set<string>(DEFAULT_WORK_DAYS),
  };
}

type ProfileInitial = {
  name: string;
  legalName?: string | null;
  alternateName?: string | null;
  url?: string | null;
  slogan?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  contactType?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressCountry?: string | null;
  addressPostalCode?: string | null;
  addressRegion?: string | null;
  addressNeighborhood?: string | null;
  addressBuildingNumber?: string | null;
  addressAdditionalNumber?: string | null;
  commercialRegistrationNumber?: string | null;
  vatID?: string | null;
  taxID?: string | null;
  legalForm?: string | null;
  industryId?: string | null;
  organizationType?: string | null;
  foundingDate?: Date | string | null;
  sameAs?: string[];
  canonicalUrl?: string | null;
  openingHoursSpecification?: unknown;
};

type Industry = { id: string; name: string };

interface ProfileFormProps {
  clientId: string;
  initial: ProfileInitial;
  industries: Industry[];
  countries: { code: string; nameAr: string; nameEn: string }[];
}

function toDateStr(d: Date | string | null | undefined): string {
  if (!d) return "";
  const x = new Date(d);
  return isNaN(x.getTime()) ? "" : x.toISOString().slice(0, 10);
}

function SectionHeader({
  icon: Icon,
  step,
  title,
  description,
  filled,
  total,
}: {
  icon: React.ComponentType<{ className?: string }>;
  step: number;
  title: string;
  description: string;
  filled: number;
  total: number;
}) {
  const complete = filled === total;
  return (
    <div className="flex items-start gap-3 px-6 pt-6 pb-3 border-b">
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl grid place-items-center ${complete ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">{step}/3</span>
          <h3 className="text-base font-bold">{title}</h3>
          {complete && <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="مكتمل" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${complete ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-muted text-muted-foreground"}`}>
        {filled}/{total}
      </span>
    </div>
  );
}

// Read-only display row for admin-owned fields the client can see but not edit here.
function ReadonlyRow({
  label,
  value,
  hint,
  ltr,
}: {
  label: string;
  value: string | null;
  hint?: string;
  ltr?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex h-10 items-center overflow-hidden rounded-md border border-dashed bg-muted/40 px-3 text-sm">
        {value ? (
          <span
            className={`truncate font-medium text-foreground ${ltr ? "text-start" : ""}`}
            dir={ltr ? "ltr" : undefined}
          >
            {value}
          </span>
        ) : (
          <span className="text-muted-foreground">لم تُحدّد بعد — تُدار من مودونتي</span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProfileForm({ clientId, initial, industries, countries }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    legalName: initial.legalName ?? "",
    alternateName: initial.alternateName ?? "",
    slogan: initial.slogan ?? "",
    description: initial.description ?? "",
    addressStreet: initial.addressStreet ?? "",
    addressCity: initial.addressCity ?? "",
    addressPostalCode: initial.addressPostalCode ?? "",
    addressRegion: initial.addressRegion ?? "",
    addressNeighborhood: initial.addressNeighborhood ?? "",
    addressBuildingNumber: initial.addressBuildingNumber ?? "",
    addressAdditionalNumber: initial.addressAdditionalNumber ?? "",
    commercialRegistrationNumber: initial.commercialRegistrationNumber ?? "",
    vatID: initial.vatID ?? "",
    taxID: initial.taxID ?? "",
    foundingDate: toDateStr(initial.foundingDate),
  });

  const initialHours = readHours(initial.openingHoursSpecification);
  const [openTime, setOpenTime] = useState(initialHours.openTime);
  const [closeTime, setCloseTime] = useState(initialHours.closeTime);
  const [workDays, setWorkDays] = useState<Set<string>>(initialHours.workDays);

  const toggleDay = (day: string) =>
    setWorkDays((p) => {
      const next = new Set(p);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const filledCount = (keys: (keyof typeof form)[]) =>
    keys.filter((k) => String(form[k] ?? "").trim().length > 0).length;

  // Country-aware fields: Saudi Arabia has extra national-address + tax fields
  // (additional number, separate VAT+TIN). Country is admin-owned (read-only here),
  // so derive from the saved value, not form state.
  const isSaudi = initial.addressCountry === "SA";

  // ─── Section completion stats ────────────────────────────────────────────
  const basicKeys: (keyof typeof form)[] = [
    "name", "legalName", "alternateName", "slogan", "description", "foundingDate",
    "commercialRegistrationNumber", "vatID",
  ];
  const addressKeys: (keyof typeof form)[] = [
    "addressStreet", "addressCity", "addressPostalCode",
    "addressRegion", "addressNeighborhood", "addressBuildingNumber",
    ...(isSaudi ? (["addressAdditionalNumber"] as (keyof typeof form)[]) : []),
  ];

  // Admin-owned fields shown read-only below (client edits them via Modonty admin, not here).
  const industryName = industries.find((i) => i.id === initial.industryId)?.name ?? null;
  const orgTypeLabel =
    ORGANIZATION_TYPES.find((o) => o.value === normalizeOrganizationType(initial.organizationType))?.ar ?? null;
  const legalFormLabel =
    LEGAL_FORMS.find((o) => o.value === normalizeLegalForm(initial.legalForm))?.ar ?? null;
  const socialProfilesValue =
    initial.sameAs && initial.sameAs.length ? initial.sameAs.join("، ") : null;
  const countryName = countries.find((c) => c.code === initial.addressCountry)?.nameAr ?? null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await updateProfile(clientId, {
        name: form.name.trim(),
        legalName: form.legalName || null,
        alternateName: form.alternateName || null,
        slogan: form.slogan || null,
        description: form.description || null,
        addressStreet: form.addressStreet || null,
        addressCity: form.addressCity || null,
        addressPostalCode: form.addressPostalCode || null,
        addressRegion: form.addressRegion || null,
        addressNeighborhood: form.addressNeighborhood || null,
        addressBuildingNumber: form.addressBuildingNumber || null,
        addressAdditionalNumber: form.addressAdditionalNumber || null,
        commercialRegistrationNumber: form.commercialRegistrationNumber || null,
        vatID: form.vatID || null,
        // Non-SA: single field lives in vatID; mirror it into taxID so JSON-LD stays complete.
        taxID: isSaudi ? form.taxID || null : form.vatID || null,
        foundingDate: form.foundingDate || null,
        // Build the 7-day spec from the simple model: only working days are emitted
        // (omitted days = closed in Schema.org). JSON-LD generator reads opens/closes.
        openingHoursSpecification: DAY_ORDER.filter((d) => workDays.has(d)).map((d) => ({
          dayOfWeek: d,
          opens: openTime,
          closes: closeTime,
          closed: false,
        })),
      });
      if (res.success) {
        setSavedAt(new Date());
        router.refresh();
      } else {
        setError(res.error ?? ar.settings.updateFailed);
      }
    } catch {
      setError(ar.settings.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  const field = (
    k: keyof typeof form,
    label: string,
    opts?: { type?: string; placeholder?: string; required?: boolean; hint?: string; full?: boolean }
  ) => {
    const isLtr = opts?.type === "url" || opts?.type === "email" || opts?.type === "tel" || opts?.type === "number";
    return (
      <div key={String(k)} className={`space-y-1.5${opts?.full ? " lg:col-span-2" : ""}`}>
        <Label htmlFor={String(k)} className="text-sm">
          {label}
          {opts?.required && <span className="text-destructive mr-1">*</span>}
        </Label>
        <Input
          id={String(k)}
          type={opts?.type ?? "text"}
          value={typeof form[k] === "string" ? form[k] : ""}
          onChange={(e) => update(k, e.target.value)}
          placeholder={opts?.placeholder}
          disabled={loading}
          dir={isLtr ? "ltr" : undefined}
          className={isLtr ? "text-start" : undefined}
          required={opts?.required}
        />
        {opts?.hint && <p className="text-xs text-muted-foreground">{opts.hint}</p>}
      </div>
    );
  };

  const textarea = (k: "description", label: string, hint?: string) => (
    <div key={String(k)} className="space-y-1.5 lg:col-span-2">
      <Label htmlFor={String(k)} className="text-sm">{label}</Label>
      <Textarea
        id={String(k)}
        value={form[k]}
        onChange={(e) => update(k, e.target.value)}
        disabled={loading}
        rows={3}
        placeholder={hint}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Verified info (admin-owned, read-only, collapsible) ─────────── */}
      <Card className="overflow-hidden p-0">
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-start gap-3 px-6 pt-6 pb-3 text-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl grid place-items-center bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-base font-bold">بيانات موثّقة من مودونتي</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                هذي البيانات تُدار من مودونتي للتوثيق — للتعديل تواصل معنا.
              </span>
            </div>
            <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" aria-label="للقراءة فقط" />
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid gap-4 border-t p-6 pt-4 sm:grid-cols-2">
              {/* Digital identity */}
              <ReadonlyRow label={ar.settings.email} value={initial.email ?? null} hint="معرّف الدخول" ltr />
              <ReadonlyRow label={ar.profile.url} value={initial.url ?? null} ltr />
              <ReadonlyRow label={ar.profile.socialProfiles} value={socialProfilesValue} ltr />
              {/* Classification */}
              <ReadonlyRow label={ar.profile.industry} value={industryName} />
              <ReadonlyRow label={ar.profile.organizationType} value={orgTypeLabel} />
              <ReadonlyRow label={ar.profile.legalForm} value={legalFormLabel} />
              {/* Contact & location */}
              <ReadonlyRow label={ar.settings.phone} value={initial.phone ?? null} ltr />
              <ReadonlyRow label={ar.profile.contactType} value={initial.contactType ?? null} ltr />
              <ReadonlyRow label={ar.profile.addressCountry} value={countryName} />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* ─── 1. Basic Info ──────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={Building2}
          step={1}
          title={ar.profile.basicInfo}
          description="اسم نشاطك، شعارك، وصفك، وسجلاتك الرسمية"
          filled={filledCount(basicKeys)}
          total={basicKeys.length}
        />
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2 [&>div:not([class*='col-span'])]:lg:col-span-1">
          {field("name", ar.profile.name, { required: true })}
          {field("legalName", ar.profile.legalName)}
          {field("alternateName", ar.profile.alternateName)}
          {field("foundingDate", ar.profile.foundingDate, { type: "date" })}
          {field("slogan", ar.profile.slogan, { placeholder: "كلمة موجزة تميّز نشاطك", full: true })}
          {textarea("description", ar.profile.organizationDescription)}

          {/* Official records — merged in, separated by a light subheading (not a card) */}
          <div className="lg:col-span-2 mt-1 flex items-center gap-2 border-t pt-4 text-xs font-semibold text-muted-foreground">
            <Scale className="h-4 w-4" />
            <span>السجلات الرسمية</span>
          </div>
          {field("commercialRegistrationNumber", ar.profile.commercialRegistrationNumber, { placeholder: "رقم السجل التجاري" })}
          {isSaudi ? (
            <>
              {field("vatID", ar.profile.vatID, { placeholder: "300xxxxxxxxxxx3", hint: ar.profile.vatIDHint })}
              {field("taxID", ar.profile.taxID)}
            </>
          ) : (
            field("vatID", ar.profile.taxNumber)
          )}
        </CardContent>
      </Card>

      {/* ─── 2. Address & Contact ───────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={MapPin}
          step={2}
          title={ar.profile.address}
          description="الموقع الفعلي لنشاطك"
          filled={filledCount(addressKeys)}
          total={addressKeys.length}
        />
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2 [&>div:not([class*='col-span'])]:lg:col-span-1">
          {field("addressCity", ar.profile.addressCity, { placeholder: "الرياض، جدة، الدمام..." })}
          {field("addressRegion", ar.profile.addressRegion)}
          {field("addressNeighborhood", ar.profile.addressNeighborhood)}
          {field("addressStreet", ar.profile.addressStreet)}
          {field("addressBuildingNumber", ar.profile.addressBuildingNumber)}
          {isSaudi &&
            field("addressAdditionalNumber", ar.profile.addressAdditionalNumber, {
              type: "number",
              hint: ar.profile.addressAdditionalNumberHint,
            })}
          {field("addressPostalCode", ar.profile.addressPostalCode, { type: "number" })}
        </CardContent>
      </Card>

      {/* ─── 3. Business Hours ──────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={Clock}
          step={3}
          title="ساعات العمل"
          description="وقت دوام موحّد لكل أيام العمل — حدّد إجازاتك"
          filled={workDays.size}
          total={7}
        />
        <CardContent className="p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="openTime" className="text-sm">وقت الفتح</Label>
              <Input
                id="openTime"
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                disabled={loading}
                dir="ltr"
                className="text-start"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closeTime" className="text-sm">وقت الإغلاق</Label>
              <Input
                id="closeTime"
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                disabled={loading}
                dir="ltr"
                className="text-start"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">أيام العمل</Label>
            <div className="flex flex-wrap gap-2">
              {DAY_ORDER.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-muted-foreground cursor-pointer select-none transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-foreground has-[:checked]:font-medium"
                >
                  <input
                    type="checkbox"
                    checked={workDays.has(day)}
                    onChange={() => toggleDay(day)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  {DAY_LABELS_AR[day]}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">الأيام غير المحددة تظهر «مغلق» في صفحتك.</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Sticky Save Bar (position-aware: stays inside form column) ─── */}
      <div className="sticky bottom-4 z-30">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/95 backdrop-blur shadow-lg p-3">
          <div className="flex items-center gap-2 text-xs">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">{ar.settings.saving}</span>
              </>
            ) : savedAt ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  حُفظ · {new Intl.DateTimeFormat("ar-SA", { timeStyle: "short" }).format(savedAt)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">جاهز للحفظ</span>
            )}
          </div>
          <Button type="submit" disabled={loading} size="sm" className="font-bold">
            {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </form>
  );
}
