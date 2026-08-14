# Modonty — Cached-SEO Architecture

> هذا المرجع يصف **النمط المعماري الموحد** لتخزين بيانات الـ SEO في Modonty.
> أي كود يخص الـ SEO يجب أن يتبع هذا النمط — لا استثناءات.

---

## 🎯 المبدأ الأساسي

كل عملية حسابية تخص الـ SEO **تتم وقت الكتابة (create/update)** وتُخزَّن في الـ DB.
وقت القراءة (طلب الزائر) **فقط SELECT** من جدول `ArticleSEO` وتمريرها للـ render layer.

```
                    ┌─────────────────────────────┐
                    │  Admin saves/updates article │
                    └─────────────┬────────────────┘
                                  ▼
                  ┌──────────────────────────────────┐
                  │  computeArticleSEO(article)      │
                  │  - meta tags                     │
                  │  - OG + Twitter                  │
                  │  - JSON-LD (Article + Breadcrumb)│
                  │  - canonical + hreflang          │
                  │  - robots directives             │
                  └──────────────┬───────────────────┘
                                 ▼
                  ┌──────────────────────────────────┐
                  │  prisma.articleSEO.upsert(...)   │
                  └──────────────┬───────────────────┘
                                 ▼
                        [Cache invalidation]
                                 ▼
        ┌─────────────────────────────────────────────────┐
        │  Visitor hits /ar/blog/[slug]                    │
        │  → SELECT seo FROM articleSEO WHERE articleId=?  │
        │  → generateMetadata({ seo })                     │
        │  → render <script ld+json>{seo.jsonLdArticle}    │
        │  → HTML ready for audit tools                    │
        └─────────────────────────────────────────────────┘
```

---

## 🗂️ Prisma Schema

```prisma
model Article {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  slug        String   @unique
  locale      Locale   // ar | en
  title       String
  body        String
  coverImage  String   // CDN URL
  authorId    String   @db.ObjectId
  categoryId  String   @db.ObjectId
  publishedAt DateTime?
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())

  author      Author    @relation(fields: [authorId], references: [id])
  category    Category  @relation(fields: [categoryId], references: [id])
  tags        Tag[]     @relation(fields: [tagIds], references: [id])
  tagIds      String[]  @db.ObjectId

  // النسخ الأخرى للهرفلانج
  translationGroupId String? @db.ObjectId
  translations       Article[] @relation("Translations", fields: [translationGroupId])

  seo         ArticleSEO?

  @@index([slug, locale])
  @@index([publishedAt])
}

// 🎯 الكائن المركزي للسيو — كل ما يحتاجه الزائر يخرج من هنا
model ArticleSEO {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  articleId       String   @unique @db.ObjectId
  article         Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  // ── Basic Meta ─────────────────────────────────
  metaTitle       String   // ≤ 60 chars
  metaDescription String   // 50-160 chars
  canonical       String   // absolute https URL
  robots          String   @default("index,follow")
  authorMeta      String   // <meta name="author">
  lang            String   // ar | en
  dir             String   // rtl | ltr

  // ── Open Graph ─────────────────────────────────
  ogTitle         String
  ogDescription   String
  ogImage         String   // CDN URL, ≥ 1200×630
  ogImageWidth    Int      @default(1200)
  ogImageHeight  Int      @default(630)
  ogImageAlt     String
  ogType          String   @default("article")
  ogUrl           String   // = canonical
  ogSiteName      String   @default("Modonty")
  ogLocale        String   // ar_SA | en_US

  // ── Twitter Card ───────────────────────────────
  twitterCard         String   @default("summary_large_image")
  twitterTitle        String
  twitterDescription  String
  twitterImage        String
  twitterImageAlt     String
  twitterSite         String?  // @modonty
  twitterCreator      String?  // @author_handle

  // ── Article Metadata (للـ OG: article:*) ─────
  articlePublishedTime DateTime
  articleModifiedTime  DateTime
  articleSection       String   // = category name
  articleTags          String[]
  articleAuthor        String   // URL to author page

  // ── JSON-LD (محسوبة ومحفوظة كـ JSON strings) ─
  jsonLdArticle    Json   // كائن BlogPosting / Article كامل
  jsonLdBreadcrumb Json   // كائن BreadcrumbList
  jsonLdPublisher  Json?  // (للـ pages المركزية فقط)

  // ── International ──────────────────────────────
  hreflangVariants Json   // [{ lang: "ar-SA", url: "..." }, ...]

  // ── Sitemap metadata ──────────────────────────
  sitemapLastmod   DateTime
  sitemapChangefreq String  @default("monthly")
  sitemapPriority  Float    @default(0.8)

  // ── Bookkeeping ───────────────────────────────
  computeVersion   Int      @default(1)
  computedAt       DateTime
  contentHash      String   // SHA-256 للمحتوى المصدر، للكشف عن تغيرات
  updatedAt        DateTime @updatedAt

  @@index([articleId])
  @@index([sitemapLastmod])
}
```

