import Image from "next/image";

import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { IconCategory, IconIndustry, IconChevronLeft } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";
import type { CategoryResponse } from "@/lib/types";

interface Industry { id: string; name: string; slug: string; clientCount: number; socialImage?: string | null }
interface Tag      { id: string; name: string; slug: string; articleCount: number; socialImage?: string | null }

interface DiscoveryCardProps {
  categories: CategoryResponse[];
  totalArticlesAll: number;
  industries: Industry[];
  tags: Tag[];
}

// Server component (was 'use client'): the desktop-only left sidebar is `hidden lg:flex`,
// yet its client JS + Radix (Tabs/ScrollArea/Avatar) still shipped + hydrated on mobile.
// Rebuilt as pure server output — CSS-only tabs (radio + :checked sibling panels, zero JS),
// native scroll, next/image icons (truly lazy → no fetch inside the hidden mobile sidebar).
// All discovery links stay in the SSR HTML on every viewport → SEO/internal-linking preserved
// (Google indexes the mobile render). Trade-off: the active-category highlight was dropped
// (it needed useSearchParams, unavailable under the homepage `use cache`).

const rowClass = "flex min-w-0 items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors group cursor-pointer";
const labelClass = "flex-1 inline-flex items-center justify-center gap-1 text-[11px] h-6 rounded-sm cursor-pointer select-none text-muted-foreground border-b-2 border-transparent transition-colors";
const exploreClass = "inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0";
const countPillClass = "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground";

const TABS_CSS = `
.disc-panels > .disc-panel{display:none}
#disc-cat:checked ~ .disc-panels > .disc-p-cat,
#disc-ind:checked ~ .disc-panels > .disc-p-ind,
#disc-tag:checked ~ .disc-panels > .disc-p-tag{display:flex}
#disc-cat:checked ~ .disc-tabs label[for="disc-cat"],
#disc-ind:checked ~ .disc-tabs label[for="disc-ind"],
#disc-tag:checked ~ .disc-tabs label[for="disc-tag"]{color:hsl(var(--accent));border-bottom-color:hsl(var(--accent))}
`;

function DiscoveryIcon({ src, alt, fallback }: { src?: string | null; alt: string; fallback: string }) {
  const optimized = stripCloudinaryTransforms(src);
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted text-[9px] font-medium text-muted-foreground">
      {optimized ? (
        <Image
          src={optimized}
          alt={alt}
          width={20}
          height={20}
          sizes="20px"
          quality={75}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        fallback
      )}
    </span>
  );
}

export function DiscoveryCard({ categories, totalArticlesAll, industries, tags }: DiscoveryCardProps) {
  const activeCategories = [...categories.filter((c) => c.articleCount > 0)].sort((a, b) => b.articleCount - a.articleCount);
  const sortedIndustries = [...industries].sort((a, b) => b.clientCount - a.clientCount);
  const sortedTags = [...tags].sort((a, b) => b.articleCount - a.articleCount);

  return (
    <Card className="flex-1 min-h-0 flex flex-col">
      <CardContent className="p-3 flex-1 min-h-0 flex flex-col">
        {/* CSS-only tabs — radio inputs drive the :checked sibling panels (zero JS). */}
        <input type="radio" name="discovery-tab" id="disc-cat" defaultChecked className="sr-only" />
        <input type="radio" name="discovery-tab" id="disc-ind" className="sr-only" />
        <input type="radio" name="discovery-tab" id="disc-tag" className="sr-only" />

        <div role="tablist" className="disc-tabs flex w-full mb-3 h-7 gap-1">
          <label htmlFor="disc-cat" className={labelClass}><IconCategory className="h-3 w-3 shrink-0" />الفئات</label>
          <label htmlFor="disc-ind" className={labelClass}><IconIndustry className="h-3 w-3 shrink-0" />الصناعات</label>
          <label htmlFor="disc-tag" className={labelClass}><span className="font-bold">#</span>الوسوم</label>
        </div>

        <div className="disc-panels flex-1 min-h-0 flex flex-col">
          {/* ─── الفئات ─── */}
          <div className="disc-panel disc-p-cat flex-1 min-h-0 flex-col">
            <div className="flex items-center justify-between mb-2">
              <Link href="/categories" className={exploreClass}>
                <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
                استكشف
              </Link>
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
                الكل
                <span className="text-[10px] opacity-70">{totalArticlesAll}</span>
              </Link>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin" dir="rtl">
              <div className="flex flex-col gap-0.5 pe-2 pb-4">
                {activeCategories.map((c) => (
                  <Link key={c.id} href={`/?category=${c.slug}`} className={rowClass}>
                    <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                      <DiscoveryIcon src={c.socialImage} alt={c.name} fallback={c.name.slice(0, 1)} />
                      <span className="min-w-0 truncate text-sm text-right transition-colors group-hover:text-primary">{c.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground group-hover:text-primary transition-colors">{c.articleCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ─── الصناعات ─── */}
          <div className="disc-panel disc-p-ind flex-1 min-h-0 flex-col">
            <div className="flex items-center justify-between mb-2">
              <Link href="/industries" className={exploreClass}>
                <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
                استكشف
              </Link>
              <span className={countPillClass}>
                الكل
                <span className="text-[10px]">{sortedIndustries.length.toLocaleString("ar-SA")}</span>
              </span>
            </div>
            {sortedIndustries.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد صناعات</p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin" dir="rtl">
                <div className="flex flex-col gap-0.5 pe-2 pb-4">
                  {sortedIndustries.map((ind) => (
                    <Link key={ind.id} href={`/industries/${ind.slug}`} className={rowClass}>
                      <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <DiscoveryIcon src={ind.socialImage} alt={ind.name} fallback={ind.name.slice(0, 1)} />
                        <span className="min-w-0 truncate text-sm text-right group-hover:text-primary transition-colors">{ind.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground group-hover:text-primary transition-colors">{ind.clientCount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── الوسوم ─── */}
          <div className="disc-panel disc-p-tag flex-1 min-h-0 flex-col">
            <div className="flex items-center justify-between mb-2">
              <Link href="/tags" className={exploreClass}>
                <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
                استكشف
              </Link>
              <span className={countPillClass}>
                الكل
                <span className="text-[10px]">{sortedTags.length.toLocaleString("ar-SA")}</span>
              </span>
            </div>
            {sortedTags.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد وسوم</p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin" dir="rtl">
                <div className="flex flex-col gap-0.5 pe-2 pb-4">
                  {sortedTags.map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`} className={rowClass}>
                      <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <DiscoveryIcon src={tag.socialImage} alt={tag.name} fallback="#" />
                        <span className="min-w-0 truncate text-sm text-right group-hover:text-primary transition-colors">{tag.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground group-hover:text-primary transition-colors">{tag.articleCount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: TABS_CSS }} />
      </CardContent>
    </Card>
  );
}
