import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { IconVolume2 } from "@/lib/icons";

import { AudioRow } from "./components/audio-row/AudioRow";
import { getAudioArticles } from "./data/get-audio-articles";

/**
 * Through the shared builder like every other public page. The two-field object it replaces
 * shipped no canonical, no hreflang, no og: and no twitter: — the page was in the top nav and
 * in the sitemap while being the only one Google could not place.
 *
 * `noindex` on purpose: the feature has no content yet, and an empty page in the index earns
 * a thin-content mark that outlives the emptiness. Lift it the day the first audio ships.
 */
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await buildMetadataFromPageRow(null, {
    path: "/audio",
    fallbackTitle: "استمع إلى المقالات",
    fallbackDescription:
      "النسخ الصوتية من مقالات مدونتي — اسمع المقال وأنت في الطريق أو في الجيم. قيد التجهيز.",
  });
  return { ...metadata, robots: { index: false, follow: true } };
}

export default async function AudioArticlesPage() {
  const articles = await getAudioArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            generateBreadcrumbStructuredData([
              { name: "الرئيسية", url: "/" },
              { name: "استمع", url: "/audio" },
            ])
          ),
        }}
      />

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "استمع" },
        ]}
      />

      <main className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold leading-tight">استمع إلى المقالات</h1>
        <p className="mt-2 text-muted-foreground">
          النسخ الصوتية من مقالات مدونتي — تسمع المقال وأنت في الطريق أو في الجيم.
        </p>

        {articles.length === 0 ? (
          /* A real empty state, not a blank page: it says what is coming and where to go
             meanwhile. A visitor who lands here from the top nav leaves with somewhere to go. */
          <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <IconVolume2 className="h-10 w-10 text-muted-foreground" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">لسه ما نزلت أول نسخة صوتية</p>
              <p className="text-sm text-muted-foreground">
                نشتغل عليها الآن. لين ما تجهز، المقالات كلها موجودة مكتوبة.
              </p>
            </div>
            <a
              href="/articles"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              اقرأ المقالات
            </a>
          </div>
        ) : (
          <>
            {/* The count is the page's own answer to "is there anything here for me". */}
            <p className="mt-6 text-sm text-muted-foreground">
              {articles.length.toLocaleString("ar-SA")} مقال تقدر تسمعه
            </p>
            <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {articles.map((article, i) => (
                <AudioRow key={article.id} article={article} isLcp={i === 0} />
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
