import { contentPagesSeoAudit, listingPagesSeoAudit, sectorPagesSeoAudit } from "@/lib/dashboard/cached";
import { PanelHead } from "../panel-head";
import { ListingPagesSeoRows } from "./listing-pages-seo-rows";

/**
 * The seven modonty listing pages, graded on the same 16 checks as every other entity
 * (shared/lib/seo/reference). They are the pages Google lands on, and until today nothing
 * in the admin measured them — the dashboard scored categories and tags while the pages
 * themselves went unwatched.
 *
 * The tab heading carries the one number that matters: how many pages are below 100.
 * Nothing to do → «كلها 100», and no row pulses.
 */
export async function ListingPagesSeo() {
  // Two families, one section: the seven Settings-backed listing pages, and the six
  // content pages whose SEO lives on their own Modonty row. Same 16 checks for both.
  const [listing, content, sectors] = await Promise.all([
    listingPagesSeoAudit(),
    contentPagesSeoAudit(),
    sectorPagesSeoAudit(),
  ]);
  const pages = [...listing, ...content, ...sectors];
  const failing = pages.filter((p) => p.score < 100).length;
  const average = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length)
    : 0;

  // The page count comes from the data — the heading said «١٣ صفحة» as fixed text while 17
  // rows showed (30 Sep 2026).
  return (
    <>
      <PanelHead
        title="صفحات الموقع"
        hint={`${pages.length} صفحة — الميتا و JSON-LD وارتباطهما بمصدرهما في القاعدة · ${failing > 0 ? `${failing} تحت 100` : "كلها 100"}`}
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
      />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            صفحات القوائم — سيوها في إعدادات الموقع
          </p>
          <ListingPagesSeoRows pages={listing} kind="listing" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            صفحات المحتوى — لكل واحدة صفّها ومحرّرها
          </p>
          <ListingPagesSeoRows pages={content} kind="content" />
        </div>
        {sectors.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">
              صفحات القطاعات — السيو في مدونتي › القطاعات (المتوقفة خارج الفهرسة فما تُقاس)
            </p>
            <ListingPagesSeoRows pages={sectors} kind="content" />
          </div>
        )}
      </div>
    </>
  );
}
