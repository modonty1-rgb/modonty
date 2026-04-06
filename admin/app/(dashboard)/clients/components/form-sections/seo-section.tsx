"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput, FormTextarea, FormSelect, FormNativeSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import { CharacterCounter } from "@/components/shared/character-counter";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import { getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { useState, useEffect } from "react";
import { ChevronDown, AlertCircle, AlertTriangle } from "lucide-react";

interface SEOSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  initialData?: Partial<ClientWithRelations>;
  clients?: Array<{ id: string; name: string; slug: string }>;
}

export function SEOSection({
  form,
  initialData,
  clients = [],
}: SEOSectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [openSections, setOpenSections] = useState({
    metaBasics: false,
    schemaContent: false,
    organization: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const seoTitleHint = seoSettings 
    ? `SEO title shown in search engine results — optimal length between ${seoSettings.seoTitleMin} and ${seoSettings.seoTitleMax} characters — should be compelling and accurately describe the content — used in title tag and Open Graph`
    : "SEO title shown in search engine results — optimal length between 30 and 60 characters — should be compelling and accurately describe the content — used in title tag and Open Graph";
  
  const seoDescriptionHint = seoSettings
    ? `Description shown below the title in search results — optimal length between ${seoSettings.seoDescriptionMin} and ${seoSettings.seoDescriptionMax} characters — should be compelling and encourage clicks — used in meta description tag`
    : "Description shown below the title in search results — optimal length between 120 and 160 characters — should be compelling and encourage clicks — used in meta description tag";

  const twitterTitleHint = seoSettings
    ? `Custom Twitter/X title for social sharing — max length: ${seoSettings.twitterTitleMax} characters — used in Twitter Cards to optimize social media posts — only used if different from SEO Title`
    : "Custom Twitter/X title for social sharing — max length: 70 characters — used in Twitter Cards to optimize social media posts — only used if different from SEO Title";

  const twitterDescriptionHint = seoSettings
    ? `Custom Twitter/X description for social sharing — max length: ${seoSettings.twitterDescriptionMax} characters — used in Twitter Cards to optimize social media posts — only used if different from SEO Description`
    : "Custom Twitter/X description for social sharing — max length: 200 characters — used in Twitter Cards to optimize social media posts — only used if different from SEO Description";

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSEOSettings();
        setSeoSettings(settings);
      } catch (error) {
        console.error("Failed to load SEO settings:", error);
      }
    }
    loadSettings();
  }, []);

  const seoTitleValue = (watch("seoTitle") || "") as string;
  const seoDescriptionValue = (watch("seoDescription") || "") as string;
  const canonicalUrlValue = (watch("canonicalUrl") || "") as string;
  const descriptionValue = (watch("description") || "") as string;
  const keywordsValue = watch("keywords");
  const knowsLanguageValue = watch("knowsLanguage");
  const organizationTypeValue = watch("organizationType");

  const hasMetaBasicsErrors = Boolean(
    errors.seoTitle ||
      errors.seoDescription ||
      errors.canonicalUrl ||
      errors.metaRobots ||
      errors.twitterCard ||
      errors.twitterTitle ||
      errors.twitterDescription ||
      errors.twitterSite ||
      errors.gtmId,
  );
  const hasSchemaContentErrors = Boolean(
    errors.description || errors.keywords || errors.knowsLanguage
  );
  const hasOrganizationErrors = Boolean(
    errors.parentOrganizationId ||
      errors.organizationType
  );

  const seoTitleLength = seoTitleValue.trim().length;
  const seoDescriptionLength = seoDescriptionValue.trim().length;

  const seoTitleMin = seoSettings?.seoTitleMin ?? 30;
  const seoTitleMax = seoSettings?.seoTitleMax ?? 60;
  const seoDescriptionMin = seoSettings?.seoDescriptionMin ?? 120;
  const seoDescriptionMax = seoSettings?.seoDescriptionMax ?? 160;

  const warningCounts = {
    metaBasics:
      // SEO title: warn when empty OR outside recommended range
      (seoTitleLength === 0
        ? 1
        : seoTitleLength < seoTitleMin || seoTitleLength > seoTitleMax
        ? 1
        : 0) +
      // SEO description: warn when empty OR outside recommended range
      (seoDescriptionLength === 0
        ? 1
        : seoDescriptionLength < seoDescriptionMin || seoDescriptionLength > seoDescriptionMax
        ? 1
        : 0) +
      // Canonical URL: warn when missing
      (canonicalUrlValue.trim() ? 0 : 1),
    schemaContent:
      (descriptionValue.trim().length >= 100 ? 0 : 1) +
      (Array.isArray(keywordsValue) && keywordsValue.length ? 0 : 1) +
      (Array.isArray(knowsLanguageValue) && knowsLanguageValue.length ? 0 : 1),
    organization:
      (organizationTypeValue ? 0 : 1),
  } as const;

  return (
    <div className="space-y-6">
      {/* Meta basics */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("metaBasics")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.metaBasics ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Meta basics
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasMetaBasicsErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {warningCounts.metaBasics > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {warningCounts.metaBasics}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>

        {openSections.metaBasics && (
          <div className="space-y-3">
            <div>
              <FormInput
                label="SEO Title"
                name="seoTitle"
                value={watch("seoTitle") || ""}
                onChange={(e) => setValue("seoTitle", e.target.value || null, { shouldValidate: true })}
                error={errors.seoTitle?.message}
                placeholder="e.g., Best Services in Saudi Arabia | Company Name"
                hint={seoTitleHint}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("seoTitle") || "").length}
                    min={seoSettings.seoTitleMin}
                    max={seoSettings.seoTitleMax}
                    restrict={seoSettings.seoTitleRestrict}
                    className="ml-1"
                    belowMinHint="Below recommended length. Per Google Search Central, titles between 50-60 characters display fully in search results."
                    aboveMaxHint="Exceeds recommended length. Google typically truncates titles after ~60 characters in search results."
                  />
                </div>
              )}
            </div>
            <div>
              <FormTextarea
                label="SEO Description"
                name="seoDescription"
                value={watch("seoDescription") || ""}
                onChange={(e) => setValue("seoDescription", e.target.value || null, { shouldValidate: true })}
                rows={3}
                error={errors.seoDescription?.message}
                placeholder="e.g., Leading provider of professional services in Saudi Arabia. Trusted by thousands of clients..."
                hint={seoDescriptionHint}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("seoDescription") || "").length}
                    min={seoSettings.seoDescriptionMin}
                    max={seoSettings.seoDescriptionMax}
                    restrict={seoSettings.seoDescriptionRestrict}
                    className="ml-1"
                    belowMinHint="Description is too short. Ideal length is 120-158 characters for full display in search results (Google Search Central)."
                    aboveMaxHint="Exceeds recommended length. Keep it between 120-158 characters to avoid truncation in search results."
                  />
                </div>
              )}
            </div>
            <FormInput
              label="Canonical URL"
              name="canonicalUrl"
              type="url"
              value={watch("canonicalUrl") || ""}
              onChange={(e) => setValue("canonicalUrl", e.target.value || null, { shouldValidate: true })}
              error={errors.canonicalUrl?.message}
              placeholder="https://example.com/page"
              hint="Canonical URL prevents duplicate content issues — used when similar content exists on different URLs — helps search engines identify the original page — used in canonical link tag"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Meta Robots"
                name="metaRobots"
                value={watch("metaRobots") || undefined}
                onValueChange={(value) =>
                  setValue(
                    "metaRobots",
                    value
                      ? (value as "index, follow" | "noindex, follow" | "index, nofollow" | "noindex, nofollow")
                      : null,
                    { shouldValidate: true }
                  )
                }
                error={errors.metaRobots?.message}
                hint="Controls how search engines index this client's pages — index, follow: allow indexing and follow links (default) — noindex, follow: don't index but follow links — index, nofollow: index but don't follow links — noindex, nofollow: don't index or follow links"
                placeholder="Select robots directive"
              >
                <SelectItem value="index, follow">index, follow (Default - Allow indexing)</SelectItem>
                <SelectItem value="noindex, follow">noindex, follow (Don't index, but follow links)</SelectItem>
                <SelectItem value="index, nofollow">index, nofollow (Index, but don't follow links)</SelectItem>
                <SelectItem value="noindex, nofollow">noindex, nofollow (Don't index or follow)</SelectItem>
              </FormSelect>
              <FormSelect
                label="Twitter Card Type"
                name="twitterCard"
                value={watch("twitterCard") || "auto"}
                onValueChange={(value) => setValue("twitterCard", value === "auto" ? null : (value as "summary" | "summary_large_image"), { shouldValidate: true })}
                error={errors.twitterCard?.message}
                hint="Card type used for Twitter/X shares — determines how content is displayed when shared on Twitter/X — used to optimize content appearance on the Twitter/X platform"
              >
                <SelectItem value="auto">Auto-generate from OG tags</SelectItem>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
              </FormSelect>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  label="Twitter Title"
                  name="twitterTitle"
                  value={watch("twitterTitle") || ""}
                  onChange={(e) =>
                    setValue("twitterTitle", e.target.value || null, { shouldValidate: true })
                  }
                  error={errors.twitterTitle?.message}
                  hint={twitterTitleHint}
                />
                {seoSettings && (
                  <div className="mt-1">
                    <CharacterCounter
                      current={(watch("twitterTitle") || "").length}
                      max={seoSettings.twitterTitleMax}
                      restrict={seoSettings.twitterTitleRestrict}
                      className="ml-1"
                      aboveMaxHint="Exceeds Twitter Cards limit (70 chars). May be truncated in posts (X Developer Docs)."
                    />
                  </div>
                )}
              </div>
              <FormInput
                label="Twitter Site"
                name="twitterSite"
                value={watch("twitterSite") || ""}
                onChange={(e) =>
                  setValue("twitterSite", e.target.value || null, { shouldValidate: true })
                }
                error={errors.twitterSite?.message}
                placeholder="@username"
                hint="Twitter/X username (e.g., @company) — used for attribution and linking to the official account — helps connect content to the company's official Twitter/X account"
              />
            </div>
            <div>
              <FormTextarea
                label="Twitter Description"
                name="twitterDescription"
                value={watch("twitterDescription") || ""}
                onChange={(e) =>
                  setValue("twitterDescription", e.target.value || null, { shouldValidate: true })
                }
                rows={2}
                error={errors.twitterDescription?.message}
                hint={twitterDescriptionHint}
              />
              {seoSettings && (
                <div className="mt-1">
                  <CharacterCounter
                    current={(watch("twitterDescription") || "").length}
                    max={seoSettings.twitterDescriptionMax}
                    restrict={seoSettings.twitterDescriptionRestrict}
                    className="ml-1"
                    aboveMaxHint="Exceeds Twitter Cards limit (200 chars). May be truncated in posts (X Developer Docs)."
                  />
                </div>
              )}
            </div>
            <FormInput
              label="Google Tag Manager ID (Optional)"
              name="gtmId"
              value={watch("gtmId") || ""}
              onChange={(e) => setValue("gtmId", e.target.value || null, { shouldValidate: true })}
              error={errors.gtmId?.message}
              placeholder="GTM-XXXXXXX"
              hint="Only required if the client wants a separate Google Tag Manager container — leave empty for automatic tracking via the main container — most clients don't need this — all client articles are automatically tracked via the main container with a unique client ID"
            />
          </div>
        )}
      </div>

      {/* Schema content */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("schemaContent")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.schemaContent ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Schema content
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasSchemaContentErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {warningCounts.schemaContent > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {warningCounts.schemaContent}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>

        {openSections.schemaContent && (
          <div className="space-y-3">
            <div>
              <FormTextarea
                label="Organization Description"
                name="description"
                value={watch("description") || ""}
                onChange={(e) => setValue("description", e.target.value || null, { shouldValidate: true })}
                rows={3}
                error={errors.description?.message}
                placeholder="Describe your organization's mission, values, and key achievements..."
                hint="Organization description in Schema.org structured data — separate from SEO description — used in JSON-LD structured data — describes the organization's mission, values, and key achievements — minimum 100 characters, optimal ~300 characters for best SEO"
              />
              <div className="mt-1">
                <CharacterCounter
                  current={(watch("description") || "").length}
                  min={100}
                  max={500}
                  className="ml-1"
                  belowMinHint="At least 100 characters recommended for an adequate Schema.org structured data description."
                  aboveMaxHint="Keep it concise (up to 500 chars) for better clarity in Schema.org. Full description belongs on the About page."
                />
              </div>
            </div>
            <FormTextarea
              label="Keywords"
              name="keywords"
              value={
                Array.isArray(watch("keywords"))
                  ? watch("keywords").join(", ")
                  : ((typeof watch("keywords") === "string" ? watch("keywords") : "") as string)
              }
              onChange={(e) => {
                const keywords = e.target.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean);
                setValue("keywords", keywords, { shouldValidate: true });
              }}
              rows={2}
              error={errors.keywords?.message}
              placeholder="e.g., technology, innovation, consulting, digital transformation"
              hint="Keywords for Schema.org classification — comma-separated — used in structured data for SEO — helps classify the company by activity and sector (e.g., technology, consulting, digital transformation)"
            />
            <FormTextarea
              label="Knows Language"
              name="knowsLanguage"
              value={
                Array.isArray(watch("knowsLanguage"))
                  ? watch("knowsLanguage").join(", ")
                  : ((typeof watch("knowsLanguage") === "string" ? watch("knowsLanguage") : "") as string)
              }
              onChange={(e) => {
                const languages = e.target.value
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean);
                setValue("knowsLanguage", languages, { shouldValidate: true });
              }}
              rows={2}
              error={errors.knowsLanguage?.message}
              placeholder="e.g., Arabic, English"
              hint="Supported languages in Schema.org ContactPoint (e.g., Arabic, English) — used in structured data for SEO — helps search engines understand the languages the company communicates in"
            />
          </div>
        )}
      </div>

      {/* Organization & hierarchy */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("organization")}
          className="flex flex-col gap-1 mb-1 w-full text-left"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform ${
                  openSections.organization ? "rotate-0" : "-rotate-90"
                }`}
              />
              <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
                Organization & hierarchy
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {hasOrganizationErrors && (
                <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
              )}
              {warningCounts.organization > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                  {warningCounts.organization}
                </span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-border" />
        </button>

        {openSections.organization && (
          <div className="space-y-4">
            <div>
              <FormNativeSelect
                label="Parent Organization"
                name="parentOrganizationId"
                value={watch("parentOrganizationId") || ""}
                onChange={(e) => setValue("parentOrganizationId", e.target.value || null, { shouldValidate: true })}
                error={errors.parentOrganizationId?.message}
                placeholder="Select parent organization (optional)"
                hint="Link this client to a parent company or organization — used in Schema.org hierarchical relationships — only set if this client is a subsidiary or division of another organization — helps define company structure"
              >
                <option value="">None (Independent Organization)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </FormNativeSelect>
              <p className="text-xs text-muted-foreground mt-2">
                Parent organization is used in Schema.org structured data to create the organizational hierarchy. Only set this if
                this client is a subsidiary or division of another organization.
              </p>
            </div>
            <FormSelect
              label="Organization Type"
              name="organizationType"
              value={watch("organizationType") || undefined}
              onValueChange={(value) =>
                setValue(
                  "organizationType",
                  value
                    ? (value as
                        | "Organization"
                        | "Corporation"
                        | "LocalBusiness"
                        | "NonProfit"
                        | "EducationalOrganization"
                        | "GovernmentOrganization"
                        | "SportsOrganization"
                        | "NGO")
                    : null,
                  { shouldValidate: true }
                )
              }
              error={errors.organizationType?.message}
              hint="For SEO/Schema.org: classifies the organization type for search engines (Organization, Corporation, LocalBusiness, NonProfit, etc.) — different from Legal Form — used in Schema.org @type for SEO — helps search engines understand the entity type"
              placeholder="Select Organization Type"
            >
              <SelectItem value="Organization">Organization</SelectItem>
              <SelectItem value="Corporation">Corporation</SelectItem>
              <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
              <SelectItem value="NonProfit">NonProfit</SelectItem>
              <SelectItem value="EducationalOrganization">EducationalOrganization</SelectItem>
              <SelectItem value="GovernmentOrganization">GovernmentOrganization</SelectItem>
              <SelectItem value="SportsOrganization">SportsOrganization</SelectItem>
              <SelectItem value="NGO">NGO</SelectItem>
            </FormSelect>
          </div>
        )}
      </div>
    </div>
  );
}
