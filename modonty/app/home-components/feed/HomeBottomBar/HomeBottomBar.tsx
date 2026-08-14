import { getCategoriesWithCounts } from "@/app/home-helpers/get-categories-with-counts";
import { getIndustriesWithCounts } from "@/lib/queries";
import { getTagsWithCounts } from "@/app/home-helpers/get-tags-with-counts";
import { getClientServiceCards } from "@/app/home-helpers/get-client-service-cards";
import { getClientsForSidebar } from "@/app/home-helpers/get-clients-for-sidebar";
import { HomeBottomBarLoader } from "./HomeBottomBarLoader";
import type { FilterOption } from "./types";

// Server component — homepage-only mobile action bar.
// Mirrors the desktop discovery controls and supplies the mobile service CTAs.
// Reuses the same cached queries the sidebars use (zero extra DB cost), then hands minimal
// data to a lazy client shell.
export async function HomeBottomBar() {
  const [categories, industries, tags, clients, services] = await Promise.all([
    getCategoriesWithCounts(),
    getIndustriesWithCounts(),
    getTagsWithCounts(),
    getClientsForSidebar(500),
    getClientServiceCards(),
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
      services={services.map(({ id, visual }) => ({ id, visual }))}
    />
  );
}
