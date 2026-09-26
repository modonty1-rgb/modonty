import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ComingSoon } from "@/components/shared/coming-soon/ComingSoon";
import { fill, messages } from "@/lib/i18n/messages";

import { SECTORS } from "../helpers/sectors";

/**
 * `/modonty/<sector>` — each sector tile's final address, showing «قريباً» until its live page
 * is built (26 Sep 2026). When one is ready it gets its own folder beside this one
 * (`/modonty/football/page.tsx`), which Next matches before this dynamic segment.
 *
 * No `dynamicParams` export: with `cacheComponents` it fails the build («not compatible with
 * nextConfig.cacheComponents», Next 16 docs), so an unknown slug is rejected with `notFound()`.
 */
const SECTOR_PREFIX = "/modonty/";
const sectorsHere = SECTORS.filter((s) => s.href.startsWith(SECTOR_PREFIX));
const findSector = (slug: string) => sectorsHere.find((s) => s.href === `${SECTOR_PREFIX}${slug}`);

export function generateStaticParams() {
  return sectorsHere.map((s) => ({ sector: s.href.slice(SECTOR_PREFIX.length) }));
}

interface SectorPageProps {
  params: Promise<{ sector: string }>;
}

export async function generateMetadata({ params }: SectorPageProps): Promise<Metadata> {
  const found = findSector((await params).sector);
  if (!found) return {};
  const name = messages.modonty.sectors[found.slug];
  return {
    title: fill(messages.modonty.soon.title, { name }),
    // A placeholder is thin content — kept out of the index until the real page replaces it.
    robots: { index: false, follow: true },
  };
}

export default async function SectorComingSoonPage({ params }: SectorPageProps) {
  const found = findSector((await params).sector);
  if (!found) notFound();
  const name = messages.modonty.sectors[found.slug];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "مدونتي", href: "/modonty" },
          { label: name },
        ]}
      />
      <ComingSoon name={name} blurb={messages.modonty.soon.blurbs[found.slug as keyof typeof messages.modonty.soon.blurbs]} icon={found.icon} />
    </>
  );
}
