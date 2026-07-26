"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Building2, Globe2, BadgeCheck, Search, Briefcase, Save, Zap, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { SEODoctor } from "@/components/shared/seo-doctor";
import { CharacterCounter } from "@/components/shared/character-counter";
import { DeferredImageUpload } from "@/components/shared/deferred-image-upload";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { createAuthorSEOConfig } from "../helpers/author-seo-config";
import { useAuthorForm } from "../helpers/hooks/use-author-form";
import type { AuthorWithRelations } from "@/lib/types";
import type { AllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

interface AuthorFormProps {
  initialData?: Partial<AuthorWithRelations>;
  authorId?: string;
  onSuccess?: () => void;
  header?: React.ReactNode;
  /** Full settings — drives the SEO doctor AND the read-only Business Data panel. */
  settings?: AllSettings;
  /** Site base URL from Settings.siteUrl (passed by server parent). */
  siteUrl: string;
}

// The 11 official channels (label + Settings field) — shown as present/absent chips.
const CHANNELS: { label: string; field: keyof AllSettings }[] = [
  { label: "Facebook", field: "facebookUrl" },
  { label: "X", field: "twitterUrl" },
  { label: "LinkedIn", field: "linkedInUrl" },
  { label: "Instagram", field: "instagramUrl" },
  { label: "YouTube", field: "youtubeUrl" },
  { label: "TikTok", field: "tiktokUrl" },
  { label: "Snapchat", field: "snapchatUrl" },
  { label: "Pinterest", field: "pinterestUrl" },
  { label: "WhatsApp", field: "whatsappChannelUrl" },
  { label: "Telegram", field: "telegramChannelUrl" },
  { label: "Google Business", field: "googleBusinessProfileUrl" },
];

function DataRow({ label, value }: { label: string; value?: string | null }) {
  const has = typeof value === "string" && value.trim().length > 0;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 py-2 last:border-0">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <span className={cn("text-end text-sm", has ? "text-foreground" : "italic text-muted-foreground/50")}>
        {has ? value : "not set"}
      </span>
    </div>
  );
}

// Modonty is the platform-brand Organization author, so this editor is a *publisher* editor:
// identity + presence + trust + search. Person-only fields (job title, expertise, credentials)
// were dropped — the Organization JSON-LD ignores them. Official channels live in Settings
// (one source powering the whole platform's sameAs), so they are not re-entered here.
const TONES = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
} as const;

function Section({
  icon: Icon,
  title,
  description,
  tone,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  tone: keyof typeof TONES;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-5 pt-5">
        <div className="flex items-start gap-3">
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONES[tone])}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

