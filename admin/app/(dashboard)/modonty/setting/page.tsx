import { Suspense } from "react";
import { PageSelector } from "./components/page-selector";
import { ModontySettingHeader } from "./components/modonty-setting-header";
import { Loader2 } from "lucide-react";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

function PageSelectorFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function ModontySettingsPage() {
  const settings = await getAllSettings();
  const settingsDefaults = {
    siteUrl: settings.siteUrl ?? "https://modonty.com",
    twitterSite: settings.twitterSite ?? "",
    twitterCreator: settings.twitterCreator ?? "",
    orgLogoUrl: settings.orgLogoUrl ?? settings.logoUrl ?? "",
    themeColor: settings.themeColor ?? "#3030FF",
    defaultMetaRobots: settings.defaultMetaRobots ?? "index, follow",
    defaultGooglebot: settings.defaultGooglebot ?? "index, follow",
    defaultOgType: settings.defaultOgType ?? "website",
    defaultOgLocale: settings.defaultOgLocale ?? "ar_SA",
    defaultOgDeterminer: settings.defaultOgDeterminer ?? "auto",
    defaultTwitterCard: settings.defaultTwitterCard ?? "summary_large_image",
    defaultSitemapPriority: settings.defaultSitemapPriority ?? 0.5,
    defaultSitemapChangeFreq: settings.defaultSitemapChangeFreq ?? "monthly",
  };
  const s = settings as unknown as Record<string, unknown>;
  const generatedSeo = {
    homeMetaTags: s.homeMetaTags,
    jsonLdStructuredData: (s.jsonLdStructuredData as string | null) ?? null,
    jsonLdLastGenerated: (s.jsonLdLastGenerated as Date | string | null) ?? null,
    jsonLdValidationReport: s.jsonLdValidationReport,
    clientsPageMetaTags: s.clientsPageMetaTags,
    clientsPageJsonLdStructuredData: (s.clientsPageJsonLdStructuredData as string | null) ?? null,
    clientsPageJsonLdLastGenerated: (s.clientsPageJsonLdLastGenerated as Date | string | null) ?? null,
    clientsPageJsonLdValidationReport: s.clientsPageJsonLdValidationReport,
    categoriesPageMetaTags: s.categoriesPageMetaTags,
    categoriesPageJsonLdStructuredData: (s.categoriesPageJsonLdStructuredData as string | null) ?? null,
    categoriesPageJsonLdLastGenerated: (s.categoriesPageJsonLdLastGenerated as Date | string | null) ?? null,
    categoriesPageJsonLdValidationReport: s.categoriesPageJsonLdValidationReport,
    trendingPageMetaTags: s.trendingPageMetaTags,
    trendingPageJsonLdStructuredData: (s.trendingPageJsonLdStructuredData as string | null) ?? null,
    trendingPageJsonLdLastGenerated: (s.trendingPageJsonLdLastGenerated as Date | string | null) ?? null,
    trendingPageJsonLdValidationReport: s.trendingPageJsonLdValidationReport,
  };

  return (
    <div className="container mx-auto max-w-[1128px] px-6">
      <ModontySettingHeader />
      <Suspense fallback={<PageSelectorFallback />}>
        <PageSelector settingsDefaults={settingsDefaults} generatedSeo={generatedSeo} />
      </Suspense>
    </div>
  );
}
