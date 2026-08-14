import { LayoutList } from "lucide-react";

import { getContentPagesSeoAudit, getListingPagesSeoAudit } from "../../actions/listing-pages-seo-audit";
import { CollapsibleSection } from "../collapsible-section";
import { ListingPagesSeoRows } from "./listing-pages-seo-rows";

/**
 * The seven modonty listing pages, graded on the same 16 checks as every other entity
 * (shared/lib/seo/reference). They are the pages Google lands on, and until today nothing
 * in the admin measured them — the dashboard scored categories and tags while the pages
 * themselves went unwatched.
 *
 * Collapsed, the header carries the one number that matters: how many of the seven are
 * below 100. Nothing to do → the count is zero and green, and no row pulses.
 */
export async function ListingPagesSeo() {
  // Two families, one section: the seven Settings-backed listing pages, and the six
  // content pages whose SEO lives on their own Modonty row. Same 16 checks for both.
  const [listing, content] = await Promise.all([
    getListingPagesSeoAudit(),
    getContentPagesSeoAudit(),
  ]);
  const pages = [...listing, ...content];
  const failing = pages.filter((p) => p.score < 100).length;
  const average = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length)
    : 0;

  return (
    <CollapsibleSection
      iconNode={<LayoutList className="h-4 w-4 text-muted-foreground" />}
      title="Pages SEO"
      subtitle="١٣ صفحة — الميتا و JSON-LD وارتباطهما بمصدرهما في القاعدة"
      storageKey="dashListingSeoOpen"
      summary={
        <span
          className={`text-xs font-bold tabular-nums ${
            failing > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {failing > 0 ? `${failing}/${pages.length} تحت ١٠٠` : `${pages.length}/${pages.length} ✓`}
        </span>
      }
      right={
        <p className="text-xs text-muted-foreground">
          متوسّط{" "}
          <span
            className={`text-base font-bold tabular-nums ${
              average >= 100
                ? "text-emerald-600 dark:text-emerald-400"
                : average >= 60
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            {average}
          </span>
        </p>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-[11.5px] font-semibold text-muted-foreground">
            صفحات القوائم — سيوها في إعدادات الموقع
          </p>
          <ListingPagesSeoRows pages={listing} kind="listing" />
        </div>
        <div className="space-y-1.5">
          <p className="text-[11.5px] font-semibold text-muted-foreground">
            صفحات المحتوى — لكل واحدة صفّها ومحرّرها
          </p>
          <ListingPagesSeoRows pages={content} kind="content" />
        </div>
      </div>
    </CollapsibleSection>
  );
}