**ملاحظات على الـ schema:**

1. `articleSEO` علاقة 1:1 مع `Article` مع `onDelete: Cascade` — لو حذفت المقالة يحذف السيو معها.
2. `computeVersion` يستخدم للترقيات: لو غيرت منطق `computeArticleSEO` ارفع الـ version → ادفع background job يعيد الحساب لكل المقالات اللي عندها version أقل.
3. `contentHash` يمنع إعادة الحساب لو ما تغير شيء فعلياً (idempotent recompute).
4. `jsonLdArticle` كـ `Json` (mongo-friendly) عشان نخزن الكائن كما هو دون ما نسلسله مرتين.

---

## 🔧 The Compute Function

```typescript
// app/lib/seo/computeArticleSEO.ts
import type { Article, Author, Category } from '@prisma/client';
import { getPublisher } from './publisher';
import { truncate, slugifyTitle } from './helpers';
import { buildArticleJsonLd } from './jsonld/article';
import { buildBreadcrumbJsonLd } from './jsonld/breadcrumb';
import { resolveHreflangVariants } from './hreflang';
import crypto from 'node:crypto';

type ArticleWithRelations = Article & {
  author: Author;
  category: Category;
  tags: { name: string }[];
  translations: { locale: string; slug: string }[];
};

export type ComputedSEO = Omit<
  Prisma.ArticleSEOCreateInput,
  'article' | 'createdAt' | 'updatedAt'
>;

export function computeArticleSEO(
  article: ArticleWithRelations
): ComputedSEO {
  // 1. validate inputs — assertions صريحة
  assertHasRequiredFields(article);

  // 2. derive basic meta
  const metaTitle = truncate(article.title, 60);
  const metaDescription = truncate(
    article.metaDescription ?? extractFirstParagraph(article.body),
    160
  );
  const canonical = buildCanonical(article);

  // 3. derive OG / Twitter
  const ogImage = ensureCdnUrl(article.coverImage);
  // ...

  // 4. build JSON-LD via type-safe builder
  const jsonLdArticle = buildArticleJsonLd({
    headline: truncate(article.title, 110),
    image: [
      transformImage(ogImage, '1x1'),
      transformImage(ogImage, '4x3'),
      transformImage(ogImage, '16x9'),
    ],
    datePublished: article.publishedAt!.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: buildAuthorUrl(article.author.slug, article.locale),
    },
    publisher: getPublisher(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    articleSection: article.category.name,
    keywords: article.tags.map((t) => t.name),
    inLanguage: article.locale === 'ar' ? 'ar-SA' : 'en-US',
  });

  const jsonLdBreadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: rootUrl(article.locale) },
    { name: article.category.name, url: categoryUrl(article.category.slug, article.locale) },
    { name: article.title, url: canonical },
  ]);

  // 5. derive hreflang
  const hreflangVariants = resolveHreflangVariants(article);

  // 6. content hash for idempotency
  const contentHash = sha256({
    title: article.title,
    body: article.body,
    coverImage: article.coverImage,
    slug: article.slug,
    authorId: article.authorId,
    categoryId: article.categoryId,
    tagIds: article.tagIds,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
  });

  return {
    articleId: article.id,
    metaTitle,
    metaDescription,
    canonical,
    robots: deriveRobotsDirectives(article),
    authorMeta: article.author.name,
    lang: article.locale,
    dir: article.locale === 'ar' ? 'rtl' : 'ltr',
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: article.title,
    ogType: 'article',
    ogUrl: canonical,
    ogSiteName: 'Modonty',
    ogLocale: article.locale === 'ar' ? 'ar_SA' : 'en_US',
    twitterCard: 'summary_large_image',
    twitterTitle: metaTitle,
    twitterDescription: metaDescription,
    twitterImage: ogImage,
    twitterImageAlt: article.title,
    twitterSite: '@modonty',
    twitterCreator: article.author.twitterHandle ?? undefined,
    articlePublishedTime: article.publishedAt!,
    articleModifiedTime: article.updatedAt,
    articleSection: article.category.name,
    articleTags: article.tags.map((t) => t.name),
    articleAuthor: buildAuthorUrl(article.author.slug, article.locale),
    jsonLdArticle,
    jsonLdBreadcrumb,
    hreflangVariants,
    sitemapLastmod: article.updatedAt,
    sitemapChangefreq: 'monthly',
    sitemapPriority: 0.8,
    computeVersion: 1,
    computedAt: new Date(),
    contentHash,
  };
}

function assertHasRequiredFields(a: ArticleWithRelations): void {
  if (!a.slug) throw new SEOPrerequisiteError('article.slug is missing');
  if (!a.title) throw new SEOPrerequisiteError('article.title is missing');
  if (!a.body) throw new SEOPrerequisiteError('article.body is missing');
  if (!a.coverImage) throw new SEOPrerequisiteError('article.coverImage is missing');
  if (!a.publishedAt) throw new SEOPrerequisiteError('article.publishedAt is missing');
  if (!a.author?.name) throw new SEOPrerequisiteError('article.author is missing');
  if (!a.category?.name) throw new SEOPrerequisiteError('article.category is missing');
}
```

