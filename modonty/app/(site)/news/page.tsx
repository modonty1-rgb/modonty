import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { generateBreadcrumbStructuredData, jsonLdHtml } from "@/lib/seo";
import { buildPageAlternates } from "@/lib/seo/build-page-alternates";
import { buildShareTags } from "@/lib/seo/build-share-tags";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getArticles } from "@/lib/queries/get-articles";
import { IconEmail, IconCheckCircle, IconForward } from "@/lib/icons";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { messages } from "@/lib/i18n/messages";

// عنوان القسم يُبنى من اسم الموقع في الإعدادات — «أخبار X» تصحّ عربياً ولاتينياً معاً،
// وبغياب العمود يبقى «الأخبار» وحده: اسم قسمٍ صحيح، لا اسم ماركة قديم.
const newsTitle = (siteName?: string) => (siteName ? `أخبار ${siteName}` : "الأخبار");
const NEWS_DESCRIPTION = messages.seo.news.description;

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getPageSeoDefaults();
  const title = newsTitle(siteName);
  return {
    // قالب الجذر يُلحق اسم الموقع بكل عنوان (`%s | مدونتي`)، وهذا العنوان يحمل الاسم
    // أصلاً — فتركُه بلا `absolute` شحن «أخبار مدونتي | مدونتي» (مقيس حيّاً ٢٩ أغسطس).
    // الاسم يُذكر مرّة واحدة: هنا، لأنه جزء من اسم القسم لا لاحقةَ ماركة.
    title: { absolute: title },
    description: NEWS_DESCRIPTION,
    // Was inheriting the root layout's four locales, all pointing at "/" — this page told
    // Google its Saudi version was the homepage. Now: its own canonical, locales from Settings.
    alternates: await buildPageAlternates("/news"),
    // Shipped zero og:/twitter: until now — a shared link rendered as bare text. Both halves
    // come from the same Settings columns every other page reads; nothing new is invented.
    ...(await buildShareTags({
      path: "/news",
      title,
      description: NEWS_DESCRIPTION,
    })),
  };
}

export default async function NewsPage() {
  const [{ articles }, { siteName }] = await Promise.all([
    getArticles({ limit: 5 }),
    getPageSeoDefaults(),
  ]);
  const title = newsTitle(siteName);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Same trail as the visible nav below — Google reads this one, not the markup. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            generateBreadcrumbStructuredData([
              { name: "الرئيسية", url: "/" },
              // فتات الخبز يسمّي **القسم** لا الموقع — اسم الموقع على عقدة WebSite.
              { name: "الأخبار", url: "/news" },
            ])
          ),
        }}
      />
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: title },
        ]}
      />

      <div className="mt-8">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <p className="text-muted-foreground mb-8">
          نقطة التجمع لكل ما هو جديد من مدونتي. اشترك في النشرة لتحصل على أهم الأخبار
          والمقالات في رسالة أسبوعية مختصرة.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconEmail className="h-5 w-5" />
              النشرة الإخبارية لأخبار مدونتي
            </CardTitle>
            <CardDescription>
              رسالة أسبوعية واحدة تجمع لك أبرز المقالات، التحديثات، ونصائح فريق مدونتي.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {[
                "ملخص أسبوعي لأبرز الأخبار والمقالات.",
                "روابط مختارة تساعدك على المتابعة دون إضاعة الوقت.",
                "لا بريد مزعج — يمكنك الإلغاء في أي وقت.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <IconCheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="w-full sm:w-auto max-md:h-11">
              <Link href="/news/subscribe" className="inline-flex items-center gap-2">
                اشترك في النشرة الآن
                <IconForward className="h-4 w-4" />
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground">
              نحترم خصوصيتك. لن نشارك بريدك مع أي طرف ثالث، ويمكنك إلغاء الاشتراك بضغطة واحدة.
            </p>
          </CardContent>
        </Card>

        {articles.length > 0 && (
          <section aria-labelledby="news-articles-heading">
            <h2 id="news-articles-heading" className="text-sm font-semibold text-foreground mb-3">
              من أحدث المقالات على مدونتي
            </h2>
            <ul className="space-y-2">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 max-md:min-h-11"
                  >
                    <span>{a.title}</span>
                    <IconForward className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="inline-block mt-4 text-sm text-primary font-medium hover:underline max-md:inline-flex max-md:min-h-11 max-md:items-center"
            >
              تصفح كل المقالات ←
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
