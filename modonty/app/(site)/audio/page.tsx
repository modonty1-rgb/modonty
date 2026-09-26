import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContentPageRow } from "@/lib/seo/get-content-page-row";
import { messages } from "@/lib/i18n/messages";
import { IconVolume2 } from "@/lib/icons";

import { ListenQueue } from "./components/listen-queue/ListenQueue";
import { getAudioArticles } from "./data/get-audio-articles";

/**
 * The spoken articles, and only them. Until 26 Sep 2026 this page also carried the whole
 * mushaf as its first tab; the recitation moved to `/quran` (Khalid: «افصل القرآن براوت مستقل
 * بذاته»), so the two-column shell and the phone tab switch that sat between them are gone.
 *
 * The page's admin row (`/modonty/pages/audio`) still titles it after the Quran on
 * `modonty_dev` — «استمع للقرآن الكريم كاملاً…» — and the row wins over any fallback here, so
 * that title has to be rewritten in the admin; code cannot fix it without overriding the row.
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("audio"), {
    path: "/audio",
    fallbackDescription: messages.seo.audio.description,
  });
}

export default async function AudioArticlesPage() {
  const articles = await getAudioArticles();
  // كل نصّ عربي يراه الزائر في هذه الصفحة يمرّ على messages/ar.json ويُقرأ هنا (سيرفر)
  // ثم يُمرَّر للمكوّن العميل كخصائص — صفر جافاسكربت إضافي للرسائل.
  const t = messages.audio;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            generateBreadcrumbStructuredData([
              { name: "الرئيسية", url: "/" },
              { name: t.breadcrumbLabel, url: "/audio" },
            ])
          ),
        }}
      />
      {/* No `--sticky-chrome` top padding any more: the header is `sticky` (it holds its own
          space), and the 135px that variable assumes was the icon strip, now the bottom bar. */}
      <div>
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: t.breadcrumbLabel },
          ]}
        />
        <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-xl font-bold text-foreground">{t.articlesRail.heading}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.intro}</p>
            {articles.length === 0 ? (
              <p className="mt-6 flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                <IconVolume2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                {t.articlesRail.empty}
              </p>
            ) : (
              <ListenQueue articles={articles} labels={t.queue} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