---

## 💾 Save / Upsert

```typescript
// app/lib/seo/saveArticleSEO.ts
import { prisma } from '@/lib/prisma';
import { computeArticleSEO } from './computeArticleSEO';

export async function saveArticleSEO(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: true,
      category: true,
      tags: true,
      translations: { select: { locale: true, slug: true } },
    },
  });

  if (!article) throw new Error(`Article ${articleId} not found`);

  const computed = computeArticleSEO(article);

  // idempotency check
  const existing = await prisma.articleSEO.findUnique({
    where: { articleId },
    select: { contentHash: true },
  });

  if (existing?.contentHash === computed.contentHash) {
    return { skipped: true, reason: 'unchanged' };
  }

  await prisma.articleSEO.upsert({
    where: { articleId },
    create: computed,
    update: computed,
  });

  // invalidate Next.js cache
  await revalidatePath(`/ar/blog/${article.slug}`);
  await revalidatePath(`/en/blog/${article.slug}`);
  await revalidateTag(`article:${article.slug}`);

  return { skipped: false };
}
```

---

## 🔁 Recompute Triggers

كل واحد من هذي الأحداث يجب أن يستدعي `saveArticleSEO(articleId)`:

| الحدث | في الكود |
|-------|---------|
| إنشاء مقالة جديدة | `articles.create` mutation/router |
| تعديل أي حقل في المقالة | `articles.update` mutation/router |
| تغيير الـ slug | `articles.update` — لازم تحدّث canonical + sitemap + hreflang |
| تغيير المؤلف | `articles.update` — لازم تحدّث JSON-LD.author |
| تعديل بيانات المؤلف (اسم/url) | background job لكل مقالاته |
| تعديل بيانات التصنيف | background job لكل مقالات التصنيف |
| تعديل بيانات الـ Publisher (الموقع) | background job لكل المقالات (نسخة كبيرة) |
| إضافة/حذف ترجمة | recompute للمقالة وجميع ترجماتها |
| تغيير الـ schema (`computeVersion` ارتفع) | background job لكل المقالات |

```typescript
// app/server/api/routers/articles.ts
articles.update: protectedProcedure
  .input(updateArticleInput)
  .mutation(async ({ input, ctx }) => {
    const updated = await ctx.prisma.article.update({
      where: { id: input.id },
      data: input.data,
    });

    // ❗ ALWAYS recompute SEO after any article mutation
    await saveArticleSEO(updated.id);

    return updated;
  });
```

