import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PAGE_CONFIGS } from "../../setting/helpers/page-config";
import { getPage } from "../../setting/actions/page-actions";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import { PageFormWrapper } from "./page-form-wrapper";
import { SocialLinksForm } from "./components/social-links-form";

// The Accounts page carries the social-links form, whose save runs the settings cascade via
// after() — the same budget /settings/social had before the form moved here.
export const maxDuration = 800;

export default async function ModontyPageEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const config = PAGE_CONFIGS.find((c) => c.slug === slug);
  if (!config) {
    redirect("/modonty/pages/about");
  }

  const [pageResult, settings, coreClientId] = await Promise.all([
    getPage(slug),
    getAllSettings(),
    getCoreClientId(),
  ]);

  const settingsDefaults = {
    siteUrl: settings.siteUrl ?? "https://modonty.com",
    twitterSite: settings.twitterSite ?? "",
    twitterCreator: settings.twitterCreator ?? "",
    logoUrl: settings.logoUrl ?? "",
    defaultMetaRobots: settings.defaultMetaRobots ?? "index, follow",
    defaultGooglebot: settings.defaultGooglebot ?? "index, follow",
    defaultOgType: settings.defaultOgType ?? "website",
    defaultOgLocale: settings.defaultOgLocale ?? "ar_SA",
    defaultOgDeterminer: settings.defaultOgDeterminer ?? "auto",
    defaultTwitterCard: settings.defaultTwitterCard ?? "summary_large_image",
    defaultSitemapPriority: settings.defaultSitemapPriority ?? 0.5,
    defaultSitemapChangeFreq: settings.defaultSitemapChangeFreq ?? "monthly",
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <PageFormWrapper
          slug={slug}
          pageLabel={config.label}
          pageDescription={`${config.description} — ${config.modontyPath}`}
          pageData={pageResult.success ? pageResult.page : null}
          settingsDefaults={settingsDefaults}
          coreClientId={coreClientId}
          seoOnly={config.seoOnly ?? false}
          // /accounts IS the list of our social accounts — they are the page, so they come
          // first, right under the header, and the SEO/share-image fields follow.
          beforeFields={slug === "accounts" ? <SocialLinksForm key="accounts-form" initialSettings={settings} /> : undefined}
        />
      </Suspense>
    </div>
  );
}