export function AuthorForm({ initialData, authorId, onSuccess, header, settings, siteUrl }: AuthorFormProps) {
  const seoConfig = createAuthorSEOConfig(settings);
  const addressLine = settings
    ? [settings.orgStreetAddress, settings.orgAddressLocality, settings.orgAddressRegion, settings.orgPostalCode, settings.orgAddressCountry]
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .join("، ")
    : "";
  const router = useRouter();
  const {
    formData,
    loading,
    error,
    setImageUploadData,
    setImageRemoved,
    updateField,
    updateSEOField,
    handleSubmit,
  } = useAuthorForm({ initialData, authorId, onSuccess, siteUrl });

  return (
    <div className="space-y-4">
      {/* Header + SEO Doctor */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="shrink-0">{header}</div>
        <div className="min-w-0 flex-1">
          <SEODoctor data={{ ...formData }} config={seoConfig} />
        </div>
      </div>

      {/* Auto-generated notice */}
      <div className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/40 px-3 py-2">
        <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium">Auto on save:</span> Canonical URL · JSON-LD · Open Graph · Twitter Card · Articles updated
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* 1 — Identity */}
          <Section
            icon={Building2}
            tone="primary"
            title="Identity"
            description="Who the publisher is — the name, logo, and description Google shows for the brand."
          >
            <FormInput
              label="Publisher Name"
              name="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />

            <input type="hidden" name="slug" value={formData.slug} />
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
              <span className="text-xs text-muted-foreground">Slug:</span>
              <code className="font-mono text-xs text-foreground">{formData.slug || "—"}</code>
              {authorId && (
                <span className="ms-auto text-xs text-yellow-600">⚠️ Won&apos;t change after publish</span>
              )}
            </div>

            <DeferredImageUpload
              categorySlug={formData.slug}
              onImageSelected={setImageUploadData}
              onImageRemoved={() => setImageRemoved(true)}
              initialImageUrl={initialData?.image || undefined}
              initialAltText={initialData?.imageAlt || undefined}
            />

            <div>
              <FormTextarea
                label="Description"
                name="bio"
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={3}
                hint={messages.hints.author.bio}
              />
              <CharacterCounter current={formData.bio.length} min={100} className="ms-1 mt-1" />
            </div>
          </Section>

          {/* 2 — Presence & Contact */}
          <Section
            icon={Globe2}
            tone="blue"
            title="Presence & Contact"
            description="The publisher's home on the web and how people reach it."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                label="Website"
                name="url"
                type="url"
                value={formData.url}
                onChange={(e) => updateField("url", e.target.value)}
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

          </Section>

          {/* 3 — Business Data (read-only, from Settings) */}
          <Section
            icon={Briefcase}
            tone="blue"
            title="Business Data"
            description="The organization's real-world data that enriches the publisher entity — the source of its address, contact, and channels. Managed in Settings."
          >
            {settings ? (
              <>
                <div className="rounded-lg border bg-muted/20 px-4">
                  <DataRow label="Brand description" value={settings.brandDescription} />
                  <DataRow label="Contact email" value={settings.orgContactEmail} />
                  <DataRow label="Phone" value={settings.orgContactTelephone} />
                  <DataRow label="Contact type" value={settings.orgContactType} />
                  <DataRow label="Hours" value={settings.orgContactHoursAvailable} />
                  <DataRow label="Address" value={addressLine} />
                  <DataRow label="Area served" value={settings.orgAreaServed} />
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Official channels ({CHANNELS.filter((c) => {
                      const v = settings[c.field];
                      return typeof v === "string" && v.trim().length > 0;
                    }).length}
                    /{CHANNELS.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CHANNELS.map((c) => {
                      const v = settings[c.field];
                      const on = typeof v === "string" && v.trim().length > 0;
                      return (
                        <span
                          key={c.label}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs",
                            on
                              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-border bg-muted/30 text-muted-foreground/60",
                          )}
                        >
                          {on && <Check className="h-3 w-3" />}
                          {c.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <Link href="/settings" className="inline-flex text-xs font-medium text-primary hover:underline">
                  Edit in Settings →
                </Link>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Settings unavailable.</p>
            )}
          </Section>

          {/* 3 — Trust */}
          <Section
            icon={BadgeCheck}
            tone="emerald"
            title="Trust & Verification"
            description="Marks the brand as a verified publisher across the site."
          >
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
              <div className="min-w-0">
                <Label htmlFor="verificationStatus" className="cursor-pointer text-sm font-medium">
                  Verified Publisher
                </Label>
                <p className="text-xs text-muted-foreground">Shows the verified badge on the public author page.</p>
              </div>
              <Checkbox
                id="verificationStatus"
                checked={formData.verificationStatus}
                onCheckedChange={(checked) => updateField("verificationStatus", checked === true)}
                className="h-5 w-5"
              />
            </div>
          </Section>

          {/* 4 — Search (SEO) */}
          <Section
            icon={Search}
            tone="violet"
            title="Search (SEO)"
            description="The title and description that appear as the search snippet for this page."
          >
            <div>
              <FormInput
                label="SEO Title"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => updateSEOField("seoTitle", e.target.value)}
                hint={messages.hints.author.metaTitle}
                maxLength={60}
              />
              <CharacterCounter current={formData.seoTitle.length} min={50} max={60} className="ms-1 mt-1" />
            </div>
            <div>
              <FormTextarea
                label="SEO Description"
                name="seoDescription"
                value={formData.seoDescription}
                onChange={(e) => updateSEOField("seoDescription", e.target.value)}
                hint={messages.hints.author.metaDescription}
                rows={3}
              />
              <CharacterCounter current={formData.seoDescription.length} min={120} max={160} className="ms-1 mt-1" />
            </div>
          </Section>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
