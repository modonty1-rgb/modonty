"use client";

import { useState, useTransition } from "react";
import NextImage from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updateAllSettings, type AllSettings } from "../actions/settings-actions";
import { Field } from "./field";
import { Section } from "./section";
import { SaveBar } from "./save-bar";
import { ImageField } from "./image-field";
import { formatTimeAgo } from "./format-time-ago";
import { SEO_HINTS } from "./seo-hints";

type ListingKey = "categories" | "tags" | "industries" | "articles" | "trending" | "clients";

interface Props {
  pageKey: ListingKey;
  pageName: string;
  initialSettings: AllSettings;
  /** Optional sections rendered above the SEO section (e.g. Hero B2B for clients). */
  beforeSeo?: React.ReactNode;
  /** Optional setter exposed to beforeSeo via render-prop pattern. */
  renderBeforeSeo?: (helpers: {
    settings: AllSettings;
    set: <K extends keyof AllSettings>(key: K, value: AllSettings[K]) => void;
  }) => React.ReactNode;
}

const KEY_MAP: Record<ListingKey, {
  titleKey: keyof AllSettings;
  descKey: keyof AllSettings;
  cacheDateKey: keyof AllSettings;
  regenerator: keyof typeof import("@/lib/seo/listing-page-seo-generator");
  fieldList: (keyof AllSettings)[];
  /** Per-page hero image (Cloudinary URL) — only pages that support it. */
  imageKey?: keyof AllSettings;
  imageAltKey?: keyof AllSettings;
}> = {
  clients: {
    titleKey: "clientsSeoTitle",
    descKey: "clientsSeoDescription",
    cacheDateKey: "clientsPageJsonLdLastGenerated",
    regenerator: "regenerateClientsListingCache",
    fieldList: [
      "clientsSeoTitle",
      "clientsSeoDescription",
      "b2bLabel",
      "b2bHeadline",
      "b2bBullet1",
      "b2bBullet2",
      "b2bBullet3",
      "b2bCtaText",
      "b2bCtaUrl",
    ],
  },
  categories: {
    titleKey: "categoriesSeoTitle",
    descKey: "categoriesSeoDescription",
    cacheDateKey: "categoriesPageJsonLdLastGenerated",
    regenerator: "regenerateCategoriesListingCache",
    fieldList: ["categoriesSeoTitle", "categoriesSeoDescription", "categoriesPageImage", "categoriesPageImageAlt"],
    imageKey: "categoriesPageImage",
    imageAltKey: "categoriesPageImageAlt",
  },
  tags: {
    titleKey: "tagsSeoTitle",
    descKey: "tagsSeoDescription",
    cacheDateKey: "tagsPageJsonLdLastGenerated",
    regenerator: "regenerateTagsListingCache",
    fieldList: ["tagsSeoTitle", "tagsSeoDescription", "tagsPageImage", "tagsPageImageAlt"],
    imageKey: "tagsPageImage",
    imageAltKey: "tagsPageImageAlt",
  },
  industries: {
    titleKey: "industriesSeoTitle",
    descKey: "industriesSeoDescription",
    cacheDateKey: "industriesPageJsonLdLastGenerated",
    regenerator: "regenerateIndustriesListingCache",
    fieldList: ["industriesSeoTitle", "industriesSeoDescription", "industriesPageImage", "industriesPageImageAlt"],
    imageKey: "industriesPageImage",
    imageAltKey: "industriesPageImageAlt",
  },
  articles: {
    titleKey: "articlesSeoTitle",
    descKey: "articlesSeoDescription",
    cacheDateKey: "articlesPageJsonLdLastGenerated",
    regenerator: "regenerateArticlesListingCache",
    fieldList: ["articlesSeoTitle", "articlesSeoDescription"],
  },
  trending: {
    titleKey: "trendingSeoTitle",
    descKey: "trendingSeoDescription",
    cacheDateKey: "trendingPageJsonLdLastGenerated",
    regenerator: "regenerateTrendingPageCache",
    fieldList: ["trendingSeoTitle", "trendingSeoDescription"],
  },
};

