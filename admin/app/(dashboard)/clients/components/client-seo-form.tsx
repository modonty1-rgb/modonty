"use client";

import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { getAllSettings, getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
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

type OpeningHoursDay = {
  dayOfWeek: string;
  opens: string;
  closes: string;
  closed: boolean;
};

interface ClientSeoFormProps {
  initialData?: Partial<ClientWithRelations>;
  clientId: string;
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

export function ClientSeoForm({ initialData, clientId }: ClientSeoFormProps) {
  const { form, handleSubmit, loading, error, isEditMode } = useClientForm({
    initialData,
    clientId,
  });

  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [showTechnicalPreview, setShowTechnicalPreview] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [seo, all] = await Promise.all([getSEOSettings(), getAllSettings()]);
        setSeoSettings(seo);
        setSiteUrl(all.siteUrl);
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
    twitterSite: watchField<string | null>("twitterSite"),
    twitterCard: watchField<string | null>("twitterCard"),
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
      watchedFields.twitterSite,
      watchedFields.twitterCard,
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

        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            <Accordion type="multiple" defaultValue={["meta"]} className="w-full">
              <AccordionItem value="meta" className="border border-white/10 rounded-lg bg-white/5">
                <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                  Meta
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-3">
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
                    <FormTextarea
                      label="Description"
                      name="description"
                      value={watchedFields.description || ""}
                      onChange={(e) => setValue("description", e.target.value || null)}
                      rows={3}
                      placeholder="Business description for search engines"
                    />

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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schema" className="border border-white/10 rounded-lg bg-white/5">
                <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                  Schema Data
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-3">
                  <div className="space-y-4">
                    <FormInput
                      label="Legal Name"
                      name="legalName"
                      value={watchedFields.legalName || ""}
                      onChange={(e) => setValue("legalName", e.target.value || null)}
                    />
                    <FormInput
                      label="Alternate Name"
                      name="alternateName"
                      value={watchedFields.alternateName || ""}
                      onChange={(e) => setValue("alternateName", e.target.value || null)}
                    />
                    <FormInput
                      label="Commercial Registration Number"
                      name="commercialRegistrationNumber"
                      value={watchedFields.commercialRegistrationNumber || ""}
                      onChange={(e) => setValue("commercialRegistrationNumber", e.target.value || null)}
                    />
                    <FormInput
                      label="VAT ID"
                      name="vatID"
                      value={watchedFields.vatID || ""}
                      onChange={(e) => setValue("vatID", e.target.value || null)}
                    />

                    <FormInput
                      label="Twitter Site"
                      name="twitterSite"
                      value={watchedFields.twitterSite || ""}
                      onChange={(e) => setValue("twitterSite", e.target.value || null)}
                      placeholder="@username"
                    />
                    <FormSelect
                      label="Twitter Card"
                      name="twitterCard"
                      value={watchedFields.twitterCard || undefined}
                      onValueChange={(value) =>
                        setValue("twitterCard", value ? (value as "summary_large_image" | "summary") : null)
                      }
                      placeholder="Select card type"
                    >
                      <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                      <SelectItem value="summary">summary</SelectItem>
                    </FormSelect>

                    <FormTextarea
                      label="Same As"
                      name="sameAs"
                      value={Array.isArray(watchedFields.sameAs) ? watchedFields.sameAs.join(", ") : ""}
                      onChange={(e) => {
                        const urls = e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean);
                        setValue("sameAs", urls);
                      }}
                      rows={2}
                      placeholder="https://x.com/... , https://instagram.com/..."
                    />

                    <FormInput
                      label="GBP Profile URL"
                      name="gbpProfileUrl"
                      value={watchedFields.gbpProfileUrl || ""}
                      onChange={(e) => setValue("gbpProfileUrl", e.target.value || null)}
                      placeholder="https://g.page/..."
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gbp" className="border border-white/10 rounded-lg bg-white/5">
                <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground" />
                    Google Business Profile
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-3">
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="address" className="border border-white/10 rounded-lg bg-white/5">
                <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                  Address
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-3">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="City"
                        name="addressCity"
                        value={watchedFields.addressCity || ""}
                        onChange={(e) => setValue("addressCity", e.target.value || null)}
                      />
                      <FormInput
                        label="Neighborhood"
                        name="addressNeighborhood"
                        value={watchedFields.addressNeighborhood || ""}
                        onChange={(e) => setValue("addressNeighborhood", e.target.value || null)}
                      />
                    </div>
                    <FormInput
                      label="Street"
                      name="addressStreet"
                      value={watchedFields.addressStreet || ""}
                      onChange={(e) => setValue("addressStreet", e.target.value || null)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Region"
                        name="addressRegion"
                        value={watchedFields.addressRegion || ""}
                        onChange={(e) => setValue("addressRegion", e.target.value || null)}
                      />
                      <FormInput
                        label="Country"
                        name="addressCountry"
                        value={watchedFields.addressCountry || ""}
                        onChange={(e) => setValue("addressCountry", e.target.value || null)}
                        placeholder="SA"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput
                        label="Building Number"
                        name="addressBuildingNumber"
                        value={watchedFields.addressBuildingNumber || ""}
                        onChange={(e) => setValue("addressBuildingNumber", e.target.value || null)}
                      />
                      <FormInput
                        label="Additional Number"
                        name="addressAdditionalNumber"
                        value={watchedFields.addressAdditionalNumber || ""}
                        onChange={(e) => setValue("addressAdditionalNumber", e.target.value || null)}
                      />
                      <FormInput
                        label="Postal Code"
                        name="addressPostalCode"
                        value={watchedFields.addressPostalCode || ""}
                        onChange={(e) => setValue("addressPostalCode", e.target.value || null)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Latitude"
                        name="addressLatitude"
                        value={watchedFields.addressLatitude == null ? "" : String(watchedFields.addressLatitude)}
                        onChange={(e) =>
                          setValue("addressLatitude", e.target.value === "" ? null : Number(e.target.value))
                        }
                        type="number"
                      />
                      <FormInput
                        label="Longitude"
                        name="addressLongitude"
                        value={watchedFields.addressLongitude == null ? "" : String(watchedFields.addressLongitude)}
                        onChange={(e) =>
                          setValue("addressLongitude", e.target.value === "" ? null : Number(e.target.value))
                        }
                        type="number"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="business-details" className="border border-white/10 rounded-lg bg-white/5">
                <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                  Business Details
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-3">
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

                    <div className="rounded-md border border-border bg-background p-3">
                      <div className="text-sm font-semibold mb-3">Business Hours</div>
                      <div className="space-y-2">
                        {openingHours.map((day, idx) => (
                          <div key={day.dayOfWeek} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-2 text-sm text-muted-foreground">
                              {DAYS[idx]?.label ?? day.dayOfWeek}
                            </div>
                            <div className="col-span-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={!day.closed}
                                  onChange={(e) => {
                                    const next = [...openingHours];
                                    next[idx] = { ...next[idx], closed: !e.target.checked };
                                    setValue("openingHoursSpecification", next);
                                  }}
                                />
                                Open
                              </label>
                            </div>
                            <div className="col-span-4">
                              <input
                                type="time"
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                value={day.opens}
                                disabled={day.closed}
                                onChange={(e) => {
                                  const next = [...openingHours];
                                  next[idx] = { ...next[idx], opens: e.target.value };
                                  setValue("openingHoursSpecification", next);
                                }}
                              />
                            </div>
                            <div className="col-span-4">
                              <input
                                type="time"
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                value={day.closes}
                                disabled={day.closed}
                                onChange={(e) => {
                                  const next = [...openingHours];
                                  next[idx] = { ...openingHours[idx], closes: e.target.value };
                                  setValue("openingHoursSpecification", next);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {isEditMode && (
                <AccordionItem value="media" className="border border-white/10 rounded-lg bg-white/5">
                  <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                    Media
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-3">
                    <div className="space-y-6">
                      <MediaSocialSection form={form} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="analysis" className="border border-white/10 rounded-lg bg-white/5">
                <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                  SEO Analysis
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-3">
                  <div className="space-y-6">
                    <ClientSEOValidationSection
                      formData={seoData}
                      clientId={clientId}
                      mode={isEditMode ? "edit" : "new"}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="w-60 shrink-0">
            <div className="sticky top-[calc(57px+57px+16px)] z-30 space-y-4">
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

