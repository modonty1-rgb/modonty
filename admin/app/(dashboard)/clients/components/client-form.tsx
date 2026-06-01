"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useHeaderRef } from "./client-form-header-wrapper";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Pencil, Loader2, ImageIcon, AlertTriangle, X } from "lucide-react";
import NextImage from "next/image";
import { ClientLogoModal } from "./client-logo-modal";
import { ClientHeroModal } from "./client-hero-modal";
import { useClientForm } from "../helpers/hooks/use-client-form";
import { BasicInfoSection } from "./form-sections/basic-info-section";
import { SubscriptionSection } from "./form-sections/subscription-section";
import { BusinessSection } from "./form-sections/business-section";
import { YmylSection } from "./form-sections/ymyl-section";
import { SEOSection } from "./form-sections/seo-section";
import { ClientSEOValidationSection } from "./form-sections/client-seo-validation-section";
import { SettingsSection } from "./form-sections/settings-section";
import type { ClientWithRelations } from "@/lib/types";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";

// Every accordion section in edit mode — opened all at once on a failed submit so
// the blocking field is never hidden inside a collapsed section.
const EDIT_SECTION_IDS = ["client-info", "company", "ymyl", "seo", "seo-validation", "settings"];

interface ClientFormProps {
  initialData?: Partial<ClientWithRelations>;
  industries?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string; slug: string }>;
  clientId?: string;
  /** Site base URL from Settings.siteUrl (passed by server parent). */
  siteUrl: string;
}

