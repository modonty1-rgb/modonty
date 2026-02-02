"use client";

import { useState, useEffect, useCallback, type ComponentProps } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PAGE_CONFIGS, getDefaultPageConfig, GENERATE_MJ_SLUG } from "../helpers/page-config";
import { getPage } from "../actions/page-actions";
import { PageForm, type SettingsDefaults } from "./page-form";
import { GenerateMJSection, type GeneratedSeoData } from "./sections/generate-mj-section";
import { Loader2 } from "lucide-react";

export function PageSelector({
  settingsDefaults,
  generatedSeo,
}: {
  settingsDefaults: SettingsDefaults;
  generatedSeo: GeneratedSeoData;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("page");
  const selectedSlug =
    slugFromUrl && PAGE_CONFIGS.some((c) => c.slug === slugFromUrl)
      ? slugFromUrl
      : getDefaultPageConfig().slug;

  const [pageData, setPageData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    router.refresh();
    if (selectedSlug !== GENERATE_MJ_SLUG) {
      getPage(selectedSlug).then((result) => {
        if (result.success) setPageData(result.page);
        else setPageData(null);
      });
    }
  }, [selectedSlug, router]);

  useEffect(() => {
    if (selectedSlug === GENERATE_MJ_SLUG) {
      setLoading(false);
      setError(null);
      setPageData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPage(selectedSlug).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setPageData(result.page);
      } else {
        setError(result.error || "Failed to load page");
        setPageData(null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  if (selectedSlug === GENERATE_MJ_SLUG) {
    return (
      <GenerateMJSection
        generatedSeo={generatedSeo}
        onRegenerated={refetch}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }
  const page = pageData as Record<string, unknown> | null | undefined;
  const rawOgLocaleAlternate = (page?.metaTags as Record<string, unknown> | undefined)?.ogLocaleAlternate ?? page?.ogLocaleAlternate;
  const ogLocaleAlternate = typeof rawOgLocaleAlternate === "string" ? rawOgLocaleAlternate : undefined;
  const initialData = page
    ? ({ ...page, ogLocaleAlternate } as ComponentProps<typeof PageForm>["initialData"])
    : undefined;
  return (
    <PageForm
      slug={selectedSlug}
      initialData={initialData}
      onRegenerated={refetch}
      settingsDefaults={settingsDefaults}
    />
  );
}
