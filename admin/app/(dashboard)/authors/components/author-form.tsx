"use client";

import { useRouter } from "next/navigation";

import { Save, Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { CharacterCounter } from "@/components/shared/character-counter";
import { cn } from "@/lib/utils";
import { useAuthorForm } from "../helpers/hooks/use-author-form";
import type { AuthorWithRelations } from "@/lib/types";
import type { AllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

interface AuthorFormProps {
  initialData?: Partial<AuthorWithRelations>;
  authorId?: string;
  onSuccess?: () => void;
  /** Full settings — the single source for every read-only field on this page. */
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

function Row({ label, value }: { label: string; value?: string | null }) {
  const has = typeof value === "string" && value.trim().length > 0;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 py-1.5 last:border-0">
      <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className={cn("truncate text-end text-xs", has ? "text-foreground" : "italic text-muted-foreground/50")}>
        {has ? value : "—"}
      </span>
    </div>
  );
}

// Modonty is the platform-brand Organization author. Everything that identifies the brand
// (name, description, visuals, contact, channels) has ONE source — Settings — and is shown
// read-only here. The only page-owned fields are the search snippet (SEO title + description).
export function AuthorForm({ initialData, authorId, onSuccess, settings, siteUrl }: AuthorFormProps) {
  const router = useRouter();
  const { formData, loading, error, updateSEOField, handleSubmit } = useAuthorForm({
    initialData,
    authorId,
    onSuccess,
    siteUrl,
  });

  const logoUrl = settings?.logoUrl || undefined;
  const ogImageUrl = settings?.ogImageUrl || logoUrl || undefined;
  const addressLine = settings
    ? [settings.orgStreetAddress, settings.orgAddressLocality, settings.orgAddressRegion, settings.orgPostalCode, settings.orgAddressCountry]
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .join("، ")
    : "";
  const activeChannels = CHANNELS.filter((c) => {
    const v = settings?.[c.field];
    return typeof v === "string" && v.trim().length > 0;
  });

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT — editable: search snippet only */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              Only the search snippet is editable here — name, description, visuals and contact all come from{" "}
              <span className="font-medium text-foreground">Settings</span>.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border bg-card p-4">
            <div>
              <FormInput
                label="SEO Title"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => updateSEOField("seoTitle", e.target.value)}
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
                rows={3}
              />
              <CharacterCounter current={formData.seoDescription.length} min={120} max={160} className="ms-1 mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        {/* RIGHT — reference, read-only, one source: Settings */}
        <aside className="space-y-3 rounded-lg border bg-muted/20 p-3 lg:sticky lg:top-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Lock className="h-3 w-3" /> From Settings · read-only
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border bg-background p-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[10px] italic text-muted-foreground/50">no logo</span>
              )}
            </div>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border bg-background">
              {ogImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ogImageUrl} alt="OG image" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] italic text-muted-foreground/50">no OG image</span>
              )}
            </div>
          </div>

          <div className="rounded-md border bg-background px-3">
            <Row label="Name" value={settings?.siteName} />
            <Row label="Slug" value={formData.slug} />
            <Row label="Description" value={settings?.brandDescription} />
            <Row label="Website" value={settings?.siteUrl} />
            <Row label="Email" value={settings?.orgContactEmail} />
            <Row label="Phone" value={settings?.orgContactTelephone} />
            <Row label="Address" value={addressLine} />
            <Row label="Area served" value={settings?.orgAreaServed} />
            <Row label="Channels" value={`${activeChannels.length}/${CHANNELS.length}`} />
          </div>

          <div className="flex flex-wrap gap-1">
            {activeChannels.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400"
              >
                <Check className="h-2.5 w-2.5" />
                {c.label}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