export function ClientForm({ initialData, industries = [], clients = [], clientId, siteUrl }: ClientFormProps) {
  const headerRef = useHeaderRef();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["client-info"]);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    (initialData?.logoMedia as { url?: string } | null)?.url ?? null
  );
  const [currentHeroUrl, setCurrentHeroUrl] = useState<string | null>(
    (initialData?.heroImageMedia as { url?: string } | null)?.url ?? null
  );

  useEffect(() => {
    setCurrentLogoUrl((initialData?.logoMedia as { url?: string } | null)?.url ?? null);
  }, [(initialData?.logoMedia as { url?: string } | null)?.url]);

  useEffect(() => {
    setCurrentHeroUrl((initialData?.heroImageMedia as { url?: string } | null)?.url ?? null);
  }, [(initialData?.heroImageMedia as { url?: string } | null)?.url]);

  const { form, handleSubmit, loading, error, setError, invalidFields, setInvalidFields, tierConfigs, isEditMode } = useClientForm({
    initialData,
    clientId,
  });
  const bannerRef = useRef<HTMLDivElement>(null);

  const watchedValues = form.watch();

  // Subscribe to submit attempts. On a FAILED submit, reveal every accordion
  // section (so the blocking field is mounted) and scroll the user up to the
  // prominent error banner — no more clicking Save with nothing happening.
  const { submitCount } = form.formState;
  useEffect(() => {
    if (submitCount === 0) return;
    const errorKeys = Object.keys(form.formState.errors).filter((k) => k !== "root");
    if (errorKeys.length === 0) return;
    setOpenSections(EDIT_SECTION_IDS);
    const timer = setTimeout(() => {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

  // Unified SEO score — SAME scorer + STORED data used by the client SEO page,
  // the clients list, and the console portal. Reads initialData (the stored client
  // row) so the header chip shows the IDENTICAL number every surface shows (single
  // source of truth). The live SEO validation preview lives inside the "SEO
  // Validation" accordion for predictive editing; the header reflects saved state.
  const { score: unifiedSeoScore } = computeClientSeoScore(
    clientToSeoInput(initialData as Record<string, unknown> | undefined),
  );
  const seoTone =
    unifiedSeoScore >= 80
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
      : unifiedSeoScore >= 50
        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
        : "bg-red-500/10 text-red-600 border-red-500/30";

  const seoDoctorNode = clientId ? (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums ${seoTone}`}
      title="جاهزية SEO — نفس الرقم في صفحة العميل والكونسول (من البيانات المحفوظة)"
    >
      <span className="opacity-70">SEO</span>
      {unifiedSeoScore}%
    </span>
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

        {/* Validation summary — slides in at the top so the admin sees exactly
            what's blocking the save, in plain language (no technical jargon). */}
        {invalidFields.length > 0 && (
          <div
            ref={bannerRef}
            role="alert"
            aria-live="assertive"
            className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg border-2 border-red-500/40 border-s-[6px] border-s-red-500 bg-red-500/5 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-red-600">
                  Can&apos;t save yet — {invalidFields.length}{" "}
                  {invalidFields.length === 1 ? "field needs" : "fields need"} fixing
                </p>
                <ul className="mt-2 space-y-1">
                  {invalidFields.map((msg, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setInvalidFields([])}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
                <>
                {/* Media Widget — Logo + Hero. Both feed the SEO score directly:
                    logo → Organization.logo (required for Google rich results),
                    hero → OG/Twitter image + JSON-LD primaryImageOfPage. */}
                {clientId && (
                  <div className="border rounded-lg bg-card p-4 mb-2">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Media</p>
                      <span className="text-[11px] text-muted-foreground">يغذّيان جاهزية SEO مباشرةً</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Logo */}
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                        <button
                          type="button"
                          onClick={() => setLogoModalOpen(true)}
                          className={`relative group w-20 h-20 rounded-lg border-2 ${currentLogoUrl ? "border-emerald-500/40" : "border-dashed border-amber-500/50"} hover:border-primary/60 transition-colors overflow-hidden flex-shrink-0 bg-background`}
                        >
                          {currentLogoUrl ? (
                            <NextImage src={currentLogoUrl} alt="Client logo" fill className="object-contain p-1" sizes="80px" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-8 w-8 text-amber-500/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Pencil className="h-4 w-4 text-white" />
                          </div>
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${currentLogoUrl ? "bg-emerald-500" : "bg-amber-500"}`} />
                            <p className="text-sm font-semibold">الشعار</p>
                          </div>
                          <p className="text-sm">{currentLogoUrl ? "تغيير الشعار" : "إضافة الشعار"}</p>
                          <p className={`text-xs mt-0.5 ${currentLogoUrl ? "text-muted-foreground" : "text-amber-600 font-medium"}`}>
                            {currentLogoUrl ? "500×500px — نسبة 1:1" : "مطلوب لظهور المنظمة في Google"}
                          </p>
                        </div>
                      </div>
                      {/* Hero Image */}
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                        <button
                          type="button"
                          onClick={() => setHeroModalOpen(true)}
                          className={`relative group w-32 h-20 rounded-lg border-2 ${currentHeroUrl ? "border-emerald-500/40" : "border-dashed border-border"} hover:border-primary/60 transition-colors overflow-hidden flex-shrink-0 bg-background`}
                        >
                          {currentHeroUrl ? (
                            <NextImage src={currentHeroUrl} alt="Hero image" fill className="object-cover" sizes="128px" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Pencil className="h-4 w-4 text-white" />
                          </div>
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${currentHeroUrl ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                            <p className="text-sm font-semibold">صورة الغلاف</p>
                          </div>
                          <p className="text-sm">{currentHeroUrl ? "تغيير الغلاف" : "إضافة الغلاف"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {currentHeroUrl ? "2400×400px — نسبة 6:1" : "تُستخدم للمشاركة + داخل البيانات المهيكلة"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="w-full">
                  <AccordionItem value="client-info" className="border rounded-lg bg-card">
                    <AccordionTrigger className="hover:bg-muted/50 data-[state=open]:bg-muted/30 data-[state=open]:hover:bg-muted/60 px-4 py-3">
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
                        <BasicInfoSection form={form} industries={industries} isEditMode clientId={clientId} />
                        <SubscriptionSection form={form} isEditMode tierConfigs={tierConfigs} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="company" className="border rounded-lg bg-card">
                    <AccordionTrigger className="hover:bg-muted/50 data-[state=open]:bg-muted/30 data-[state=open]:hover:bg-muted/60 px-4 py-3">
                      Company Profile
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <BusinessSection form={form} industries={industries} clients={clients} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ymyl" className="border rounded-lg bg-card">
                    <AccordionTrigger className="hover:bg-muted/50 data-[state=open]:bg-muted/30 data-[state=open]:hover:bg-muted/60 px-4 py-3">
                      <div className="flex items-center justify-between w-full pe-2">
                        <span>YMYL Verification</span>
                        {watchedValues.isYmyl && watchedValues.ymylCategory && (
                          <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                            {watchedValues.ymylCategory}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <YmylSection form={form} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="seo" className="border rounded-lg bg-card">
                    <AccordionTrigger className="hover:bg-muted/50 data-[state=open]:bg-muted/30 data-[state=open]:hover:bg-muted/60 px-4 py-3">
                      SEO Details
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <SEOSection form={form} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="seo-validation" className="border rounded-lg bg-card">
                    <AccordionTrigger className="hover:bg-muted/50 data-[state=open]:bg-muted/30 data-[state=open]:hover:bg-muted/60 px-4 py-3">
                      SEO Validation
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <ClientSEOValidationSection
                          formData={watchedValues}
                          clientId={clientId}
                          mode="edit"
                          siteUrl={siteUrl}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="settings" className="border rounded-lg bg-card">
                    <AccordionTrigger className="hover:bg-muted/50 data-[state=open]:bg-muted/30 data-[state=open]:hover:bg-muted/60 px-4 py-3">
                      Settings
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5 pt-3">
                      <div className="space-y-6">
                        <SettingsSection form={form} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {clientId && (
                  <>
                  <ClientLogoModal
                    open={logoModalOpen}
                    onOpenChange={setLogoModalOpen}
                    clientId={clientId}
                    initialLogoUrl={currentLogoUrl}
                    initialLogoMediaId={(initialData?.logoMedia as { id?: string } | null)?.id ?? null}
                  />
                  <ClientHeroModal
                    open={heroModalOpen}
                    onOpenChange={setHeroModalOpen}
                    clientId={clientId}
                    initialHeroUrl={currentHeroUrl}
                    initialHeroMediaId={(initialData?.heroImageMedia as { id?: string } | null)?.id ?? null}
                  />
                  </>
                )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </form>
  );
}
