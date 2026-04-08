"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useHeaderRef } from "./client-form-header-wrapper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Pencil, Loader2 } from "lucide-react";
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

              {isEditMode && (
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-[10px] text-muted-foreground font-medium">Required:</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">Client Name</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">Email</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">Business Brief</span>
                </div>
              )}

              {!isEditMode ? (
                /* CREATE MODE — flat, essentials only */
                <div className="space-y-6">
                  {watchedValues.slug && (
                    <div className="flex justify-end">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        https://modonty.com/clients/{watchedValues.slug}
                      </span>
                    </div>
                  )}
                  <BasicInfoSection form={form} industries={industries} />
                  <SubscriptionSection form={form} isEditMode={false} tierConfigs={tierConfigs} />
                </div>
              ) : (
                /* EDIT MODE — accordion with all sections */
                <Accordion type="multiple" defaultValue={["client-info"]} className="w-full">
                  <AccordionItem value="client-info" className="border border-white/10 rounded-lg bg-white/5">
                    <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                      <div className="flex items-center justify-between w-full pe-2">
                        <span>Client Info</span>
                        {watchedValues.slug && (
                          <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            https://modonty.com/clients/{watchedValues.slug}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <BasicInfoSection form={form} industries={industries} isEditMode />
                        <SubscriptionSection form={form} isEditMode tierConfigs={tierConfigs} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="company" className="border border-white/10 rounded-lg bg-white/5">
                    <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                      Company Profile
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <BusinessSection form={form} industries={industries} clients={clients} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="seo" className="border border-white/10 rounded-lg bg-white/5">
                    <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                      SEO Details
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <SEOSection form={form} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="seo-validation" className="border border-white/10 rounded-lg bg-white/5">
                    <AccordionTrigger className="hover:bg-muted/20 data-[state=open]:bg-white/8 data-[state=open]:hover:bg-muted/40 px-4 py-3">
                      SEO Validation
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <ClientSEOValidationSection
                          formData={watchedValues}
                          clientId={clientId}
                          mode="edit"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

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
                </Accordion>
              )}
            </div>

          </div>
        </div>
      </div>
    </form>
  );
}