---

## 🛡️ Idempotency via `contentHash`

```typescript
function sha256(payload: object): string {
  const stable = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(stable).digest('hex');
}
```

اللي يدخل في الـ hash هو **كل قيمة تأثر على الـ SEO**. لو ما تغير شيء فعلياً، نتخطى الـ upsert + الـ revalidate.

---

## 📤 Reading at Request Time

```typescript
// app/[locale]/blog/[slug]/page.tsx
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';

interface PageProps {
  params: { locale: 'ar' | 'en'; slug: string };
}

async function getArticleWithSEO(locale: string, slug: string) {
  return prisma.article.findUnique({
    where: { slug_locale: { slug, locale } },
    include: { seo: true },
  });
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const article = await getArticleWithSEO(params.locale, params.slug);
  if (!article?.seo) return {};

  const { seo } = article;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    authors: [{ name: seo.authorMeta }],
    robots: seo.robots,
    alternates: {
      canonical: seo.canonical,
      languages: Object.fromEntries(
        (seo.hreflangVariants as { lang: string; url: string }[]).map(
          (v) => [v.lang, v.url]
        )
      ),
    },
    openGraph: {
      type: 'article',
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.ogUrl,
      siteName: seo.ogSiteName,
      locale: seo.ogLocale,
      images: [{
        url: seo.ogImage,
        width: seo.ogImageWidth,
        height: seo.ogImageHeight,
        alt: seo.ogImageAlt,
      }],
      publishedTime: seo.articlePublishedTime.toISOString(),
      modifiedTime: seo.articleModifiedTime.toISOString(),
      section: seo.articleSection,
      tags: seo.articleTags,
      authors: [seo.articleAuthor],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: [{ url: seo.twitterImage, alt: seo.twitterImageAlt }],
      site: seo.twitterSite ?? undefined,
      creator: seo.twitterCreator ?? undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticleWithSEO(params.locale, params.slug);
  if (!article?.seo) notFound();

  return (
    <>
      <JsonLd data={article.seo.jsonLdArticle} />
      <JsonLd data={article.seo.jsonLdBreadcrumb} />
      <article lang={article.seo.lang} dir={article.seo.dir}>
        {/* render content */}
      </article>
    </>
  );
}
```

```typescript
// components/seo/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

---

## 🚫 الـ Anti-Patterns

| ❌ خطأ | ✅ صح |
|--------|------|
| حساب الـ metaTitle من `article.title` داخل `generateMetadata` | تخزينه في `articleSEO.metaTitle` وقت الإنشاء |
| `description: article.body.substring(0, 160)` | تخزين `metaDescription` في الـ DB |
| `<script>{JSON.stringify({ '@type': 'Article', ...})}</script>` مباشرة في الـ component | builder type-safe + تخزين الناتج في `articleSEO.jsonLdArticle` |
| canonical = `/blog/${slug}` (نسبي) | canonical = `https://modonty.com/ar/blog/${slug}` (مطلق) |
| `revalidatePath` بدون upsert | upsert أولاً → بعدها revalidate |

---

## 🔍 الفحوصات الإضافية (للـ types)

```typescript
// app/types/seo.ts
import { z } from 'zod';

export const ArticleSEOSchema = z.object({
  metaTitle: z.string().min(10).max(60),
  metaDescription: z.string().min(50).max(160),
  canonical: z.string().url().startsWith('https://'),
  ogImage: z.string().url().startsWith('https://'),
  ogImageWidth: z.literal(1200),
  ogImageHeight: z.literal(630),
  ogLocale: z.enum(['ar_SA', 'en_US']),
  twitterCard: z.literal('summary_large_image'),
  // ...
});

// استخدمها داخل computeArticleSEO قبل ما ترجع النتيجة
const validated = ArticleSEOSchema.parse(result);
```

هذا يمنع أي SEO row من الدخول للـ DB وهو ناقص أو غلط.

---

## 📚 المصادر الرسمية لهذا المرجع

- [Next.js — generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Prisma — One-to-one relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-one-relations)
- [Google — Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google — generateMetadata best practices](https://developers.google.com/search/docs/crawling-indexing/special-tags)
