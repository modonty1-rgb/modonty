"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "../actions/profile-actions";
import { Building2, Phone, MapPin, Scale, Briefcase, Link2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
};

type Industry = { id: string; name: string };

interface ProfileFormProps {
  clientId: string;
  initial: ProfileInitial;
  industries: Industry[];
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
          <span className="text-xs font-bold text-muted-foreground">{step}/6</span>
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

export function ProfileForm({ clientId, initial, industries }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    legalName: initial.legalName ?? "",
    alternateName: initial.alternateName ?? "",
    url: initial.url ?? "",
    slogan: initial.slogan ?? "",
    description: initial.description ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    contactType: initial.contactType ?? "",
    addressStreet: initial.addressStreet ?? "",
    addressCity: initial.addressCity ?? "",
    addressCountry: initial.addressCountry ?? "",
    addressPostalCode: initial.addressPostalCode ?? "",
    addressRegion: initial.addressRegion ?? "",
    addressNeighborhood: initial.addressNeighborhood ?? "",
    addressBuildingNumber: initial.addressBuildingNumber ?? "",
    addressAdditionalNumber: initial.addressAdditionalNumber ?? "",
    commercialRegistrationNumber: initial.commercialRegistrationNumber ?? "",
    vatID: initial.vatID ?? "",
    taxID: initial.taxID ?? "",
    legalForm: initial.legalForm ?? "",
    industryId: initial.industryId ?? "",
    organizationType: initial.organizationType ?? "",
    foundingDate: toDateStr(initial.foundingDate),
    sameAs: (initial.sameAs ?? []).join("\n"),
    canonicalUrl: initial.canonicalUrl ?? "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const filledCount = (keys: (keyof typeof form)[]) =>
    keys.filter((k) => String(form[k] ?? "").trim().length > 0).length;

  // ─── Section completion stats ────────────────────────────────────────────
  const basicKeys: (keyof typeof form)[] = ["name", "legalName", "alternateName", "url", "slogan", "description"];
  const contactKeys: (keyof typeof form)[] = ["email", "phone", "contactType"];
  const addressKeys: (keyof typeof form)[] = [
    "addressStreet", "addressCity", "addressCountry", "addressPostalCode",
    "addressRegion", "addressNeighborhood", "addressBuildingNumber", "addressAdditionalNumber",
  ];
  const legalKeys: (keyof typeof form)[] = ["commercialRegistrationNumber", "vatID", "taxID", "legalForm"];
  const businessKeys: (keyof typeof form)[] = ["industryId", "organizationType", "foundingDate", "sameAs"];
  const canonicalKeys: (keyof typeof form)[] = ["canonicalUrl"];

  const totalFilled =
    filledCount(basicKeys) + filledCount(contactKeys) + filledCount(addressKeys) +
    filledCount(legalKeys) + filledCount(businessKeys) + filledCount(canonicalKeys);
  const totalFields =
    basicKeys.length + contactKeys.length + addressKeys.length +
    legalKeys.length + businessKeys.length + canonicalKeys.length;
  const progress = Math.round((totalFilled / totalFields) * 100);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await updateProfile(clientId, {
        name: form.name.trim(),
        legalName: form.legalName || null,
        alternateName: form.alternateName || null,
        url: form.url || null,
        slogan: form.slogan || null,
        description: form.description || null,
        email: form.email || null,
        phone: form.phone || null,
        contactType: form.contactType || null,
        addressStreet: form.addressStreet || null,
        addressCity: form.addressCity || null,
        addressCountry: form.addressCountry || null,
        addressPostalCode: form.addressPostalCode || null,
        addressRegion: form.addressRegion || null,
        addressNeighborhood: form.addressNeighborhood || null,
        addressBuildingNumber: form.addressBuildingNumber || null,
        addressAdditionalNumber: form.addressAdditionalNumber || null,
        commercialRegistrationNumber: form.commercialRegistrationNumber || null,
        vatID: form.vatID || null,
        taxID: form.taxID || null,
        legalForm: form.legalForm || null,
        industryId: form.industryId || null,
        organizationType: form.organizationType || null,
        foundingDate: form.foundingDate || null,
        sameAs: form.sameAs.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
        canonicalUrl: form.canonicalUrl || null,
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
    opts?: { type?: string; placeholder?: string; required?: boolean; hint?: string }
  ) => {
    const isLtr = opts?.type === "url" || opts?.type === "email" || opts?.type === "tel" || opts?.type === "number";
    return (
      <div key={String(k)} className="space-y-1.5">
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

  const select = (k: "industryId", label: string) => (
    <div key={String(k)} className="space-y-1.5">
      <Label htmlFor={String(k)} className="text-sm">{label}</Label>
      <select
        id={String(k)}
        value={form[k]}
        onChange={(e) => update(k, e.target.value)}
        disabled={loading}
        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        <option value="">— اختر —</option>
        {industries.map((i) => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </select>
    </div>
  );

  const textarea = (k: "description" | "sameAs", label: string, hint?: string) => (
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
      {/* ─── Top progress strip ─────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">اكتمال الملف</span>
          <span className="text-sm font-bold tabular-nums">{totalFilled} / {totalFields} حقل · {progress}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── 1. Basic Info ──────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={Building2}
          step={1}
          title={ar.profile.basicInfo}
          description="اسم الشركة، الموقع الإلكتروني، والشعار"
          filled={filledCount(basicKeys)}
          total={basicKeys.length}
        />
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2 [&>div:not([class*='col-span'])]:lg:col-span-1">
          {field("name", ar.profile.name, { required: true })}
          {field("legalName", ar.profile.legalName)}
          {field("alternateName", ar.profile.alternateName)}
          {field("url", ar.profile.url, { type: "url", placeholder: "https://example.com" })}
          {field("slogan", ar.profile.slogan, { placeholder: "كلمة موجزة تميّز نشاطك" })}
          {textarea("description", ar.profile.organizationDescription)}
        </CardContent>
      </Card>

      {/* ─── 2. Contact ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={Phone}
          step={2}
          title={ar.profile.contactInfo}
          description="كيف يصل إليك العملاء"
          filled={filledCount(contactKeys)}
          total={contactKeys.length}
        />
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2 [&>div:not([class*='col-span'])]:lg:col-span-1">
          {field("email", ar.settings.email, { type: "email", placeholder: ar.settings.placeholderEmail, required: true })}
          {field("phone", ar.settings.phone, { type: "tel", placeholder: ar.settings.placeholderPhone })}
          {field("contactType", ar.profile.contactType, { placeholder: "customer service / sales / support" })}
        </CardContent>
      </Card>

      {/* ─── 3. Address ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={MapPin}
          step={3}
          title={ar.profile.address}
          description="الموقع الفعلي للشركة"
          filled={filledCount(addressKeys)}
          total={addressKeys.length}
        />
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2 [&>div:not([class*='col-span'])]:lg:col-span-1">
          {field("addressCity", ar.profile.addressCity, { placeholder: "الرياض، جدة، الدمام..." })}
          {field("addressCountry", ar.profile.addressCountry, { placeholder: "السعودية" })}
          {field("addressRegion", ar.profile.addressRegion)}
          {field("addressNeighborhood", ar.profile.addressNeighborhood)}
          {field("addressStreet", ar.profile.addressStreet)}
          {field("addressBuildingNumber", ar.profile.addressBuildingNumber)}
          {field("addressPostalCode", ar.profile.addressPostalCode, { type: "number" })}
          {field("addressAdditionalNumber", ar.profile.addressAdditionalNumber, { type: "number" })}
        </CardContent>
      </Card>

      {/* ─── 4. Legal ───────────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={Scale}
          step={4}
          title={ar.profile.saudiGulf}
          description="الوثائق الرسمية المطلوبة لـ JSON-LD"
          filled={filledCount(legalKeys)}
          total={legalKeys.length}
        />
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2 [&>div:not([class*='col-span'])]:lg:col-span-1">
          {field("commercialRegistrationNumber", ar.profile.commercialRegistrationNumber, { placeholder: "رقم السجل التجاري" })}
          {field("vatID", ar.profile.vatID, { placeholder: "300xxxxxxxxxxx3" })}
          {field("taxID", ar.profile.taxID)}
          {field("legalForm", ar.profile.legalForm, { placeholder: "ذ.م.م / مساهمة / فردية" })}
        </CardContent>
      </Card>

      {/* ─── 5. Business ────────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={Briefcase}
          step={5}
          title={ar.profile.business}
          description="القطاع، نوع المنظمة، والروابط الاجتماعية"
          filled={filledCount(businessKeys)}
          total={businessKeys.length}
        />
        <CardContent className="grid gap-4 p-6 lg:grid-cols-2 [&>div:not([class*='col-span'])]:lg:col-span-1">
          {select("industryId", ar.profile.industry)}
          {field("organizationType", ar.profile.organizationType, { placeholder: "شركة / مؤسسة / محل" })}
          {field("foundingDate", ar.profile.foundingDate, { type: "date" })}
          {textarea("sameAs", ar.profile.socialProfiles, ar.profile.socialProfilesHint)}
        </CardContent>
      </Card>

      {/* ─── 6. Canonical URL ───────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <SectionHeader
          icon={Link2}
          step={6}
          title={ar.profile.canonicalUrl}
          description="الرابط الموحّد للشركة في موقع مودونتي (يمنع تكرار الفهرسة)"
          filled={filledCount(canonicalKeys)}
          total={canonicalKeys.length}
        />
        <CardContent className="p-6">
          {field("canonicalUrl", ar.profile.canonicalUrl, { type: "url" })}
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