export function ListingPageForm({ pageKey, pageName, initialSettings, renderBeforeSeo }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isRegenerating, startRegenerating] = useTransition();
  const [isDirty, setIsDirty] = useState(false);

  const config = KEY_MAP[pageKey];
  const imageKey = config.imageKey;
  const imageAltKey = config.imageAltKey;

  function set<K extends keyof AllSettings>(key: K, value: AllSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of config.fieldList) {
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
        const fn = gen[config.regenerator] as (() => Promise<{ success: boolean }>) | undefined;
        if (!fn) throw new Error(`Regenerator ${config.regenerator} not found`);
        await fn();
        toast({ title: "تم تحديث الكاش", description: `${pageName} cache regenerated.`, variant: "success" });
      } catch (e) {
        toast({ title: messages.error.operation_failed, description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      }
    });
  }

  const cacheTime = formatTimeAgo(settings[config.cacheDateKey] as Date | string | null);
  const title = (settings[config.titleKey] as string | null) ?? "";
  const description = (settings[config.descKey] as string | null) ?? "";

  return (
    <TooltipProvider delayDuration={200}>
      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        savedAt={savedAt}
        onSave={handleSave}
        cacheLabel={cacheTime}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />

      <div className="space-y-8">
        {renderBeforeSeo && renderBeforeSeo({ settings, set })}

        <Section
          title="Page SEO"
          description={`Title and description shown in Google, Bing, and Yahoo search results for the ${pageName} page.`}
        >
          <Field
            label="SEO Title"
            hint={SEO_HINTS.title}
            counter={title.length}
            counterMax={60}
          >
            <Input
              value={title}
              onChange={(e) => set(config.titleKey, e.target.value as AllSettings[typeof config.titleKey])}
              placeholder={`${pageName} | Modonty`}
            />
          </Field>
          <Field
            label="SEO Description"
            hint={SEO_HINTS.description}
            counter={description.length}
            counterMax={160}
          >
            <Textarea
              value={description}
              onChange={(e) => set(config.descKey, e.target.value as AllSettings[typeof config.descKey])}
              placeholder={`Browse all ${pageName.toLowerCase()} on Modonty...`}
              className="resize-none min-h-[72px]"
            />
          </Field>
        </Section>

        {imageKey ? (
          <Section
            title="Hero Image"
            description="Shown as this page's full-bleed hero background on modonty.com (and as its social-share image). Leave empty to fall back to the site's default OG image."
          >
            <ImageField
              label="Hero / Share Image"
              value={(settings[imageKey] as string | null) ?? ""}
              onChange={(v) => set(imageKey, v as AllSettings[typeof imageKey])}
              hint="1200×630 px — paste a Cloudinary URL. Used as the full-bleed hero background and og:image."
              aspect="og"
            />
            {imageAltKey && (
              <Field label="Image Alt Text" hint="Describe the image for accessibility & SEO.">
                <Input
                  value={(settings[imageAltKey] as string | null) ?? ""}
                  onChange={(e) => set(imageAltKey, e.target.value as AllSettings[typeof imageAltKey])}
                  placeholder="القطاعات التي يخدمها فريق مدونتي"
                />
              </Field>
            )}
          </Section>
        ) : (
          <Section
            title="Social Sharing Image"
            description="The image shown when this page is shared on social media. Managed in Modonty homepage settings."
          >
            {settings.ogImageUrl ? (
              <div className="flex items-center gap-4">
                <div className="aspect-[1200/630] w-32 shrink-0 rounded-md border bg-muted/30 overflow-hidden">
                  <NextImage
                    src={settings.ogImageUrl}
                    alt={settings.altImage ?? ""}
                    width={128}
                    height={67}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{settings.altImage || "No alt text set"}</p>
                  <p className="text-xs text-muted-foreground">
                    Managed in <a href="/settings/modonty" className="text-primary hover:underline">Modonty Homepage → Site Identity</a>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No image set. Add one in <a href="/settings/modonty" className="text-primary hover:underline">Modonty Homepage → Site Identity</a>.
              </p>
            )}
          </Section>
        )}
      </div>
    </TooltipProvider>
  );
}
