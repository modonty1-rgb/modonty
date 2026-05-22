"use client";

import { useState, useTransition, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updateAllSettings, type AllSettings } from "../../actions/settings-actions";
import { Section } from "../../_shared/section";
import { Field } from "../../_shared/field";
import { ImageField } from "../../_shared/image-field";
import { SaveBar } from "../../_shared/save-bar";
import { formatTimeAgo } from "../../_shared/format-time-ago";
import { SEO_HINTS } from "../../_shared/seo-hints";

interface Props {
  initialSettings: AllSettings;
}

// Fields owned by /settings/modonty (homepage scope).
const MODONTY_FIELDS: (keyof AllSettings)[] = [
  "brandDescription", "logoUrl", "ogImageUrl", "altImage",
  "modontySeoTitle", "modontySeoDescription",
  "platformTagline", "platformDescription",
  "orgContactEmail", "orgContactTelephone", "orgContactHoursAvailable",
  "orgStreetAddress", "orgAddressLocality", "orgAddressRegion",
  "orgPostalCode", "orgAddressCountry", "orgGeoLatitude", "orgGeoLongitude",
  "twitterUrl", "linkedInUrl", "facebookUrl", "instagramUrl",
  "youtubeUrl", "tiktokUrl", "pinterestUrl", "snapchatUrl",
  "twitterSite", "twitterCreator",
];

