import { LinkIcon } from "lucide-react";

import { extractArticleSources } from "./helpers/extract-article-sources";
import { SourcesTable } from "./components/sources-table";

export const dynamic = "force-dynamic";

/**
 * جرد كل مصدرٍ خارجيّ في كل مقال — قبل بناء بوّابة تمنع الجديد.
 *
 * خالد ١٦ سبتمبر ٢٠٢٦، بعد أن ظهرت مواقع بيع روابط تربط إلى مدونتي: أراد أوّلاً
 * معرفة ما دخل مقالاتنا سابقاً. والبوّابة تأتي بعد الجرد لا قبله — فمنعُ الجديد
 * وحده يترك القديم كما هو.
 */
export default async function ArticleSourcesPage() {
  const { domains, totalArticles, totalLinks } = await extractArticleSources();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-3 pb-10" dir="rtl">
      <header className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="size-4 text-muted-foreground" aria-hidden />
          <h1 className="text-lg font-semibold leading-none">مصادر المقالات</h1>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          كل رابطٍ يخرج من مقالاتنا إلى موقعٍ آخر — في المقالات كلّها، لا المنشورة
          وحدها. الرابط إلى موقعٍ رديء يضرّ ترتيبنا عند جوجل، فهنا نراها جميعاً
          ونفحصها قبل أن تضرّنا.
        </p>
      </header>

      {domains.length === 0 ? (
        <section className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/20 px-6 py-14 text-center">
          <h2 className="font-semibold">لا مصادر خارجيّة بعد</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            لا يوجد في المقالات رابطٌ إلى خارج مدونتي — تظهر هنا فور إضافة أوّل مصدر.
          </p>
        </section>
      ) : (
        <SourcesTable domains={domains} totalArticles={totalArticles} totalLinks={totalLinks} />
      )}
    </main>
  );
}
