"use client";

import { useRouter } from "next/navigation";
import { type ComponentProps } from "react";
import { PageForm } from "../../setting/components/page-form";

interface PageFormWrapperProps {
  slug: string;
  pageData: Record<string, unknown> | null;
  settingsDefaults: ComponentProps<typeof PageForm>["settingsDefaults"];
}

export function PageFormWrapper({ slug, pageData, settingsDefaults }: PageFormWrapperProps) {
  const router = useRouter();

  const rawOgLocaleAlternate = (pageData?.metaTags as Record<string, unknown> | undefined)?.ogLocaleAlternate ?? pageData?.ogLocaleAlternate;
  const ogLocaleAlternate = typeof rawOgLocaleAlternate === "string" ? rawOgLocaleAlternate : undefined;

  const initialData = pageData
    ? ({ ...pageData, ogLocaleAlternate } as ComponentProps<typeof PageForm>["initialData"])
    : undefined;

  return (
    <PageForm
      slug={slug}
      initialData={initialData}
      onRegenerated={() => router.refresh()}
      settingsDefaults={settingsDefaults}
    />
  );
}