export function ModontyForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isRegenerating, startRegenerating] = useTransition();
  const [isDirty, setIsDirty] = useState(false);

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of MODONTY_FIELDS) {
        (scoped as Record<string, unknown>)[f] = (settings as unknown as Record<string, unknown>)[f];
      }
      const r = await updateAllSettings(scoped);
      if (!r.success) {
        toast({ title: messages.error.update_failed, description: r.error || "فشل حفظ الإعدادات", variant: "destructive" });
        return;
      }
      setSavedAt(new Date());
      setIsDirty(false);
      toast({ title: messages.success.saved, description: "يجري تحديث المحتوى في الخلفية.", variant: "success" });
    });
  }

  function handleRegenerate() {
    startRegenerating(async () => {
      try {
        const gen = await import("@/lib/seo/listing-page-seo-generator");
        await gen.regenerateHomePageCache();
        toast({ title: "تم تحديث الكاش", description: "Homepage SEO cache regenerated.", variant: "success" });
      } catch (e) {
        toast({ title: messages.error.operation_failed, description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      }
    });
  }

  const cacheLabel = formatTimeAgo(settings.jsonLdLastGenerated);

  return (
    <TooltipProvider delayDuration={200}>
      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        savedAt={savedAt}
        onSave={handleSave}
        cacheLabel={cacheLabel}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />

      <div className="space-y-8">
        {/* ─── Site Identity ─── */}
        <Section
          title="Site Identity"
          description="The logo, brand image, and short description shown across modonty.com and in search results."
        >
          <Field label="Brand Description" hint="Short tagline used in JSON-LD Organization schema (max ~160 chars).">
            <Textarea
              value={settings.brandDescription ?? ""}
              onChange={(e) => set("brandDescription", e.target.value)}
              placeholder="منصة المحتوى العربي الرائدة..."
              className="resize-none min-h-[64px]"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageField
              label="Logo"
              value={settings.logoUrl ?? ""}
              onChange={(v) => set("logoUrl", v)}
              hint="Square, min 112×112 px"
              aspect="square"
            />
            <ImageField
              label="Main Image (Open Graph)"
              value={settings.ogImageUrl ?? ""}
              onChange={(v) => set("ogImageUrl", v)}
              hint="1200×630 px — used when sharing on Twitter, Facebook, LinkedIn"
              aspect="og"
            />
          </div>
          <Field label="Alt Text" hint="Accessibility text for logo and OG image.">
            <Input
              value={settings.altImage ?? ""}
              onChange={(e) => set("altImage", e.target.value)}
              placeholder="مدونتي — منصة المحتوى العربي"
            />
          </Field>
        </Section>

        {/* ─── Homepage SEO ─── */}
        <Section
          title="Homepage SEO"
          description="Title and description shown in Google, Bing, and Yahoo search results for modonty.com homepage."
        >
          <Field
            label="SEO Title"
            hint={SEO_HINTS.title}
            counter={settings.modontySeoTitle?.length ?? 0}
            counterMax={60}
          >
            <Input
              value={settings.modontySeoTitle ?? ""}
              onChange={(e) => set("modontySeoTitle", e.target.value)}
              placeholder="مدونتي | منصة المحتوى العربي"
            />
          </Field>
          <Field
            label="SEO Description"
            hint={SEO_HINTS.description}
            counter={settings.modontySeoDescription?.length ?? 0}
            counterMax={160}
          >
            <Textarea
              value={settings.modontySeoDescription ?? ""}
              onChange={(e) => set("modontySeoDescription", e.target.value)}
              placeholder="تصفح آلاف المقالات من أفضل الكتّاب..."
              className="resize-none min-h-[72px]"
            />
          </Field>
        </Section>

        {/* ─── Feed Banner ─── */}
        <Section
          title="Feed Banner"
          description="The welcome banner shown at the top of the homepage feed on modonty.com."
        >
          <Field label="Tagline">
            <Input
              value={settings.platformTagline ?? ""}
              onChange={(e) => set("platformTagline", e.target.value)}
              placeholder="مرحباً بك في مودونتي"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={settings.platformDescription ?? ""}
              onChange={(e) => set("platformDescription", e.target.value)}
              placeholder="منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين..."
              className="resize-none min-h-[72px]"
            />
          </Field>
        </Section>

        {/* ─── Contact ─── */}
        <Section
          title="Contact"
          description="Used in the site footer and in Organization structured data (JSON-LD)."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Email">
              <Input type="email" value={settings.orgContactEmail ?? ""} onChange={(e) => set("orgContactEmail", e.target.value)} placeholder="info@modonty.com" />
            </Field>
            <Field label="Phone">
              <Input value={settings.orgContactTelephone ?? ""} onChange={(e) => set("orgContactTelephone", e.target.value)} placeholder="+966500000000" />
            </Field>
            <Field label="Hours">
              <Input value={settings.orgContactHoursAvailable ?? ""} onChange={(e) => set("orgContactHoursAvailable", e.target.value)} placeholder="Su-Th 09:00-18:00" />
            </Field>
          </div>
        </Section>

        {/* ─── Address ─── */}
        <Section
          title="Address"
          description="Physical address and GEO coordinates used in Organization JSON-LD."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Street">
              <Input value={settings.orgStreetAddress ?? ""} onChange={(e) => set("orgStreetAddress", e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={settings.orgAddressLocality ?? ""} onChange={(e) => set("orgAddressLocality", e.target.value)} />
            </Field>
            <Field label="Region">
              <Input value={settings.orgAddressRegion ?? ""} onChange={(e) => set("orgAddressRegion", e.target.value)} />
            </Field>
            <Field label="Postal Code">
              <Input value={settings.orgPostalCode ?? ""} onChange={(e) => set("orgPostalCode", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Country" hint="Two-letter code (e.g. SA, EG)">
              <Input value={settings.orgAddressCountry ?? ""} onChange={(e) => set("orgAddressCountry", e.target.value)} placeholder="SA" />
            </Field>
            <Field label="Latitude">
              <Input
                type="number"
                step="any"
                value={settings.orgGeoLatitude ?? ""}
                onChange={(e) => set("orgGeoLatitude", e.target.value ? parseFloat(e.target.value) : null)}
              />
            </Field>
            <Field label="Longitude">
              <Input
                type="number"
                step="any"
                value={settings.orgGeoLongitude ?? ""}
                onChange={(e) => set("orgGeoLongitude", e.target.value ? parseFloat(e.target.value) : null)}
              />
            </Field>
          </div>
        </Section>

        {/* ─── Social Profiles ─── */}
        <Section
          title="Social Profiles"
          description="URLs to your accounts on each network. Used in footer + Organization sameAs JSON-LD."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Twitter / X">
              <Input value={settings.twitterUrl ?? ""} onChange={(e) => set("twitterUrl", e.target.value)} placeholder="https://x.com/modonty" />
            </Field>
            <Field label="LinkedIn">
              <Input value={settings.linkedInUrl ?? ""} onChange={(e) => set("linkedInUrl", e.target.value)} placeholder="https://linkedin.com/company/modonty" />
            </Field>
            <Field label="Facebook">
              <Input value={settings.facebookUrl ?? ""} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/modonty" />
            </Field>
            <Field label="Instagram">
              <Input value={settings.instagramUrl ?? ""} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/modonty" />
            </Field>
            <Field label="YouTube">
              <Input value={settings.youtubeUrl ?? ""} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/@modonty" />
            </Field>
            <Field label="TikTok">
              <Input value={settings.tiktokUrl ?? ""} onChange={(e) => set("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@modonty" />
            </Field>
            <Field label="Pinterest">
              <Input value={settings.pinterestUrl ?? ""} onChange={(e) => set("pinterestUrl", e.target.value)} placeholder="https://pinterest.com/modonty" />
            </Field>
            <Field label="Snapchat">
              <Input value={settings.snapchatUrl ?? ""} onChange={(e) => set("snapchatUrl", e.target.value)} placeholder="https://snapchat.com/add/modonty" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <Field label="X Site Handle" hint="Used in Twitter Card meta tag.">
              <Input value={settings.twitterSite ?? ""} onChange={(e) => set("twitterSite", e.target.value)} placeholder="@modonty" />
            </Field>
            <Field label="X Creator Handle" hint="Author/creator handle for Twitter Cards.">
              <Input value={settings.twitterCreator ?? ""} onChange={(e) => set("twitterCreator", e.target.value)} placeholder="@modonty" />
            </Field>
          </div>
        </Section>
      </div>
    </TooltipProvider>
  );
}
