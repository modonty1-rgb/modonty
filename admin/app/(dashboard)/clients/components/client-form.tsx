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
import type { ClientFormData, ClientWithRelations, FormSubmitResult } from "@/lib/types";
import { buildClientSeoData } from "../helpers/build-client-seo-data";

interface ClientFormProps {
  initialData?: Partial<ClientWithRelations>;
  industries?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string; slug: string }>;
  onSubmit: (data: ClientFormData) => Promise<FormSubmitResult>;
  clientId?: string;
}

export function ClientForm({ initialData, industries = [], clients = [], onSubmit, clientId }: ClientFormProps) {
  const headerRef = useHeaderRef();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);

  const { form, handleSubmit, loading, error, setError, tierConfigs, isEditMode } = useClientForm({
    initialData,
    onSubmit,
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

  // Watch all form fields that affect SEO Doctor
  const watchedFields = {
    name: form.watch("name"),
    slug: form.watch("slug"),
    legalName: form.watch("legalName"),
    alternateName: form.watch("alternateName"),
    url: form.watch("url"),
    email: form.watch("email"),
    phone: form.watch("phone"),
    seoTitle: form.watch("seoTitle"),
    seoDescription: form.watch("seoDescription"),
    description: form.watch("description"),
    businessBrief: form.watch("businessBrief"),
    gtmId: form.watch("gtmId"),
    canonicalUrl: form.watch("canonicalUrl"),
    metaRobots: form.watch("metaRobots"),
    twitterCard: form.watch("twitterCard"),
    twitterTitle: form.watch("twitterTitle"),
    twitterDescription: form.watch("twitterDescription"),
    twitterSite: form.watch("twitterSite"),
    contactType: form.watch("contactType"),
    addressStreet: form.watch("addressStreet"),
    addressBuildingNumber: form.watch("addressBuildingNumber"),
    addressAdditionalNumber: form.watch("addressAdditionalNumber"),
    addressNeighborhood: form.watch("addressNeighborhood"),
    addressCity: form.watch("addressCity"),
    addressRegion: form.watch("addressRegion"),
    addressCountry: form.watch("addressCountry"),
    addressPostalCode: form.watch("addressPostalCode"),
    addressLatitude: form.watch("addressLatitude"),
    addressLongitude: form.watch("addressLongitude"),
    commercialRegistrationNumber: form.watch("commercialRegistrationNumber"),
    vatID: form.watch("vatID"),
    organizationType: form.watch("organizationType"),
    keywords: form.watch("keywords"),
    knowsLanguage: form.watch("knowsLanguage"),
    slogan: form.watch("slogan"),
    numberOfEmployees: form.watch("numberOfEmployees"),
    parentOrganizationId: form.watch("parentOrganizationId"),
    sameAs: form.watch("sameAs"),
    foundingDate: form.watch("foundingDate"),
  };

  const seoData = useMemo(
    () =>
      buildClientSeoData(initialData, {
        ...watchedFields,
      }),
    [
      initialData,
      watchedFields.name,
      watchedFields.slug,
      watchedFields.legalName,
      watchedFields.alternateName,
      watchedFields.url,
      watchedFields.email,
      watchedFields.phone,
      watchedFields.seoTitle,
      watchedFields.seoDescription,
      watchedFields.description,
      watchedFields.businessBrief,
      watchedFields.gtmId,
      watchedFields.canonicalUrl,
      watchedFields.metaRobots,
      watchedFields.twitterCard,
      watchedFields.twitterTitle,
      watchedFields.twitterDescription,
      watchedFields.twitterSite,
      watchedFields.contactType,
      watchedFields.addressStreet,
      watchedFields.addressBuildingNumber,
      watchedFields.addressAdditionalNumber,
      watchedFields.addressNeighborhood,
      watchedFields.addressCity,
      watchedFields.addressRegion,
      watchedFields.addressCountry,
      watchedFields.addressPostalCode,
      watchedFields.addressLatitude,
      watchedFields.addressLongitude,
      watchedFields.commercialRegistrationNumber,
      watchedFields.vatID,
      watchedFields.organizationType,
      watchedFields.keywords,
      watchedFields.knowsLanguage,
      watchedFields.slogan,
      watchedFields.numberOfEmployees,
      watchedFields.sameAs,
      watchedFields.foundingDate,
      watchedFields.parentOrganizationId,
    ],
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
                      <span>ملاحظات</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" side="bottom" align="end">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>📁 جميع ملفات الميديا تُدار من صفحة التعديل بعد حفظ العميل.</p>
                      <p>🔍 بيانات الـ SEO تُضاف بعد حفظ العميل — من زر Setup SEO.</p>
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

            <div className="hidden">
              <div className="sticky top-[calc(57px+57px+16px)] z-30 space-y-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-semibold mb-3">Required Fields</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>○ Client Name</li>
                    <li>○ Email</li>
                    <li>○ Password</li>
                    <li>○ Business Brief</li>
                  </ul>
                </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
