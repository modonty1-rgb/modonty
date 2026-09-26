import type { Metadata } from "next";

import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { buildMetadataFromPageRow } from "@/lib/seo/build-metadata-from-page-row";
import { getContentPageRow } from "@/lib/seo/get-content-page-row";
import { messages } from "@/lib/i18n/messages";

import { QuranPlayer } from "./components/quran-player/QuranPlayer";

/**
 * The recitation on its own page (Khalid, 26 Sep 2026: «افصل القرآن براوت مستقل بذاته»). It
 * was the first tab of `/audio` beside the spoken articles; now `/audio` is the articles and
 * this is the mushaf — each page ranks for what it actually is, and the Quran gets its own
 * door among the sector tiles on `/modonty`.
 *
 * No `quran` row exists in the admin's page table yet (measured on `modonty_dev`), so the
 * title and description fall back to the literals below until one is saved at
 * `/modonty/pages/quran`. That fallback is deliberate and temporary, not the source of truth.
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataFromPageRow(await getContentPageRow("quran"), {
    path: "/quran",
    fallbackTitle: "القرآن الكريم كاملاً بعشرين قارئاً",
    fallbackDescription: messages.seo.quran.description,
  });
}

export default function QuranPage() {
  const t = messages.quran;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            generateBreadcrumbStructuredData([
              { name: "الرئيسية", url: "/" },
              { name: t.breadcrumbLabel, url: "/quran" },
            ])
          ),
        }}
      />
      {/* No `--sticky-chrome` top padding: the header is `sticky` (it holds its own space), and
          the 135px that variable still assumes was the icon strip that moved to the bottom bar. */}
      <div>
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: t.breadcrumbLabel },
          ]}
        />
        {/* `pt-2` under the breadcrumb, not `py-6`: the breadcrumb band is already 44–56px of
            air, and the old 24px on top of it left the title floating (Khalid: «بكسل بكسل»). */}
        <div className="container mx-auto max-w-[1128px] px-3 pb-6 pt-2 sm:px-4">
          {/* Drawn on desktop, spoken on phones: there the breadcrumb right above already reads
              «القرآن الكريم». The line under the title is the player's provenance — the old
              `t.intro` said the same facts a second time, so it is gone. */}
          <h1 className="mb-1 text-2xl font-bold leading-tight text-foreground max-md:sr-only">{t.srTitle}</h1>
          <QuranPlayer labels={t.player} />
        </div>
      </div>
    </>
  );
}
