"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useHeaderRef } from "./client-form-header-wrapper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, Plus, Pencil, Loader2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AlertCircle, AlertTriangle, CheckCircle2, Info as InfoIcon } from "lucide-react";
import { SEODoctor } from "@/components/shared/seo-doctor";
import { createOrganizationSEOConfig, createOrganizationSEOConfigFull } from "../helpers/client-seo-config";
import { getSEOSettings, type SEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { useClientForm } from "../helpers/hooks/use-client-form";
import { clientFormSections, getVisibleFieldCount } from "../helpers/client-form-config";
import { BasicInfoSection } from "./form-sections/basic-info-section";
import { SubscriptionSection } from "./form-sections/subscription-section";
import { BusinessSection } from "./form-sections/business-section";
import { SEOSection } from "./form-sections/seo-section";
import { ClientSEOValidationSection } from "./form-sections/client-seo-validation-section";
import { MediaSocialSection } from "./form-sections/media-social-section";
import { SettingsSection } from "./form-sections/settings-section";
import {
  createClientSEOGroupScores,
  createClientSEOGroupAnalysis,
  type ClientSEOGroupAnalysis,
} from "../helpers/client-seo-group-scores";
import type { ClientWithRelations } from "@/lib/types";
import { buildClientSeoData } from "../helpers/build-client-seo-data";

interface ClientFormProps {
  initialData?: Partial<ClientWithRelations>;
  industries?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string; slug: string }>;
  clientId?: string;
}

export function ClientForm({ initialData, industries = [], clients = [], clientId }: ClientFormProps) {
  const headerRef = useHeaderRef();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);

  const { form, handleSubmit, loading, error, setError, tierConfigs, isEditMode } = useClientForm({
    initialData,
    clientId,
  });

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

  const watchedValues = form.watch();

  const seoFieldsKey = useMemo(() => {
    const { name, slug, legalName, alternateName, url, email, phone,
      seoTitle, seoDescription, description, businessBrief, gtmId,
      canonicalUrl, metaRobots, twitterCard, twitterTitle, twitterDescription,
      twitterSite, contactType, addressStreet, addressBuildingNumber,
      addressAdditionalNumber, addressNeighborhood, addressCity, addressRegion,
      addressCountry, addressPostalCode, addressLatitude, addressLongitude,
      commercialRegistrationNumber, vatID, organizationType, keywords,
      knowsLanguage, slogan, numberOfEmployees, parentOrganizationId,
      sameAs, foundingDate } = watchedValues;
    return JSON.stringify({
      name, slug, legalName, alternateName, url, email, phone,
      seoTitle, seoDescription, description, businessBrief, gtmId,
      canonicalUrl, metaRobots, twitterCard, twitterTitle, twitterDescription,
      twitterSite, contactType, addressStreet, addressBuildingNumber,
      addressAdditionalNumber, addressNeighborhood, addressCity, addressRegion,
      addressCountry, addressPostalCode, addressLatitude, addressLongitude,
      commercialRegistrationNumber, vatID, organizationType, keywords,
      knowsLanguage, slogan, numberOfEmployees, parentOrganizationId,
      sameAs, foundingDate,
    });
  }, [watchedValues]);

  const seoData = useMemo(
    () => buildClientSeoData(initialData, watchedValues),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialData, seoFieldsKey],
  );

  let groupPercentages = { meta: 0, jsonLd: 0 };
  let groupAnalysis: ClientSEOGroupAnalysis | null = null;
  let seoConfigCore: ReturnType<typeof createOrganizationSEOConfig> | null = null;
  let seoConfigFull: ReturnType<typeof createOrganizationSEOConfigFull> | null = null;

  if (seoSettings) {
    // Core config powers the main SEO Doctor header bar
    seoConfigCore = createOrganizationSEOConfig(seoSettings);
    // Full config powers the Meta / JSON-LD side progress bars
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

  const seoDoctorNode = seoConfigCore ? (
    <SEODoctor
      data={seoData}
      config={seoConfigCore}
    />
  ) : null;

  // Expose action buttons to header via ref
  const buttonConfig = useMemo(() => {
    const buttonText = loading ? "Saving..." : isEditMode ? "Update Client" : "Create Client";
    const buttonIcon = loading ? (
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
    ) : isEditMode ? (
      <Pencil className="h-4 w-4 mr-2" />
    ) : (
      <Plus className="h-4 w-4 mr-2" />
    );
    return { buttonText, buttonIcon, buttonClassName: undefined };
  }, [loading, isEditMode]);

  useEffect(() => {
    if (clientId) {
      headerRef.current?.setSEODoctor(seoDoctorNode);
    }
    headerRef.current?.setActionButtons(
      <Button
        type="button"
        variant="default"
        className={buttonConfig.buttonClassName}
        disabled={loading}
        onClick={() => {
          if (formRef.current) {
            formRef.current.requestSubmit();
          }
        }}
      >
        {buttonConfig.buttonIcon}
        {buttonConfig.buttonText}
      </Button>
    );
  }, [headerRef, seoDoctorNode, buttonConfig, loading, clientId]);

  return (
    <form ref={formRef} id="client-form" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div
            className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* Tab-based Form Sections - Vertical Layout */}
        <div suppressHydrationWarning>
          <div className="flex gap-6">
            <div className="flex-1 min-w-0 space-y-6">
              {!isEditMode && (
                <div className="space-y-3">
                  {/* Media info moved to header icon */}
                  {/* SEO info moved to header icon */}
                </div>
              )}

              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-medium">Required:</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">○ Client Name</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">○ Email</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">○ Password</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">○ Business Brief</span>
                </div>
                <div className="flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Notes</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" side="bottom" align="end">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>All media files are managed from the edit page after saving the client.</p>
                      <p>SEO data is added after saving the client — from the edit page.</p>
                    </div>
                  </PopoverContent>
                </Popover>
                </div>
              </div>

              <Accordion type="multiple" defaultValue={["client-info"]} className="w-full">
                <AccordionItem value="client-info" className="border border-white/10 rounded-lg bg-white/5">
                  <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                    Client Info
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-3">
                    <div className="space-y-6">
                      <BasicInfoSection form={form} industries={industries} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="company" className="border border-white/10 rounded-lg bg-white/5">
                  <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                    Company Profile
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-3">
                    <div className="space-y-6">
                      <BusinessSection form={form} industries={industries} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="subscription" className="border border-white/10 rounded-lg bg-white/5">
                  <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                    Subscription
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-3">
                    <div className="space-y-6">
                      <SubscriptionSection form={form} isEditMode={isEditMode} tierConfigs={tierConfigs} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {isEditMode && (
                  <AccordionItem value="settings" className="border border-white/10 rounded-lg bg-white/5">
                    <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                      Settings
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <SettingsSection form={form} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

          </div>
        </div>
      </div>
    </form>
  );
}
