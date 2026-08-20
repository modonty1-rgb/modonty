import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { IconVolume2 } from "@/lib/icons";

import { TwoColumnLayout } from "@modonty/shared/components/column-layout/TwoColumnLayout";

import { ListenQueue } from "./components/listen-queue/ListenQueue";
import { QuranPlayer } from "./components/quran-player/QuranPlayer";
import { getAudioArticles } from "./data/get-audio-articles";
import { SURAHS } from "./data/quran-surahs";

/**
 * Through the shared builder like every other public page.
 *
 * The `noindex` that used to sit here was correct while the page was an empty state — an empty
 * page in the index earns a thin-content mark that outlives the emptiness. It is wrong now: the
 * page carries the complete mushaf, 114 surahs by twenty reciters, which is the most searched
 * subject on this whole site in Saudi Arabia and Egypt. Keeping it hidden was pure waste.
 *
 * The title and description were about something else entirely — «النسخ الصوتية من المقالات …
 * قيد التجهيز» — so anyone searching for a recitation could never have found us. They name the
 * recitation first now, because that is what the page actually is.
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(null, {
    path: "/audio",
    fallbackTitle: "استمع للقرآن الكريم كاملاً بعشرين قارئاً — ومقالات مدونتي مقروءة",
    fallbackDescription:
      "المصحف كامل ١١٤ سورة برواية حفص عن عاصم، بصوت العفاسي والسديس والمعيقلي والحصري والمنشاوي وغيرهم — اسمع أي سورة بأي قارئ، ومعها النسخ الصوتية من مقالات مدونتي.",
  });
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

      {/* The 114 surahs as a named list, so a search engine sees a catalogue rather than a wall of
          buttons. `ItemList` is the vocabulary for exactly this: an ordered set of named things on
          one page. Only names and positions — never a word of the Qur'an itself. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "المصحف المسموع — ١١٤ سورة برواية حفص عن عاصم",
            numberOfItems: SURAHS.length,
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: SURAHS.map((s) => ({
              "@type": "ListItem",
              position: s.n,
              name: s.name,
            })),
          }),
        }}
      />

      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "استمع" },
        ]}
      />

      {/* Two columns, not two tabs (Khalid, 20 Aug): the recitation is the page, and the articles
          sit beside it. The shared shell rather than a hand-rolled grid — same container, same
          gaps as every other two-column page on the site. */}
      <TwoColumnLayout
        header={
          <>
            {/* «اسمع» rather than «استمع» — nearer to how the word is actually said, and it carries
                both halves of the page without flattering either. No single clever line tries to
                cover recitation and marketing articles at once: one would cheapen the first or
                inflate the second. A neutral verb, then a line that names them separately. */}
            <h1 className="text-3xl font-bold leading-tight">اسمع</h1>
            <p className="mt-2 text-muted-foreground">
              القرآن الكريم كاملاً بعشرين قارئاً برواية حفص عن عاصم · ومقالات مدونتي مقروءة.
            </p>
          </>
        }
        main={<QuranPlayer />}
        rail={
          <aside className="w-full shrink-0 lg:w-[300px]" aria-label="المقالات المسموعة">
            <div className="sticky top-20 space-y-3">
              <h2 className="text-xs font-semibold uppercase text-muted-foreground">المقالات المسموعة</h2>
              {articles.length === 0 ? (
                <p className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                  <IconVolume2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                  لسه ما نزلت أول نسخة صوتية من المقالات — والمقالات كلها موجودة مكتوبة.
                </p>
              ) : (
                <ListenQueue articles={articles} compact />
              )}
            </div>
          </aside>
        }
      />
    </>
  );
}
