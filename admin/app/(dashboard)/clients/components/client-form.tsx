"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useHeaderRef } from "./client-form-header-wrapper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Plus, Pencil, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { SecuritySection } from "./form-sections/security-section";
import { SettingsSection } from "./form-sections/settings-section";
import { TestDataButton } from "./test-data-button";
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
    taxID: form.watch("taxID"),
    organizationType: form.watch("organizationType"),
    keywords: form.watch("keywords"),
    knowsLanguage: form.watch("knowsLanguage"),
    businessActivityCode: form.watch("businessActivityCode"),
    isicV4: form.watch("isicV4"),
    slogan: form.watch("slogan"),
    numberOfEmployees: form.watch("numberOfEmployees"),
    parentOrganizationId: form.watch("parentOrganizationId"),
    sameAs: form.watch("sameAs"),
    contentPriorities: form.watch("contentPriorities"),
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
      watchedFields.taxID,
      watchedFields.organizationType,
      watchedFields.keywords,
      watchedFields.knowsLanguage,
      watchedFields.businessActivityCode,
      watchedFields.isicV4,
      watchedFields.slogan,
      watchedFields.numberOfEmployees,
      watchedFields.sameAs,
      watchedFields.contentPriorities,
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

  // Expose SEO Doctor to header via ref
  useEffect(() => {
    if (headerRef?.current && seoDoctorNode) {
      headerRef.current.setSEODoctor(seoDoctorNode);
    }
  }, [
    headerRef,
    seoDoctorNode,
    seoSettings,
    seoData,
  ]);

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
    const buttonClassName = isEditMode
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-green-600 hover:bg-green-700 text-white";

    return { buttonText, buttonIcon, buttonClassName };
  }, [loading, isEditMode]);


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
          <Tabs defaultValue="required" className="w-full">
          <div className="flex gap-6">
            {/* Left Column - Tab Content */}
            <div className="flex-1 min-w-0">

              {/* Information Tab */}
              <TabsContent value="required" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <BasicInfoSection form={form} industries={industries} />
                </div>
              </TabsContent>

              {/* Audience Tab */}
              <TabsContent value="business" className="space-y-6 mt-0">
                <BusinessSection form={form} industries={industries} />
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-6 mt-0">
                <SubscriptionSection form={form} isEditMode={isEditMode} tierConfigs={tierConfigs} />
              </TabsContent>

              {/* SEO and Schema Tab */}
              <TabsContent value="seo" className="space-y-6 mt-0">
                <SEOSection form={form} initialData={initialData} clients={clients} />
              </TabsContent>

              {/* SEO & Validation Tab */}
              <TabsContent value="seo-validation" className="space-y-6 mt-0">
                <ClientSEOValidationSection
                  formData={{
                    name: watchedFields.name || initialData?.name || "",
                    slug: watchedFields.slug || initialData?.slug || "",
                    legalName: watchedFields.legalName || initialData?.legalName || "",
                    url: watchedFields.url || initialData?.url || "",
                    email: watchedFields.email || initialData?.email || "",
                    phone: watchedFields.phone || initialData?.phone || "",
                    seoTitle: watchedFields.seoTitle || initialData?.seoTitle || "",
                    seoDescription: watchedFields.seoDescription || initialData?.seoDescription || "",
                    description: form.watch("description") || initialData?.description || "",
                    canonicalUrl: watchedFields.canonicalUrl || initialData?.canonicalUrl || "",
                    metaRobots: form.watch("metaRobots") ?? null,
                    organizationType: form.watch("organizationType") || initialData?.organizationType || "",
                    logoMedia: (initialData as any)?.logoMedia,
                    ogImageMedia: (initialData as any)?.ogImageMedia ?? null,
                    twitterImageMedia: (initialData as any)?.twitterImageMedia ?? null,
                    twitterCard: watchedFields.twitterCard || (initialData as any)?.twitterCard || null,
                    twitterTitle: watchedFields.twitterTitle || (initialData as any)?.twitterTitle || "",
                    twitterDescription: watchedFields.twitterDescription || (initialData as any)?.twitterDescription || "",
                    twitterSite: watchedFields.twitterSite || (initialData as any)?.twitterSite || "",
                    foundingDate: watchedFields.foundingDate || initialData?.foundingDate || null,
                    knowsLanguage: form.watch("knowsLanguage") || (initialData as any)?.knowsLanguage || [],
                    addressStreet: watchedFields.addressStreet || initialData?.addressStreet || "",
                    addressCity: watchedFields.addressCity || initialData?.addressCity || "",
                    addressCountry: watchedFields.addressCountry || initialData?.addressCountry || "",
                    addressPostalCode: watchedFields.addressPostalCode || initialData?.addressPostalCode || "",
                    addressLatitude: watchedFields.addressLatitude ?? (initialData as any)?.addressLatitude ?? null,
                    addressLongitude: watchedFields.addressLongitude ?? (initialData as any)?.addressLongitude ?? null,
                    businessActivityCode: watchedFields.businessActivityCode || (initialData as any)?.businessActivityCode || "",
                    parentOrganizationId: watchedFields.parentOrganizationId ?? (initialData as any)?.parentOrganizationId ?? null,
                    parentOrganization: (initialData as any)?.parentOrganization ?? null,
                  }}
                  clientId={clientId}
                  mode={isEditMode ? 'edit' : 'new'}
                />
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media-social" className="space-y-6 mt-0">
                {isEditMode ? (
                  <MediaSocialSection form={form} clientId={clientId} initialData={initialData} />
                ) : (
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-900 dark:text-blue-100">Media Management</AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      Media (logo, OG image, Twitter image) can be added after creating the client. You'll be able to upload and manage media in the edit view.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6 mt-0">
                <SecuritySection form={form} isEditMode={isEditMode} />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                {isEditMode ? (
                  <SettingsSection form={form} />
                ) : (
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-900 dark:text-blue-100">Settings</AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      Subscription and billing status can be managed after creating the client. Open the edit view
                      to adjust these settings.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

            </div>

            {/* Right Column - Vertical Tabs */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              <div className="sticky top-24 z-30 flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-xs">
                  {/* Meta group progress with hover analysis */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full text-left"
                      >
                        <span className="text-muted-foreground">Meta</span>
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={
                              groupPercentages.meta >= 80
                                ? "h-full bg-green-500"
                                : groupPercentages.meta >= 60
                                ? "h-full bg-yellow-500"
                                : "h-full bg-red-500"
                            }
                            style={{ width: `${groupPercentages.meta}%` }}
                          />
                        </div>
                        <span className="font-medium">{groupPercentages.meta}%</span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="left" align="start" className="w-72">
                      <p className="text-xs font-semibold mb-2">
                        Meta score: {groupPercentages.meta}%{" "}
                        {groupAnalysis && groupAnalysis.meta.score < groupAnalysis.meta.maxScore
                          ? "- هذه الحقول تؤثر على النتيجة:"
                          : "- جميع عناصر الميتا المستهدفة مكتملة."}
                      </p>
                      {groupAnalysis &&
                        groupAnalysis.meta.items
                          .filter((item) => item.status !== "good" && item.maxScore > 0)
                          .slice(0, 6)
                          .map((item) => (
                            <div key={item.field} className="flex items-start gap-2 mb-1">
                              {item.status === "error" && (
                                <AlertCircle className="h-3 w-3 text-red-600" aria-hidden="true" />
                              )}
                              {item.status === "warning" && (
                                <AlertTriangle className="h-3 w-3 text-yellow-600" aria-hidden="true" />
                              )}
                              {item.status === "info" && (
                                <InfoIcon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{item.field}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          ))}
                      {groupAnalysis &&
                        groupAnalysis.meta.items.filter(
                          (i) => i.status !== "good" && i.maxScore > 0
                        ).length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            كل عناصر الميتا المستخدمة للحساب مكتملة وتبدو جيدة.
                          </p>
                        )}
                    </HoverCardContent>
                  </HoverCard>

                  {/* JSON-LD group progress with hover analysis */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full text-left"
                      >
                        <span className="text-muted-foreground">JSON-LD</span>
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={
                              groupPercentages.jsonLd >= 80
                                ? "h-full bg-green-500"
                                : groupPercentages.jsonLd >= 60
                                ? "h-full bg-yellow-600"
                                : "h-full bg-red-500"
                            }
                            style={{ width: `${groupPercentages.jsonLd}%` }}
                          />
                        </div>
                        <span className="font-medium">{groupPercentages.jsonLd}%</span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="left" align="start" className="w-72">
                      <p className="text-xs font-semibold mb-2">
                        JSON-LD score: {groupPercentages.jsonLd}%{" "}
                        {groupAnalysis && groupAnalysis.jsonLd.score < groupAnalysis.jsonLd.maxScore
                          ? "- هذه الحقول تؤثر على النتيجة:"
                          : "- جميع عناصر JSON‑LD المستهدفة مكتملة."}
                      </p>
                      {groupAnalysis &&
                        groupAnalysis.jsonLd.items
                          .filter((item) => item.status !== "good" && item.maxScore > 0)
                          .slice(0, 6)
                          .map((item) => (
                            <div key={item.field} className="flex items-start gap-2 mb-1">
                              {item.status === "error" && (
                                <AlertCircle className="h-3 w-3 text-red-600" aria-hidden="true" />
                              )}
                              {item.status === "warning" && (
                                <AlertTriangle className="h-3 w-3 text-yellow-600" aria-hidden="true" />
                              )}
                              {item.status === "info" && (
                                <InfoIcon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{item.field}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          ))}
                      {groupAnalysis &&
                        groupAnalysis.jsonLd.items.filter(
                          (i) => i.status !== "good" && i.maxScore > 0
                        ).length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            كل عناصر JSON‑LD المستخدمة للحساب مكتملة وتبدو جيدة.
                          </p>
                        )}
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <TabsList className="flex flex-col h-auto w-full bg-muted p-1.5 gap-1.5">
                  <TabsTrigger value="required" className="w-full justify-start relative">
                    Information
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getVisibleFieldCount("required", isEditMode)}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="business" className="w-full justify-start relative">
                    Audience
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getVisibleFieldCount("business", isEditMode)}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="w-full justify-start relative">
                    Subscription
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getVisibleFieldCount("subscription", isEditMode)}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="w-full justify-start relative">
                    SEO and Schema
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getVisibleFieldCount("seo", isEditMode)}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="seo-validation" className="w-full justify-start relative">
                    SEO & Validation
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getVisibleFieldCount("seo-validation", isEditMode)}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="media-social" 
                    disabled={!isEditMode}
                    className="w-full justify-start relative"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate">Media</span>
                      {!isEditMode && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                          <Info className="h-3 w-3" />
                          On edit only
                        </span>
                      )}
                    </div>
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                      {getVisibleFieldCount("media-social", isEditMode)}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="w-full justify-start relative">
                    Security
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getVisibleFieldCount("security", isEditMode)}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    disabled={!isEditMode}
                    className="w-full justify-start relative"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate">Settings</span>
                      {!isEditMode && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                          <Info className="h-3 w-3" />
                          On edit only
                        </span>
                      )}
                    </div>
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                      {getVisibleFieldCount("settings", isEditMode)}
                    </span>
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <TestDataButton
                    form={form}
                    industries={industries}
                    tierConfigs={tierConfigs}
                    clients={clients}
                  />
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
        </Tabs>
        </div>
      </div>
    </form>
  );
}
