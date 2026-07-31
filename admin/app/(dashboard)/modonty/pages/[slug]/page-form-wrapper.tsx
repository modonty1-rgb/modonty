"use client";

import { useRouter } from "next/navigation";
import { type ComponentProps } from "react";
import { PageForm } from "../../setting/components/page-form";

interface PageFormWrapperProps {
  slug: string;
  pageLabel: string;
  pageDescription: string;
  pageData: Record<string, unknown> | null;
  settingsDefaults: ComponentProps<typeof PageForm>["settingsDefaults"];
  /** Modonty Core (T2): platform images come from the core client's own library. */
  coreClientId: string | null;
}

export function PageFormWrapper({ slug, pageLabel, pageDescription, pageData, settingsDefaults, coreClientId }: PageFormWrapperProps) {
  const router = useRouter();

  const rawOgLocaleAlternate = (pageData?.metaTags as Record<string, unknown> | undefined)?.ogLocaleAlternate ?? pageData?.ogLocaleAlternate;
  const ogLocaleAlternate = typeof rawOgLocaleAlternate === "string" ? rawOgLocaleAlternate : undefined;

  const initialData = pageData
    ? ({ ...pageData, ogLocaleAlternate } as ComponentProps<typeof PageForm>["initialData"])
    : undefined;

  return (
    <PageForm
      slug={slug}
      pageLabel={pageLabel}
      pageDescription={pageDescription}
      initialData={initialData}
      onRegenerated={() => router.refresh()}
      settingsDefaults={settingsDefaults}
      coreClientId={coreClientId}
    />
  );
}
