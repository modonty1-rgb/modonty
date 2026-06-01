"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { FormInput, FormSelect, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import { useClientForm } from "../helpers/hooks/use-client-form";
import type { ClientWithRelations } from "@/lib/types";
import { getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { buildClientSeoData } from "../helpers/build-client-seo-data";
import { createOrganizationSEOConfig, createOrganizationSEOConfigFull } from "../helpers/client-seo-config";
import {
  createClientSEOGroupAnalysis,
  createClientSEOGroupScores,
  type ClientSEOGroupAnalysis,
} from "../helpers/client-seo-group-scores";
import { MediaSocialSection } from "./form-sections/media-social-section";
import { ClientSEOValidationSection } from "./form-sections/client-seo-validation-section";
import { SEODoctor } from "@/components/shared/seo-doctor";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";

type OpeningHoursDay = {
  dayOfWeek: string;
  opens: string;
  closes: string;
  closed: boolean;
};

interface ClientSeoFormProps {
  initialData?: Partial<ClientWithRelations>;
  clientId: string;
  /** Site base URL from Settings.siteUrl (passed by server parent). */
  siteUrl: string;
}

const DAYS: Array<{ key: string; label: string }> = [
  { key: "Saturday", label: "Sa" },
  { key: "Sunday", label: "Su" },
  { key: "Monday", label: "Mo" },
  { key: "Tuesday", label: "Tu" },
  { key: "Wednesday", label: "We" },
  { key: "Thursday", label: "Th" },
  { key: "Friday", label: "Fr" },
];

function ensureOpeningHours(value: unknown): OpeningHoursDay[] {
  const arr = Array.isArray(value) ? (value as OpeningHoursDay[]) : [];
  const byDay = new Map<string, OpeningHoursDay>();
  for (const item of arr) {
    if (item && typeof item.dayOfWeek === "string") byDay.set(item.dayOfWeek, item);
  }
  return DAYS.map(({ key }) => {
    const existing = byDay.get(key);
    return {
      dayOfWeek: key,
      opens: existing?.opens ?? "09:00",
      closes: existing?.closes ?? "17:00",
      closed: existing?.closed ?? false,
    };
  });
}

function scoreColor(percentage: number) {
  if (percentage >= 80) return "bg-green-600";
  if (percentage >= 60) return "bg-yellow-600";
  return "bg-red-600";
}

function getIssueCounts(items: ClientSEOGroupAnalysis["meta"]["items"]) {
  const error = items.filter((i) => i.status === "error").length;
  const warning = items.filter((i) => i.status === "warning").length;
  const good = items.filter((i) => i.status === "good").length;
  return { error, warning, good };
}

// Always-open section card (replaced the collapsible accordion for readability).
function SeoSection({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <section className="border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
        <span className="text-sm font-bold">{title}</span>
        {badge && <span className="ms-auto">{badge}</span>}
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

// Read-only display of a client-owned field (edited in the console, not here).
function ReadonlyRow({ k, v }: { k: string; v?: string | null }) {
  const has = typeof v === "string" && v.trim().length > 0;
  return (
    <div className="flex gap-3">
      <span className="w-40 shrink-0 text-muted-foreground">{k}</span>
      <span className={`flex-1 min-w-0 break-words ${has ? "font-medium" : "text-muted-foreground/60 italic"}`}>
        {has ? v : "لم يُدخله العميل"}
      </span>
    </div>
  );
}

export function ClientSeoForm({ initialData, clientId, siteUrl }: ClientSeoFormProps) {
  const { form, handleSubmit, loading, error, isEditMode } = useClientForm({
    initialData,
    clientId,
  });

  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [showTechnicalPreview, setShowTechnicalPreview] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const seo = await getSEOSettings();
        setSeoSettings(seo);
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
    loadSettings();
  }, []);

  const typedForm = form as unknown as UseFormReturn<Record<string, unknown>>;
  const watchField = <T,>(name: string) => typedForm.watch(name) as T;
  const setValue = (name: string, value: unknown) =>
    typedForm.setValue(name, value, { shouldValidate: true });

  const watchedFields = {
    name: watchField<string | null>("name"),
    slug: watchField<string | null>("slug"),
    seoTitle: watchField<string | null>("seoTitle"),
    seoDescription: watchField<string | null>("seoDescription"),
    description: watchField<string | null>("description"),
    legalName: watchField<string | null>("legalName"),
    alternateName: watchField<string | null>("alternateName"),
    commercialRegistrationNumber: watchField<string | null>("commercialRegistrationNumber"),
    vatID: watchField<string | null>("vatID"),
    sameAs: watchField<string[]>("sameAs"),
    gbpProfileUrl: watchField<string | null>("gbpProfileUrl"),
    gbpPlaceId: watchField<string | null>("gbpPlaceId"),
    gbpAccountId: watchField<string | null>("gbpAccountId"),
    gbpLocationId: watchField<string | null>("gbpLocationId"),
    gbpCategory: watchField<string | null>("gbpCategory"),
    addressCity: watchField<string | null>("addressCity"),
    addressNeighborhood: watchField<string | null>("addressNeighborhood"),
    addressStreet: watchField<string | null>("addressStreet"),
    addressRegion: watchField<string | null>("addressRegion"),
    addressBuildingNumber: watchField<string | null>("addressBuildingNumber"),
    addressAdditionalNumber: watchField<string | null>("addressAdditionalNumber"),
    addressPostalCode: watchField<string | null>("addressPostalCode"),
    addressCountry: watchField<string | null>("addressCountry"),
    addressLatitude: watchField<number | null>("addressLatitude"),
    addressLongitude: watchField<number | null>("addressLongitude"),
    priceRange: watchField<string | null>("priceRange"),
    knowsLanguage: watchField<string[]>("knowsLanguage"),
    openingHoursSpecification: watchField<OpeningHoursDay[] | null>("openingHoursSpecification"),
  };

  const seoData = useMemo(
    () =>
      buildClientSeoData(initialData, watchedFields),
    [
      initialData,
      watchedFields.name,
      watchedFields.slug,
      watchedFields.seoTitle,
      watchedFields.seoDescription,
      watchedFields.description,
      watchedFields.legalName,
      watchedFields.alternateName,
      watchedFields.commercialRegistrationNumber,
      watchedFields.vatID,
      watchedFields.sameAs,
      watchedFields.gbpProfileUrl,
      watchedFields.gbpPlaceId,
      watchedFields.gbpAccountId,
      watchedFields.gbpLocationId,
      watchedFields.gbpCategory,
      watchedFields.addressCity,
      watchedFields.addressNeighborhood,
      watchedFields.addressStreet,
      watchedFields.addressRegion,
      watchedFields.addressBuildingNumber,
      watchedFields.addressAdditionalNumber,
      watchedFields.addressPostalCode,
      watchedFields.addressCountry,
      watchedFields.addressLatitude,
      watchedFields.addressLongitude,
      watchedFields.priceRange,
      watchedFields.knowsLanguage,
      watchedFields.openingHoursSpecification,
    ],
  );

  let groupPercentages = { meta: 0, jsonLd: 0 };
  let groupAnalysis: ClientSEOGroupAnalysis | null = null;
  let seoConfigCore: ReturnType<typeof createOrganizationSEOConfig> | null = null;
  let seoConfigFull: ReturnType<typeof createOrganizationSEOConfigFull> | null = null;

  if (seoSettings) {
    seoConfigCore = createOrganizationSEOConfig(seoSettings);
    seoConfigFull = createOrganizationSEOConfigFull(seoSettings);

    const computeGroupScores = createClientSEOGroupScores(seoConfigFull);
    const scores = computeGroupScores(seoData);
    groupPercentages = {
      meta: scores.meta.percentage,
      jsonLd: scores.jsonLd.percentage,
    };

    const analyzeGroups = createClientSEOGroupAnalysis(seoConfigFull);
    groupAnalysis = analyzeGroups(seoData);
  }

  const slug = (watchedFields.slug || "").trim();
  const base = (siteUrl || "").replace(/\/+$/, "");
  const clientUrl = base && slug ? `${base}/clients/${slug}` : "";

  // Client activation state — a PENDING/inactive client has no live public page yet,
  // so the public preview must be disabled until activated.
  const subscriptionStatus =
    (initialData as { subscriptionStatus?: string })?.subscriptionStatus ?? "PENDING";
  const isActive = subscriptionStatus === "ACTIVE";

  const openingHours = ensureOpeningHours(watchedFields.openingHoursSpecification);

  const technicalPreviewRows = [
    { k: "og:title", v: watchedFields.seoTitle || "" },
    { k: "og:description", v: watchedFields.seoDescription || "" },
    { k: "og:url", v: clientUrl },
    { k: "canonical", v: clientUrl },
    { k: "twitter:title", v: watchedFields.seoTitle || "" },
    { k: "twitter:description", v: watchedFields.seoDescription || "" },
  ];

  const seoDoctorNode = seoConfigCore ? <SEODoctor data={seoData} config={seoConfigCore} /> : null;

  const metaIssues = groupAnalysis?.meta.items ?? [];
  const jsonLdIssues = groupAnalysis?.jsonLd.items ?? [];
  const metaCounts = getIssueCounts(metaIssues);
  const jsonLdCounts = getIssueCounts(jsonLdIssues);

  // Readiness = SHARED validity score from STORED data (same scorer everywhere).
  const { score: overallReadiness, checks: readinessChecks } = computeClientSeoScore(
    clientToSeoInput(initialData as Record<string, unknown> | undefined),
  );
  const readinessTone =
    overallReadiness >= 80
      ? { ring: "#16a34a", text: "text-green-600 dark:text-green-500", label: "جاهز" }
      : overallReadiness >= 50
        ? { ring: "#d97706", text: "text-amber-600 dark:text-amber-500", label: "شبه مكتمل" }
        : { ring: "#dc2626", text: "text-red-600 dark:text-red-500", label: "ناقص" };

  // Live preview values (SERP + social share).
  const previewTitle = (watchedFields.seoTitle || "").trim() || watchedFields.name || "عنوان الصفحة";
  const previewDesc = (watchedFields.seoDescription || "").trim();
  const previewUrl = clientUrl || (base ? `${base}/clients/...` : "modonty.com/clients/...");

  return (
    <form id="client-seo-form" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <div
            className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* Dominant header — SEO readiness score + checklist */}
        <div className="rounded-xl border bg-card p-5 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div
              className="relative h-[72px] w-[72px] rounded-full grid place-items-center shrink-0"
              style={{ background: `conic-gradient(${readinessTone.ring} ${overallReadiness * 3.6}deg, hsl(var(--muted)) 0deg)` }}
            >
              <div className="absolute inset-[7px] rounded-full bg-card" />
              <span className={`relative text-xl font-extrabold ${readinessTone.text}`}>{overallReadiness}%</span>
            </div>
            <div>
              <p className="text-base font-extrabold text-foreground leading-tight">
                {(initialData as { name?: string })?.name || "العميل"}
              </p>
              <h2 className="text-sm font-bold text-muted-foreground flex items-center gap-2 mt-0.5">
                جاهزية SEO
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${readinessTone.text} bg-muted`}>
                  {readinessTone.label}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                أكمل العناصر الناقصة عشان يظهر العميل صح في Google ومنصّات التواصل
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {readinessChecks.map((c) => {
                  const good = c.status === "good";
                  return (
                    <span
                      key={c.key}
                      title={c.hint}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        good
                          ? "bg-green-500/12 text-green-600 dark:text-green-400"
                          : c.status === "error"
                            ? "bg-red-500/12 text-red-600 dark:text-red-400"
                            : "bg-amber-500/12 text-amber-600 dark:text-amber-500"
                      }`}
                    >
                      {good ? "✓" : c.status === "error" ? "✗" : "○"} {c.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          {clientUrl && (
            isActive ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={clientUrl} target="_blank" rel="noopener noreferrer">↗ معاينة الصفحة العامة</a>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                title="تُتاح المعاينة بعد تفعيل العميل — الصفحة العامة غير منشورة بعد"
              >
                ↗ معاينة الصفحة العامة
              </Button>
            )
          )}
        </div>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-4">
              <SeoSection title="Meta — العنوان والوصف">
                  <div className="space-y-4">
                    <div>
                      <FormInput
                        label="SEO Title"
                        name="seoTitle"
                        value={watchedFields.seoTitle || ""}
                        onChange={(e) => setValue("seoTitle", e.target.value || null)}
                        placeholder="SEO Title"
                      />
                      <div className="mt-1">
                        <CharacterCounter
                          current={(watchedFields.seoTitle || "").length}
                          min={seoSettings?.seoTitleMin ?? 30}
                          max={seoSettings?.seoTitleMax ?? 60}
                          restrict={seoSettings?.seoTitleRestrict ?? false}
                          className="ml-1"
                        />
                      </div>
                    </div>
                    <div>
                      <FormTextarea
                        label="SEO Description"
                        name="seoDescription"
                        value={watchedFields.seoDescription || ""}
                        onChange={(e) => setValue("seoDescription", e.target.value || null)}
                        rows={3}
                        placeholder="SEO Description"
                      />
                      <div className="mt-1">
                        <CharacterCounter
                          current={(watchedFields.seoDescription || "").length}
                          min={seoSettings?.seoDescriptionMin ?? 120}
                          max={seoSettings?.seoDescriptionMax ?? 160}
                          restrict={seoSettings?.seoDescriptionRestrict ?? false}
                          className="ml-1"
                        />
                      </div>
                    </div>
                    <div className="rounded-md border border-border bg-background">
                      <button
                        type="button"
                        onClick={() => setShowTechnicalPreview((v) => !v)}
                        className="w-full px-3 py-2 text-left text-sm font-semibold"
                      >
                        Technical Fields Preview
                      </button>
                      {showTechnicalPreview && (
                        <div className="px-3 pb-3">
                          <div className="space-y-2 text-sm">
                            {technicalPreviewRows.map((row) => (
                              <div key={row.k} className="flex gap-3">
                                <div className="w-40 shrink-0 text-muted-foreground">{row.k}</div>
                                <div className="flex-1 min-w-0 break-words">{row.v || "—"}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </SeoSection>

              <SeoSection title="Schema Data — التواصل والهوية">
                  <div className="space-y-4">
                    {/* Legal Name / Alternate Name / CR / VAT / Same As are owned by the
                        client (console profile). Shown read-only below to avoid duplicate
                        sources of truth — editing happens in the console. */}
                    <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.05] p-3 text-xs space-y-1.5">
                      <div className="font-semibold text-violet-600 dark:text-violet-400 mb-1.5">
                        🏢 بيانات هوية العميل — يدخلها العميل من الكونسول
                      </div>
                      <ReadonlyRow k="Legal Name" v={watchedFields.legalName} />
                      <ReadonlyRow k="Alternate Name" v={watchedFields.alternateName} />
                      <ReadonlyRow k="Commercial Registration" v={watchedFields.commercialRegistrationNumber} />
                      <ReadonlyRow k="VAT ID" v={watchedFields.vatID} />
                      <ReadonlyRow
                        k="Same As"
                        v={Array.isArray(watchedFields.sameAs) && watchedFields.sameAs.length ? watchedFields.sameAs.join("، ") : null}
                      />
                    </div>

                    {/* Twitter card + site are platform-level (from Settings) and the
                        card image is derived from the client's hero image automatically —
                        no per-client input needed, so they're intentionally not shown here. */}

                    <FormInput
                      label="GBP Profile URL"
                      name="gbpProfileUrl"
                      value={watchedFields.gbpProfileUrl || ""}
                      onChange={(e) => setValue("gbpProfileUrl", e.target.value || null)}
                      placeholder="https://g.page/..."
                    />
                  </div>
              </SeoSection>

              <SeoSection
                title="Google Business Profile"
                badge={<span className="inline-block w-2 h-2 rounded-full bg-muted-foreground" />}
              >
                  <div className="border-l-2 border-[#4285f4] pl-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">Not Connected</div>
                      <Button type="button" disabled>
                        Connect Business Profile
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="GBP Place ID"
                        name="gbpPlaceId"
                        value={watchedFields.gbpPlaceId || ""}
                        onChange={(e) => setValue("gbpPlaceId", e.target.value || null)}
                      />
                      <FormInput
                        label="GBP Account ID"
                        name="gbpAccountId"
                        value={watchedFields.gbpAccountId || ""}
                        onChange={(e) => setValue("gbpAccountId", e.target.value || null)}
                      />
                      <FormInput
                        label="GBP Location ID"
                        name="gbpLocationId"
                        value={watchedFields.gbpLocationId || ""}
                        onChange={(e) => setValue("gbpLocationId", e.target.value || null)}
                      />
                      <FormInput
                        label="GBP Category"
                        name="gbpCategory"
                        value={watchedFields.gbpCategory || ""}
                        onChange={(e) => setValue("gbpCategory", e.target.value || null)}
                      />
                    </div>

                    <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Sync contact data</li>
                        <li>Sync business hours</li>
                        <li>Reviews</li>
                        <li>Posts</li>
                        <li>Conflict alerts</li>
                      </ul>
                    </div>
                  </div>
              </SeoSection>

              <SeoSection title="Address — العنوان">
                  <div className="space-y-4">
                    {/* The postal address is owned by the client (console profile) —
                        read-only here. Only the map coordinates (which the client
                        doesn't enter) remain editable by the admin for GeoCoordinates. */}
                    <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.05] p-3 text-xs space-y-1.5">
                      <div className="font-semibold text-violet-600 dark:text-violet-400 mb-1.5">
                        📍 العنوان — يدخله العميل من الكونسول
                      </div>
                      <ReadonlyRow k="City" v={watchedFields.addressCity} />
                      <ReadonlyRow k="Neighborhood" v={watchedFields.addressNeighborhood} />
                      <ReadonlyRow k="Street" v={watchedFields.addressStreet} />
                      <ReadonlyRow k="Region" v={watchedFields.addressRegion} />
                      <ReadonlyRow k="Country" v={watchedFields.addressCountry} />
                      <ReadonlyRow k="Building No." v={watchedFields.addressBuildingNumber} />
                      <ReadonlyRow k="Additional No." v={watchedFields.addressAdditionalNumber} />
                      <ReadonlyRow k="Postal Code" v={watchedFields.addressPostalCode} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Latitude (map — admin)"
                        name="addressLatitude"
                        value={watchedFields.addressLatitude == null ? "" : String(watchedFields.addressLatitude)}
                        onChange={(e) =>
                          setValue("addressLatitude", e.target.value === "" ? null : Number(e.target.value))
                        }
                        type="number"
                      />
                      <FormInput
                        label="Longitude (map — admin)"
                        name="addressLongitude"
                        value={watchedFields.addressLongitude == null ? "" : String(watchedFields.addressLongitude)}
                        onChange={(e) =>
                          setValue("addressLongitude", e.target.value === "" ? null : Number(e.target.value))
                        }
                        type="number"
                      />
                    </div>
                  </div>
              </SeoSection>

              <SeoSection title="Business Details — تفاصيل العمل">
                  <div className="space-y-4">
                    <FormSelect
                      label="Price Range"
                      name="priceRange"
                      value={watchedFields.priceRange || undefined}
                      onValueChange={(value) => setValue("priceRange", value || null)}
                      placeholder="Select price range"
                    >
                      <SelectItem value="$">$</SelectItem>
                      <SelectItem value="$$">$$</SelectItem>
                      <SelectItem value="$$$">$$$</SelectItem>
                      <SelectItem value="$$$$">$$$$</SelectItem>
                    </FormSelect>

                    <FormInput
                      label="Knows Language"
                      name="knowsLanguage"
                      value={Array.isArray(watchedFields.knowsLanguage) ? watchedFields.knowsLanguage.join(", ") : ""}
                      onChange={(e) => {
                        const languages = e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean);
                        setValue("knowsLanguage", languages.length ? languages : ["ar"]);
                      }}
                      placeholder="ar"
                    />

                    {/* Business Hours are owned by the client (console profile) —
                        read-only here to keep a single source of truth. */}
                    <div className="rounded-md border border-violet-500/25 bg-violet-500/[0.05] p-3">
                      <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2.5">
                        🕒 ساعات العمل — يدخلها العميل من الكونسول
                      </div>
                      <div className="space-y-1.5">
                        {openingHours.map((day, idx) => (
                          <div key={day.dayOfWeek} className="grid grid-cols-12 gap-2 items-center text-xs">
                            <div className="col-span-3 text-muted-foreground">
                              {DAYS[idx]?.label ?? day.dayOfWeek}
                            </div>
                            <div className="col-span-9 font-medium">
                              {day.closed ? (
                                <span className="text-muted-foreground/60">مغلق</span>
                              ) : (
                                <span dir="ltr">{day.opens} – {day.closes}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
              </SeoSection>

              {isEditMode && (
                <SeoSection title="Media — الشعار والصورة">
                    <div className="space-y-6">
                      <MediaSocialSection form={form} />
                    </div>
                </SeoSection>
              )}

              <SeoSection title="SEO Analysis — التحليل">
                  <div className="space-y-6">
                    <ClientSEOValidationSection
                      formData={seoData}
                      clientId={clientId}
                      mode={isEditMode ? "edit" : "new"}
                      siteUrl={siteUrl}
                    />
                  </div>
              </SeoSection>
          </div>

          <div className="w-60 shrink-0">
            <div className="sticky top-[calc(57px+57px+16px)] z-30 space-y-4">
              {/* Live preview — Google SERP + social share (updates as you type) */}
              <Card className="p-4 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground">معاينة Google</div>
                <div dir="ltr" className="text-left">
                  <div className="text-[11px] text-muted-foreground truncate">{previewUrl}</div>
                  <div className="text-[15px] text-[#7c93ff] leading-snug line-clamp-2 mt-0.5" dir="auto">
                    {previewTitle}
                  </div>
                  {previewDesc ? (
                    <div className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5" dir="auto">
                      {previewDesc}
                    </div>
                  ) : (
                    <div className="text-[12px] text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                      أضف SEO Description ليظهر سطر جذّاب يرفع نسبة النقر
                    </div>
                  )}
                </div>

                <div className="pt-1 border-t">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">مشاركة التواصل</div>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="h-20 bg-gradient-to-br from-primary/15 to-violet-500/15 grid place-items-center text-[11px] text-muted-foreground">
                      شعار العميل / صورة OG
                    </div>
                    <div className="p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground" dir="ltr">
                        {base ? base.replace(/^https?:\/\//, "") : "modonty.com"}
                      </div>
                      <div className="text-[12.5px] font-bold line-clamp-2 mt-0.5" dir="auto">{previewTitle}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {seoDoctorNode}

              <Card className="p-4 space-y-4">
                <div className="text-sm font-semibold">Progress</div>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button type="button" className="w-full text-left space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Meta Data</span>
                        <span className="text-muted-foreground">{groupPercentages.meta}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={groupPercentages.meta} className="h-2 flex-1" />
                        <span className={`h-2 w-2 rounded-full ${scoreColor(groupPercentages.meta)}`} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {metaCounts.error > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            {metaCounts.error}
                          </span>
                        )}
                        {metaCounts.warning > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                            {metaCounts.warning}
                          </span>
                        )}
                        {metaCounts.good > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            {metaCounts.good}
                          </span>
                        )}
                      </div>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-[420px]" align="end">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Meta Data Notes</div>
                      <div className="space-y-1 text-sm">
                        {metaIssues
                          .filter((i) => i.status === "error" || i.status === "warning")
                          .slice(0, 12)
                          .map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{item.field}</div>
                                <div className="text-xs text-muted-foreground">{item.message}</div>
                              </div>
                            </div>
                          ))}
                        {metaIssues.filter((i) => i.status === "error" || i.status === "warning").length === 0 && (
                          <div className="text-xs text-muted-foreground">No notes.</div>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button type="button" className="w-full text-left space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">JSON-LD Data</span>
                        <span className="text-muted-foreground">{groupPercentages.jsonLd}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={groupPercentages.jsonLd} className="h-2 flex-1" />
                        <span className={`h-2 w-2 rounded-full ${scoreColor(groupPercentages.jsonLd)}`} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {jsonLdCounts.error > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            {jsonLdCounts.error}
                          </span>
                        )}
                        {jsonLdCounts.warning > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-600" />
                            {jsonLdCounts.warning}
                          </span>
                        )}
                        {jsonLdCounts.good > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            {jsonLdCounts.good}
                          </span>
                        )}
                      </div>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-[420px]" align="end">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">JSON-LD Data Notes</div>
                      <div className="space-y-1 text-sm">
                        {jsonLdIssues
                          .filter((i) => i.status === "error" || i.status === "warning")
                          .slice(0, 12)
                          .map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{item.field}</div>
                                <div className="text-xs text-muted-foreground">{item.message}</div>
                              </div>
                            </div>
                          ))}
                        {jsonLdIssues.filter((i) => i.status === "error" || i.status === "warning").length === 0 && (
                          <div className="text-xs text-muted-foreground">No notes.</div>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </Card>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save SEO Data"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

