"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, X, PenLine } from "lucide-react";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { ClientLogoModal } from "./client-logo-modal";
import { ClientHeroModal } from "./client-hero-modal";
import { useClientForm } from "../helpers/hooks/use-client-form";
import { ClientEditWorkspace } from "./edit-workspace/client-edit-workspace";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import type { ClientWithRelations } from "@/lib/types";
import { computeClientSeoScore } from "@modonty/shared/lib/seo/client/seo-score";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { clientToSeoInput } from "@modonty/shared/lib/seo/client/from-client";

interface ClientFormProps {
  initialData?: Partial<ClientWithRelations>;
  industries?: Array<{ id: string; name: string }>;
  editors?: Array<{ id: string; name: string }>;
  clients?: Array<{ id: string; name: string; slug: string }>;
  clientId?: string;
  /** Active countries for the addressCountry picker (admin-owned field). */
  countries?: Array<{ code: string; nameAr: string; nameEn: string }>;
  /** Active CTA buttons from Settings → Dropdown Lists — the picker in the CTA section. */
  ctaPresets?: Array<{ id: string; labelAr: string; mode: "FORM" | "LINK"; defaultUrl: string | null }>;
}

export function ClientForm({
  initialData,
  industries = [],
  editors = [],
  clients = [],
  clientId,
  countries = [],
  ctaPresets = [],
}: ClientFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { collapsed } = useSidebar();
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    mediaSrc(initialData?.logoMedia) ?? null
  );
  const [currentHeroUrl, setCurrentHeroUrl] = useState<string | null>(
    mediaSrc(initialData?.heroImageMedia) ?? null
  );

  useEffect(() => {
    setCurrentLogoUrl(mediaSrc(initialData?.logoMedia) ?? null);
  }, [mediaSrc(initialData?.logoMedia)]);

  useEffect(() => {
    setCurrentHeroUrl(mediaSrc(initialData?.heroImageMedia) ?? null);
  }, [mediaSrc(initialData?.heroImageMedia)]);

  useEffect(() => {
  }, [(initialData as { verificationImageUrl?: string | null })?.verificationImageUrl]);

  const { form, handleSubmit, loading, error, setError, invalidFields, setInvalidFields, isEditMode } = useClientForm({
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
          {/* فرعُ الإنشاء حُذف: `isEditMode = Boolean(clientId)`، و`ClientForm` لا
              يُستدعى إلّا من `[id]/edit/page.tsx` ومعه `clientId` — فالفرع لم يكن
              يُصرَّف أبداً. والإنشاء له شاشتُه: `new/components/create-client-form.tsx`. */}
          {(
            <>
              <ClientEditWorkspace
                form={form}
                initialData={initialData}
                industries={industries}
                clients={clients}
                countries={countries}
                ctaPresets={ctaPresets}
                clientId={clientId}
                seoScore={unifiedSeoScore}
                seoChecks={seoChecks}
                currentLogoUrl={currentLogoUrl}
                currentHeroUrl={currentHeroUrl}
                onOpenLogo={() => setLogoModalOpen(true)}
                onOpenHero={() => setHeroModalOpen(true)}
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
          className="fixed bottom-0 right-0 z-30 border-t bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/85 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.35)] transition-[left] duration-300"
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
              {/* Editor picker — the content writer responsible for this client's articles.
                 Prominent in the always-visible footer (Khalid 2026-07-26): info only,
                 shown in the articles list — never the schema author. */}
              {isEditMode && (
                <div className="flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/[0.05] ps-2.5 pe-1 py-1">
                  <PenLine className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold whitespace-nowrap">الكاتب</span>
                  <Select
                    value={watchedValues.editorId || undefined}
                    onValueChange={(val) =>
                      form.setValue("editorId", val && val !== "none" ? val : null, { shouldDirty: true, shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder="اختر الكاتب…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— بلا كاتب —</SelectItem>
                      {editors.map((ed) => (
                        <SelectItem key={ed.id} value={ed.id}>{ed.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/**
                * **الحبّاتُ الثلاثُ انتقلت إلى قسم «Options»** (خالد ١٩ سبتمبر ٢٠٢٦).
                *
                * كانت هنا منذ ٢٥ يوليو لتوفير مساحة، فصارت تُقرأ زينةً بين السكور وأزرار
                * الحفظ — وهي قراراتٌ تغيّر ما يراه الناس: سلايدرُ المميّزين · شارةُ التوثيق ·
                * تبويبُ المجدول في حساب العميل. وصار لكلٍّ سطرٌ يقول أثرَها.
                */}
              {/**
                * **أبوابُ شاشات العميل الثلاثة** (خالد ١٩ سبتمبر ٢٠٢٦: «وثائق العميل
                * وموقع الـAPI وبيانات الدخول نحطّها في البوتوم تحت»).
                *
                * كانت بطاقةً في الرفّ الأيمن، فأخذت من عمودٍ صار كلُّه لجرد ما أدخله
                * العميل. والشريطُ موضعُها الطبيعيّ: لا تُملأ ولا تُحفظ — تفتح شاشةً
                * أخرى، كـ«افتح كونسول العميل» الذي كان هنا.
                */}
              {isEditMode && clientId && (
                <span className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
                  <FooterLink href={`/clients/${clientId}/documents`} label="الوثائق" />
                  <FooterLink href={`/clients/${clientId}/site`} label="النشر على موقعه" />
                  <FooterLink href={`/clients/${clientId}/welcome`} label="بيانات الدخول" />
                </span>
              )}
              {/* SEO score — the ONE standard chip, clickable → the guide (/technical) */}
              {isEditMode && clientId && (
                <SeoScoreBadge score={unifiedSeoScore} size="md" href={`/clients/${clientId}/technical`} />
              )}
              {/* «Open Client Console» انتقل إلى بطاقة «من الكونسول» في عمود التعديل
                  (خالد ١٩ سبتمبر ٢٠٢٦): بابُ الكونسول مع جردِ ما فيه، لا بين أزرار الحفظ. */}
              {isEditMode && isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => form.reset()}
                  className="h-8"
                >
                  Discard
                </Button>
              )}
              <Button type="submit" size="sm" disabled={loading} className="h-8">
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

/**
 * رابطٌ في الشريط السفليّ — بحجم بقيّة ضوابطه.
 *
 * `Link` لا `Button`: هذه ملاحةٌ لا فعل، فتُفتح بوسط الفأرة وتُنسخ بزرّها الأيمن كأيّ
 * رابط — وزرٌّ يحاكي شكلَها يسلب ذلك.
 *
 * وبلا إطارٍ لكلٍّ (خالد ١٩ سبتمبر ٢٠٢٦: «البوتوم محتاج تحسين UI/UX»): ثلاثةُ إطاراتٍ
 * متجاورةٍ تُقرأ ثلاثةَ أفعالٍ بوزن «Save Changes». والإطارُ للمجموعة وحدها، فتُقرأ
 * مجموعةَ ملاحةٍ واحدة — والفعلُ الوحيدُ في الشريط هو الحفظ.
 */
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-7 items-center rounded-md px-2.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
    >
      {label}
    </Link>
  );
}
