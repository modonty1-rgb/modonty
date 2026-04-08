import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PAGE_CONFIGS } from "../../setting/helpers/page-config";
import { getPage } from "../../setting/actions/page-actions";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { PageFormWrapper } from "./page-form-wrapper";

export default async function ModontyPageEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const config = PAGE_CONFIGS.find((c) => c.slug === slug);
  if (!config) {
    redirect("/modonty/pages/about");
  }

  const [pageResult, settings] = await Promise.all([getPage(slug), getAllSettings()]);

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
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <PageFormWrapper
          slug={slug}
          pageLabel={config.label}
          pageDescription={`${config.description} — ${config.modontyPath}`}
          pageData={pageResult.success ? pageResult.page : null}
          settingsDefaults={settingsDefaults}
        />
      </Suspense>
    </div>
  );
}
