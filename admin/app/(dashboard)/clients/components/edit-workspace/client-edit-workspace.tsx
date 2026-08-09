"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import { Link2, RefreshCw, Pencil, ImageIcon, ChevronDown } from "lucide-react";
import { SubscriptionTier } from "@prisma/client";

import { FormInput, FormField, FormSelect, FormNativeSelect, FormTextarea } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ORGANIZATION_TYPES,
  type OrganizationType,
  LEGAL_FORMS,
  type LegalForm,
} from "@modonty/database/lib/constants/client-classification";

import { SocialProfilesInput } from "../social-profiles-input";
import { SlugChangeDialog } from "../slug-change-dialog";
import { YmylSection } from "../form-sections/ymyl-section";
import { CtaSection } from "../form-sections/cta-section";
import { SubscriptionSection } from "../form-sections/subscription-section";
import { BusinessBriefSection } from "../form-sections/business-brief-section";
import { ClientSiteSection } from "../form-sections/client-site-section";
import { EditLeftPanel } from "./edit-left-panel";

import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import type { SeoCheck } from "@modonty/database/lib/seo/client/types";

interface ClientEditWorkspaceProps {
  form: UseFormReturn<ClientFormSchemaType>;
  initialData?: Partial<ClientWithRelations>;
  industries: Array<{ id: string; name: string }>;
  salesReps?: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string; slug: string }>;
  countries: Array<{ code: string; nameAr: string; nameEn: string }>;
  /** Active CTA buttons from Settings → Dropdown Lists — feeds the picker in CtaSection. */
  ctaPresets: Array<{ id: string; labelAr: string; mode: "FORM" | "LINK"; defaultUrl: string | null }>;
  /** Named subscription tiers — feeds the tier selector (subscription is client-owned). */
  tierConfigs?: Array<{ id: string; tier: SubscriptionTier; name: string; articlesPerMonth: number; price: number; isPopular: boolean; pricing?: unknown }>;
  clientId?: string;
  seoScore: number;
  seoChecks: SeoCheck[];
  currentLogoUrl: string | null;
  currentHeroUrl: string | null;
  currentVerificationUrl: string | null;
  onOpenLogo: () => void;
  onOpenHero: () => void;
  onOpenVerification: () => void;
}

const ZONES = [
  { id: "z-account", label: "Account & Access" },
  { id: "z-financial", label: "القسم المالي" },
  { id: "z-contact", label: "Contact & Classification" },
  { id: "z-media", label: "Verification" },
  { id: "z-seo", label: "SEO" },
  // «Advanced» said nothing about what was inside it, and folding it made the CTA and
  // the newsletter text effectively disappear (Khalid 2026-08-08). Split into three.
  { id: "z-ymyl", label: "YMYL" },
  { id: "z-cta", label: "Primary Button" },
  { id: "z-newsletter", label: "Newsletter" },
  // Its own zone too: this one decides WHERE the client's articles get published and
  // carries the key their website authenticates with.
  { id: "z-client-site", label: "Client Site & API" },
] as const;

/**
 * The zone header doubles as the fold handle (Khalid 2026-08-08: the page got long).
 *
 * Built on native <details>/<summary> rather than component state on purpose: the
 * browser keeps the open/closed state itself, keyboard and screen readers get the
 * right semantics for free, and — the part that matters here — jumping to #z-… from
 * the side nav still works, because a closed <details> containing the target is
 * opened by the browser before it scrolls.
 */
function ZoneHeader({
  index,
  title,
  hint,
  id,
}: {
  index: number;
  title: string;
  hint: string;
  id: string;
}) {
  return (
    <summary
      id={id}
      className="flex cursor-pointer list-none items-center gap-3 mb-4 scroll-mt-4 rounded-lg py-1 hover:bg-muted/40 [&::-webkit-details-marker]:hidden"
    >
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [details:not([open])_&]:-rotate-90" />
      <span className="h-7 w-7 grid place-items-center rounded-lg bg-primary/10 text-primary text-sm font-bold tabular-nums">
        {index}
      </span>
      <h3 className="text-base font-bold">{title}</h3>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </summary>
  );
}

