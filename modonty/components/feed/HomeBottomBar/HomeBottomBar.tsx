import { getCategoriesWithCounts } from "@/app/api/helpers/category-queries";
import { getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { getTagsWithCounts } from "@/app/api/helpers/tag-queries";
import { getClientsForSidebar, getClientHeroSlides } from "@/app/api/helpers/client-queries";
import { HomeBottomBarLoader } from "./HomeBottomBarLoader";
import type { FilterOption } from "./types";

// Server component — homepage-only mobile action bar.
// Mirrors the desktop sidebars 1:1: Discover (categories/industries/tags) + Partners + Newsletter.
// Reuses the same cached queries the sidebars use (zero extra DB cost), then hands minimal
// data to a lazy client shell.
export async function HomeBottomBar() {
  const [categories, industries, tags, clients, heroSlides] = await Promise.all([
    getCategoriesWithCounts(),
    getIndustriesWithCounts(),
    getTagsWithCounts(),
    getClientsForSidebar(20),
    getClientHeroSlides(),
  ]);

  const categoryOptions: FilterOption[] = categories
    .filter((c) => c.articleCount > 0)
    .sort((a, b) => b.articleCount - a.articleCount)
    .map((c) => ({ name: c.name, slug: c.slug, count: c.articleCount }));

  const industryOptions: FilterOption[] = [...industries]
    .sort((a, b) => b.clientCount - a.clientCount)
    .map((i) => ({ name: i.name, slug: i.slug, count: i.clientCount }));

  const tagOptions: FilterOption[] = [...tags]
    .sort((a, b) => b.articleCount - a.articleCount)
    .map((t) => ({ name: t.name, slug: t.slug, count: t.articleCount }));

  // Mirror the desktop sidebar 1:1 — show ALL active partners (incl. those with no
  // articles yet), same order (createdAt desc from getClientsForSidebar). The feed-filter
  // chip is hidden per-row when count === 0 (see HomeBottomBarShell), matching desktop.
  const partnerOptions: FilterOption[] = clients
    .map((c) => ({ name: c.name, slug: c.slug, count: c.articleCount, logo: c.logo, industry: c.industry }));

  return (
    <HomeBottomBarLoader
      categories={categoryOptions}
      industries={industryOptions}
      tags={tagOptions}
      partners={partnerOptions}
      heroSlides={heroSlides}
    />
  );
}
