"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { ClientLogoModal } from "./client-logo-modal";
import { ClientHeroModal } from "./client-hero-modal";
import { ClientVerificationModal } from "./client-verification-modal";
import { useClientForm } from "../helpers/hooks/use-client-form";
import { BasicInfoSection } from "./form-sections/basic-info-section";
import { SubscriptionSection } from "./form-sections/subscription-section";
import { ClientEditWorkspace } from "./edit-workspace/client-edit-workspace";
import { OpenClientConsoleButton } from "./edit-workspace/open-client-console-button";
import type { ClientWithRelations } from "@/lib/types";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";

interface ClientFormProps {
  initialData?: Partial<ClientWithRelations>;
  industries?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string; slug: string }>;
  clientId?: string;
  /** Active countries for the addressCountry picker (admin-owned field). */
  countries?: Array<{ code: string; nameAr: string; nameEn: string }>;
}

export function ClientForm({ initialData, industries = [], clients = [], clientId, countries = [] }: ClientFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { collapsed } = useSidebar();
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    (initialData?.logoMedia as { url?: string } | null)?.url ?? null
  );
  const [currentHeroUrl, setCurrentHeroUrl] = useState<string | null>(
    (initialData?.heroImageMedia as { url?: string } | null)?.url ?? null
  );
  const [currentVerificationUrl, setCurrentVerificationUrl] = useState<string | null>(
    (initialData as { verificationImageUrl?: string | null })?.verificationImageUrl ?? null
  );

  useEffect(() => {
    setCurrentLogoUrl((initialData?.logoMedia as { url?: string } | null)?.url ?? null);
  }, [(initialData?.logoMedia as { url?: string } | null)?.url]);

  useEffect(() => {
    setCurrentHeroUrl((initialData?.heroImageMedia as { url?: string } | null)?.url ?? null);
  }, [(initialData?.heroImageMedia as { url?: string } | null)?.url]);

  useEffect(() => {
    setCurrentVerificationUrl((initialData as { verificationImageUrl?: string | null })?.verificationImageUrl ?? null);
  }, [(initialData as { verificationImageUrl?: string | null })?.verificationImageUrl]);

  const { form, handleSubmit, loading, error, setError, invalidFields, setInvalidFields, tierConfigs, isEditMode } = useClientForm({
    initialData,
    clientId,
  });
  const bannerRef = useRef<HTMLDivElement>(null);

  const watchedValues = form.watch();

  // On a FAILED submit, scroll the user up to the prominent error banner. With the
  // flat zone layout (no accordion) every field is always mounted, so there's
  // nothing to expand — we just bring the banner into view.
  const { submitCount } = form.formState;
  useEffect(() => {
    if (submitCount === 0) return;
    const errorKeys = Object.keys(form.formState.errors).filter((k) => k !== "root");
    if (errorKeys.length === 0) return;
    const timer = setTimeout(() => {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

  // Unified SEO score — SAME scorer + STORED data used by the client SEO page,
  // the clients list, and the console portal. Reads initialData (the stored client
  // row) so the header chip + left-panel ring show the IDENTICAL number every
  // surface shows (single source of truth).
  const { score: unifiedSeoScore, checks: seoChecks } = computeClientSeoScore(
    clientToSeoInput(initialData as Record<string, unknown> | undefined),
  );
  // Track unsaved changes (edit mode) so the bottom save bar appears ONLY when
  // the live form differs from what's stored. Field onChanges don't all pass
  // shouldDirty, so RHF's isDirty is unreliable here — snapshot the baseline at
  // mount and compare live values instead.
  const baselineRef = useRef<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    if (!isEditMode) return;
    if (baselineRef.current === null) {
      baselineRef.current = JSON.stringify(form.getValues());
    }
    const sub = form.watch((values) => {
      setIsDirty(JSON.stringify(values) !== baselineRef.current);
    });
    return () => sub.unsubscribe();
  }, [form, isEditMode]);


  return (
    <form ref={formRef} id="client-form" onSubmit={handleSubmit}>
      {/* pb clears the fixed bottom footer so the last fields aren't hidden. */}
      <div className="space-y-6 pb-24">
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

        <div suppressHydrationWarning>
          {!isEditMode ? (
            /* CREATE MODE — flat, essentials only (unchanged) */
            <div className="space-y-6">
              {watchedValues.slug && (
                <div className="flex justify-end">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    https://modonty.com/clients/{watchedValues.slug}
                  </span>
                </div>
              )}
              <BasicInfoSection form={form} industries={industries} countries={countries} />
              <SubscriptionSection form={form} isEditMode={false} tierConfigs={tierConfigs} />
            </div>
          ) : (
            /* EDIT MODE — logical-zone workspace (left live panel + 5 zones) */
            <>
              <ClientEditWorkspace
                form={form}
                initialData={initialData}
                industries={industries}
                clients={clients}
                countries={countries}
                clientId={clientId}
                seoScore={unifiedSeoScore}
                seoChecks={seoChecks}
                currentLogoUrl={currentLogoUrl}
                currentHeroUrl={currentHeroUrl}
                currentVerificationUrl={currentVerificationUrl}
                onOpenLogo={() => setLogoModalOpen(true)}
                onOpenHero={() => setHeroModalOpen(true)}
                onOpenVerification={() => setVerificationModalOpen(true)}
              />
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
                  <ClientVerificationModal
                    open={verificationModalOpen}
                    onOpenChange={setVerificationModalOpen}
                    clientId={clientId}
                    initialVerificationUrl={currentVerificationUrl}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* Persistent footer toolbar — FIXED flush to the viewport bottom,
            offset by the sidebar width so it spans the content area and the form
            scrolls cleanly under it. Save is always shown; the unsaved-changes
            hint + Discard appear only when the form differs from what's stored. */}
        <div
          className="fixed bottom-0 right-0 z-30 border-t bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.35)] transition-[left] duration-300"
          style={{ left: collapsed ? "4rem" : "15rem" }}
        >
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm">
              {isEditMode ? (
                isDirty ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-medium">Unsaved changes</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">All changes saved</span>
                )
              ) : (
                <span className="text-muted-foreground">Fill the required fields, then create</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {isEditMode && clientId && <OpenClientConsoleButton clientId={clientId} />}
              {isEditMode && isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => form.reset()}
                >
                  Discard
                </Button>
              )}
              <Button type="submit" size="sm" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? "Saving…" : isEditMode ? "Save Changes" : "Create Client"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