function MediaTile({
  onClick,
  imageUrl,
  label,
  hint,
  ok,
  wide,
}: {
  onClick: () => void;
  imageUrl: string | null;
  label: string;
  hint: string;
  ok: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 text-start hover:border-primary/50 transition-colors w-full"
    >
      <div
        className={`relative group ${wide ? "w-32" : "w-20"} h-20 rounded-lg border-2 ${
          ok ? "border-emerald-500/40" : "border-dashed border-amber-500/50"
        } overflow-hidden shrink-0 bg-background`}
      >
        {imageUrl ? (
          <OptimizedImage media={asMedia(imageUrl, label)} alt={label} fill className="object-contain p-1" sizes={wide ? "128px" : "80px"} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-8 w-8 text-amber-500/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Pencil className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
          <p className="text-sm font-semibold">{label}</p>
        </div>
        <p className={`text-xs mt-0.5 ${ok ? "text-muted-foreground" : "text-amber-600 font-medium"}`}>{hint}</p>
      </div>
    </button>
  );
}

export function ClientEditWorkspace({
  form,
  initialData,
  industries,
  salesReps = [],
  clients,
  countries,
  ctaPresets,
  tierConfigs = [],
  clientId,
  seoScore,
  seoChecks,
  currentLogoUrl,
  currentHeroUrl,
  currentVerificationUrl,
  onOpenLogo,
  onOpenHero,
  onOpenVerification,
}: ClientEditWorkspaceProps) {
  const { watch, setValue, formState: { errors } } = form;
  const [slugDialogOpen, setSlugDialogOpen] = useState(false);

  const name = watch("name");
  const slug = watch("slug");
  const email = watch("email");
  const password = watch("password");
  const phone = watch("phone");
  const contactType = watch("contactType");
  const url = watch("url");
  const industryId = watch("industryId");
  const organizationType = watch("organizationType");
  const addressCountry = watch("addressCountry");
  const legalForm = watch("legalForm");
  const sameAs = watch("sameAs");
  const contentPriorities = watch("contentPriorities");
  const gbpProfileUrl = watch("gbpProfileUrl");
  const priceRange = watch("priceRange");

  const countryName = addressCountry
    ? countries.find((c) => c.code === addressCountry)?.nameAr ?? addressCountry
    : null;
  const subTier = (initialData as { subscriptionTier?: string | null } | undefined)?.subscriptionTier;
  const subscriptionLabel =
    (initialData as { subscriptionTierConfig?: { name?: string } | null } | undefined)?.subscriptionTierConfig?.name ??
    subTier ??
    "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      <EditLeftPanel
        name={name || ""}
        logoUrl={currentLogoUrl}
        heroUrl={currentHeroUrl}
        onOpenLogo={onOpenLogo}
        onOpenHero={onOpenHero}
        industryName={(initialData?.industry as { name?: string } | null | undefined)?.name}
        countryName={countryName}
        isVerified={Boolean(currentVerificationUrl)}
        articleCount={(initialData as { _count?: { articles?: number } } | undefined)?._count?.articles ?? 0}
        subscriptionLabel={subscriptionLabel}
        subscriptionStatus={(initialData as { subscriptionStatus?: string | null } | undefined)?.subscriptionStatus}
        clientId={clientId}
        zones={ZONES.map((z) => ({ id: z.id, label: z.label }))}
      />

      <div className="space-y-8 min-w-0">
        {/* ── ZONE 1 · ACCOUNT & ACCESS ───────────────────────── */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader
            index={1}
            id="z-account"
            title="Account & Access"
            hint="Account identity — logo & cover live on the preview ←"
          />
          <div className="rounded-2xl border bg-card p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="name"
                label="Name"
                value={name || ""}
                onChange={(e) => setValue("name", e.target.value, { shouldValidate: true })}
                error={errors.name?.message}
                required
              />
              <FormField label="Slug" name="slug" error={errors.slug?.message}>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center gap-2">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {slug || "—"}
                  </span>
                  <span className="ml-auto inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[10px] font-semibold">
                    locked
                  </span>
                  {clientId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-7 text-[11px] border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600"
                      onClick={() => setSlugDialogOpen(true)}
                    >
                      <RefreshCw className="h-3 w-3 me-1" /> Change
                    </Button>
                  )}
                </div>
              </FormField>
              <FormInput
                name="email"
                type="email"
                label="Email — Username"
                value={email || ""}
                onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
                error={errors.email?.message}
                required
              />
              <FormInput
                name="password"
                type="text"
                label="Password"
                value={password || ""}
                onChange={(e) => setValue("password", e.target.value, { shouldValidate: true })}
                error={errors.password?.message}
                placeholder="Leave empty to keep current"
              />
            </div>

            {clientId && (
              <SlugChangeDialog
                clientId={clientId}
                currentSlug={slug ?? ""}
                open={slugDialogOpen}
                onOpenChange={setSlugDialogOpen}
                onSuccess={(newName, newSlug) => {
                  setValue("name", newName, { shouldValidate: true });
                  setValue("slug", newSlug, { shouldValidate: true });
                }}
              />
            )}
          </div>
        </details>

        {/* ── ZONE 2 · القسم المالي ────────────────────────────── */}
        {/* Subscription is client-owned (Khalid 2026-07-25: whoever set up the client owns
           the tier, not the invoice flow). Its own zone, mirroring the create form's money
           section — sales rep, tier cards, internal/free card, billing cycle + currency. */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader
            index={2}
            id="z-financial"
            title="القسم المالي"
            hint="الباقة · المندوب · دورة الفوترة والعملة — التواريخ تُضبط عند الفوترة"
          />
          <div className="rounded-2xl border bg-card p-5">
            <SubscriptionSection form={form} isEditMode tierConfigs={tierConfigs} addressCountry={addressCountry} salesReps={salesReps} />
          </div>
        </details>

        {/* ── ZONE 2 · CONTACT & CLASSIFICATION ────────────────── */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader
            index={3}
            id="z-contact"
            title="Contact & Classification"
            hint="Admin-set · some fields shared with the console"
          />
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="url"
                type="url"
                label="Website URL"
                value={url || ""}
                onChange={(e) => setValue("url", e.target.value || null, { shouldValidate: true })}
                error={errors.url?.message}
                placeholder="https://www.example.com"
              />
              <FormInput
                name="phone"
                label="Phone"
                value={phone || ""}
                onChange={(e) => setValue("phone", e.target.value || "", { shouldValidate: true })}
                error={errors.phone?.message}
                placeholder="+966 11 123 4567"
              />
              <FormSelect
                label="Contact Type"
                name="contactType"
                value={contactType || undefined}
                onValueChange={(value) =>
                  setValue("contactType", value ? (value as string) : null, { shouldValidate: true })
                }
                error={errors.contactType?.message}
                placeholder="Select type"
              >
                <SelectItem value="customer service">Customer Service</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="technical support">Technical Support</SelectItem>
                <SelectItem value="billing support">Billing Support</SelectItem>
                <SelectItem value="reservations">Reservations</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </FormSelect>
              <FormSelect
                label="Industry"
                name="industryId"
                value={industryId || undefined}
                onValueChange={(value) => setValue("industryId", value ? value : "", { shouldValidate: true })}
                error={errors.industryId?.message}
                placeholder="Select industry"
              >
                {industries.map((ind) => (
                  <SelectItem key={ind.id} value={ind.id}>
                    {ind.name}
                  </SelectItem>
                ))}
              </FormSelect>
              <FormSelect
                label="Organization Type"
                name="organizationType"
                value={organizationType || undefined}
                onValueChange={(value) =>
                  setValue("organizationType", value ? (value as OrganizationType) : null, { shouldValidate: true })
                }
                error={errors.organizationType?.message}
                placeholder="Select Organization Type"
              >
                {ORGANIZATION_TYPES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.value} — {o.ar}
                  </SelectItem>
                ))}
              </FormSelect>
              <FormSelect
                label="Country"
                name="addressCountry"
                value={addressCountry || undefined}
                onValueChange={(value) => setValue("addressCountry", value || null, { shouldValidate: true })}
                error={errors.addressCountry?.message}
                placeholder="Select country"
              >
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.nameAr} ({c.code})
                  </SelectItem>
                ))}
              </FormSelect>
              <FormSelect
                label="Legal Form"
                name="legalForm"
                value={legalForm || undefined}
                onValueChange={(value) =>
                  setValue("legalForm", value ? (value as LegalForm) : null, { shouldValidate: true })
                }
                error={errors.legalForm?.message}
                placeholder="Select Legal Form"
              >
                {LEGAL_FORMS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.value} — {o.ar}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
            <SocialProfilesInput
              label="Social Profiles"
              value={sameAs || []}
              onChange={(urls) => setValue("sameAs", urls, { shouldValidate: true })}
              error={errors.sameAs?.message}
            />
          </div>
        </details>

        {/* ── ZONE 3 · MEDIA & VERIFICATION ────────────────────── */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader
            index={4}
            id="z-media"
            title="Verification"
            hint="«مودونتي توثّق» — السجل/الترخيص، يظهر في صفحة العميل (الشعار والغلاف على المعاينة ←)"
          />
          <div className="rounded-2xl border bg-card p-5">
            <MediaTile
              onClick={onOpenVerification}
              imageUrl={currentVerificationUrl}
              label="صورة التوثيق"
              hint={currentVerificationUrl ? "تغيير صورة التوثيق" : "ناقصة — السجل/الترخيص، تظهر في صفحة العميل"}
              ok={Boolean(currentVerificationUrl)}
              wide
            />
          </div>
        </details>

        {/* ── ZONE 4 · SEO ─────────────────────────────────────── */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader
            index={5}
            id="z-seo"
            title="SEO"
            hint="Keywords · Google profile · parent org — title & description live in SEO Client"
          />
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <FormNativeSelect
              label="Parent Organization"
              name="parentOrganizationId"
              value={watch("parentOrganizationId") || ""}
              onChange={(e) => setValue("parentOrganizationId", e.target.value || null, { shouldValidate: true })}
              error={errors.parentOrganizationId?.message}
            >
              <option value="">None</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </FormNativeSelect>

            <FormTextarea
              label="Content Priorities (comma-separated) — keywords / knowsAbout"
              name="contentPriorities"
              value={Array.isArray(contentPriorities) ? contentPriorities.join(", ") : ""}
              onChange={(e) => {
                const priorities = e.target.value.split(",").map((p) => p.trim()).filter(Boolean);
                setValue("contentPriorities", priorities, { shouldValidate: true });
              }}
              rows={2}
              error={errors.contentPriorities?.message}
              placeholder="keyword1, keyword2, keyword3"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
              <FormInput
                label="Google Business Profile URL"
                name="gbpProfileUrl"
                value={gbpProfileUrl || ""}
                onChange={(e) => setValue("gbpProfileUrl", e.target.value || null, { shouldValidate: true })}
                error={errors.gbpProfileUrl?.message}
                placeholder="https://maps.google.com/…"
              />
              <FormInput
                label="Price Range"
                name="priceRange"
                value={priceRange || ""}
                onChange={(e) => setValue("priceRange", e.target.value || null, { shouldValidate: true })}
                error={errors.priceRange?.message}
                placeholder="$$  ·  $$$"
                maxLength={20}
              />
            </div>
          </div>
        </details>

        {/* ── ZONE 6 · YMYL ────────────────────────────────────── */}
        {/* Was one «Advanced» zone holding three unrelated things (Khalid 2026-08-08:
            «فين وديت الـ primary button؟ والاشتراك في النشرة؟»). A vague name over a
            fold is a place where settings go missing — so each one is now its own
            named zone with its own line in the side nav. */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader index={6} id="z-ymyl" title="YMYL" hint="التحقّق الطبي/القانوني — يظهر للعملاء الحسّاسين" />
          <div className="rounded-2xl border bg-card p-5">
            <YmylSection form={form} />
          </div>
        </details>

        {/* ── ZONE 7 · PRIMARY BUTTON ──────────────────────────── */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader index={7} id="z-cta" title="Primary Button" hint="زرّ الإجراء على صفحات العميل — نموذج أو رابط" />
          <div className="rounded-2xl border bg-card p-5">
            <CtaSection form={form} ctaPresets={ctaPresets} />
          </div>
        </details>

        {/* ── ZONE 8 · NEWSLETTER ──────────────────────────────── */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader index={8} id="z-newsletter" title="Newsletter" hint="نصّ دعوة الاشتراك في صندوق النشرة" />
          <div className="rounded-2xl border bg-card p-5">
            <BusinessBriefSection form={form} showHeader={false} isEditMode />
          </div>
        </details>

        {/* ── ZONE 6 · CLIENT SITE & API ───────────────────────── */}
        <details open className="group border-b pb-4 last:border-b-0">
          <ZoneHeader
            index={9}
            id="z-client-site"
            title="Client Site & API"
            hint="Publish to their own domain · articles address · pull address"
          />
          <div className="rounded-2xl border bg-card p-5">
            <ClientSiteSection
              form={form}
              clientId={clientId}
              keyInfo={
                initialData ? { apiKeyLastUsedAt: initialData.apiKeyLastUsedAt ?? null } : null
              }
            />
          </div>
        </details>
      </div>
    </div>
  );
}
