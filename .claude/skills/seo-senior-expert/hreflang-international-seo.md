# Hreflang & International SEO

> القواعد الكاملة لـ multi-locale (ar + en) في Modonty.

---

## 🎯 المبدأ

`hreflang` يقول لـ Google: "هذي الصفحات هي نسخ لغوية لبعض، اعرض المناسبة لكل مستخدم حسب لغته/بلده."

في Modonty: مقالة واحدة قد تكون موجودة بـ `ar` و `en`. كل نسخة لازم:
1. تربط بنفسها (self-referencing)
2. تربط بكل النسخ الأخرى
3. كل النسخ تربط ببعضها بنفس الطريقة (consistency)

---

## 1️⃣ القواعد الإلزامية

### من Semrush + Google

| القاعدة | السبب |
|---------|------|
| **Self-referencing hreflang** على كل صفحة | Semrush "No self-referencing hreflang URLs" |
| **Absolute URLs** (https://modonty.com/...) | Semrush "Hreflang relative URLs" |
| **URLs ترجع 200**، لا 4xx ولا 3xx | Semrush "Hreflang broken/redirected" |
| **Language code** بصيغة ISO 639-1 (`ar`, `en`) | Semrush "Issues with hreflang values" |
| **Country code (اختياري)** بصيغة ISO 3166-1 alpha-2 (`SA`, `US`, `EG`) | Semrush |
| **لا تعارض** بين hreflang و canonical | Semrush "Hreflang conflicts" |
| **متبادل** (reciprocal) — لو A يشير لـ B، B لازم يشير لـ A | Google |
| **x-default** اختياري لكن موصى به | Google |

---

## 2️⃣ صيغ الـ hreflang

### اللغة فقط (يستهدف كل المتحدثين بها)
- `ar` — كل العرب
- `en` — كل الإنجليز

### اللغة + الدولة (يستهدف دولة محددة)
- `ar-SA` — العرب في السعودية
- `ar-EG` — العرب في مصر
- `en-US` — الإنجليز في أمريكا
- `en-GB` — الإنجليز في بريطانيا

### x-default
صفحة fallback لو ما في تطابق للغة المستخدم:
- `x-default` → عادة النسخة الإنجليزية أو صفحة اختيار اللغة

---

## 3️⃣ تطبيق Modonty المقترح

### الحد الأدنى (لو Modonty تستهدف كل العرب)

```html
<link rel="alternate" hreflang="ar" href="https://modonty.com/ar/blog/seo-strategy" />
<link rel="alternate" hreflang="en" href="https://modonty.com/en/blog/seo-strategy" />
<link rel="alternate" hreflang="x-default" href="https://modonty.com/en/blog/seo-strategy" />
```

### استهداف دول محددة (Modonty تركز على السعودية ومصر)

```html
<link rel="alternate" hreflang="ar" href="https://modonty.com/ar/blog/seo-strategy" />
<link rel="alternate" hreflang="ar-SA" href="https://modonty.com/ar/blog/seo-strategy" />
<link rel="alternate" hreflang="ar-EG" href="https://modonty.com/ar/blog/seo-strategy" />
<link rel="alternate" hreflang="en" href="https://modonty.com/en/blog/seo-strategy" />
<link rel="alternate" hreflang="en-US" href="https://modonty.com/en/blog/seo-strategy" />
<link rel="alternate" hreflang="x-default" href="https://modonty.com/en/blog/seo-strategy" />
```

> **التوصية:** ابدأ بـ `ar`, `en`, `x-default`. لو لاحظت traffic كبير من دول محددة (SA, EG) فعّل `ar-SA`, `ar-EG`, `en-US`.

---

## 4️⃣ Storage في الـ DB

```typescript
// articleSEO.hreflangVariants — Json
type HreflangVariant = {
  lang: string;       // 'ar', 'en', 'ar-SA', 'x-default'
  url: string;        // absolute https
};

const hreflangVariants: HreflangVariant[] = [
  { lang: 'ar', url: 'https://modonty.com/ar/blog/seo-strategy' },
  { lang: 'en', url: 'https://modonty.com/en/blog/seo-strategy' },
  { lang: 'x-default', url: 'https://modonty.com/en/blog/seo-strategy' },
];
```

---

## 5️⃣ Compute Function

```typescript
// app/lib/seo/hreflang.ts
import type { Article } from '@prisma/client';

interface ArticleWithTranslations extends Article {
  translations: { locale: 'ar' | 'en'; slug: string }[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://modonty.com';

export function resolveHreflangVariants(
  article: ArticleWithTranslations
): { lang: string; url: string }[] {
  const variants: { lang: string; url: string }[] = [];

  // 1. self-referencing
  variants.push({
    lang: article.locale,
    url: `${BASE_URL}/${article.locale}/blog/${article.slug}`,
  });

  // 2. كل الترجمات الأخرى
  for (const t of article.translations) {
    if (t.locale === article.locale) continue;  // تخطي نفسه
    variants.push({
      lang: t.locale,
      url: `${BASE_URL}/${t.locale}/blog/${t.slug}`,
    });
  }

  // 3. x-default (دائماً الـ english لو موجودة، وإلا الـ self)
  const englishVariant = variants.find(v => v.lang === 'en');
  variants.push({
    lang: 'x-default',
    url: englishVariant?.url ?? variants[0].url,
  });

  // 4. validation
  for (const v of variants) {
    if (!v.url.startsWith('https://')) {
      throw new Error(`hreflang URL must be absolute https: ${v.url}`);
    }
  }

  return variants;
}
```

---

## 6️⃣ Render في Next.js

```typescript
// app/[locale]/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const article = await getArticleWithSEO(params.locale, params.slug);
  if (!article?.seo) return {};

  const variants = article.seo.hreflangVariants as { lang: string; url: string }[];

  // Next.js Metadata API
  return {
    alternates: {
      canonical: article.seo.canonical,
      languages: Object.fromEntries(
        variants.map(v => [v.lang, v.url])
      ),
    },
  };
}
```

Next.js يرندر الـ `languages` كـ `<link rel="alternate" hreflang="..." href="..." />` تلقائياً.

> **تنبيه:** Next.js Metadata API يدعم `languages` من v13.2+. تأكد إن النسخة محدّثة.

---

## 7️⃣ متى نعيد حساب hreflang

| الحدث | إعادة الحساب |
|------|-------------|
| إضافة ترجمة جديدة | recompute للمقالة + جميع الترجمات الموجودة |
| حذف ترجمة | recompute للباقي |
| تغيير slug لأي ترجمة | recompute لكل النسخ |

```typescript
// app/server/api/routers/articles.ts
articles.addTranslation: protectedProcedure
  .input(addTranslationInput)
  .mutation(async ({ input, ctx }) => {
    const newTranslation = await ctx.prisma.article.create({
      data: { ...input, translationGroupId: input.originalId },
    });

    // ❗ recompute SEO لكل المقالات في المجموعة
    const group = await ctx.prisma.article.findMany({
      where: { translationGroupId: input.originalId },
      select: { id: true },
    });

    await Promise.all(group.map(a => saveArticleSEO(a.id)));

    return newTranslation;
  });
```

---

## 8️⃣ x-default — متى وكيف

`x-default` تقول لـ Google: "لو ما لقيت تطابق دقيق للغة المستخدم، استخدم هذي."

### الاستخدام الصحيح
- صفحة اختيار اللغة (لو عندك واحدة)
- النسخة الإنجليزية (الأكثر شمولية)
- صفحة افتراضية بدون موضع جغرافي

### للـ Modonty
الـ english version تخدم كـ `x-default` لأنها الأكثر شمولية للجمهور العالمي.

---

## 9️⃣ الأخطاء الشائعة (Semrush + Ahrefs)

| الخطأ | السبب | الإصلاح |
|------|------|---------|
| Hreflang conflicts within page source code | hreflang يشير لـ URL، و canonical يشير لـ URL آخر | تأكد إن canonical يطابق `hreflang` لنفس اللغة |
| No self-referencing hreflang URLs | الصفحة ما تحتوي على hreflang لنفسها | أضف entry للـ current locale |
| Hreflang relative URLs | يستخدم `/ar/blog/...` بدل `https://...` | absolute URLs دائماً |
| Hreflang broken/redirected | URL يرجع 3xx/4xx | تحقق إن كل URL يرجع 200 |
| Hreflang values not in ISO format | استخدم `arabic` بدل `ar` | استخدم ISO 639-1 (ar, en) + ISO 3166-1 (SA, EG, US) |
| Missing reciprocal hreflang | صفحة A تشير لـ B، لكن B ما تشير لـ A | كل النسخ يجب أن تذكر بعضها |

---

## 🔟 Validation

### قبل النشر — حلقة التحقق

```typescript
// tests/seo/hreflang.test.ts
test('hreflang reciprocity', async () => {
  const articles = await prisma.article.findMany({
    where: { translationGroupId: 'group-1' },
    include: { seo: true },
  });

  for (const a of articles) {
    const variants = a.seo!.hreflangVariants as { lang: string; url: string }[];

    // 1. self-referencing موجود
    expect(variants).toContainEqual({
      lang: a.locale,
      url: `https://modonty.com/${a.locale}/blog/${a.slug}`,
    });

    // 2. كل ترجمة موجودة
    for (const other of articles) {
      if (other.id === a.id) continue;
      expect(variants).toContainEqual({
        lang: other.locale,
        url: `https://modonty.com/${other.locale}/blog/${other.slug}`,
      });
    }

    // 3. x-default موجود
    expect(variants.some(v => v.lang === 'x-default')).toBe(true);
  }
});
```

### بعد النشر — أدوات

- **Google Search Console** → International Targeting (deprecated 2022، لكن لسه يطلع تحذيرات في الـ Coverage report)
- **Merkle's Hreflang Tester** — https://technicalseo.com/tools/hreflang/
- **Aleyda Solis Hreflang Generator** — للتحقق من الصياغة قبل التطبيق

---

## 1️⃣1️⃣ مقابلة hreflang vs canonical

| الموقف | canonical | hreflang |
|--------|-----------|----------|
| النسخة العربية لمقالة | نفسها (self) | يربط بـ english + self |
| النسخة الإنجليزية لمقالة | نفسها (self) | يربط بـ arabic + self |
| صفحة مكررة بسبب UTM | الـ URL النظيف | لا تستخدم hreflang |

❗ **خطأ شائع:** canonical للنسخة العربية يشير للنسخة الإنجليزية. **خطأ.** كل نسخة canonical لـ self.

---

## 1️⃣2️⃣ Sitemap-level hreflang (موصى به)

بالإضافة لـ HTML `<link>`, يمكن أيضاً وضع hreflang في الـ sitemap:

```xml
<url>
  <loc>https://modonty.com/ar/blog/seo-strategy</loc>
  <xhtml:link rel="alternate" hreflang="ar" href="https://modonty.com/ar/blog/seo-strategy" />
  <xhtml:link rel="alternate" hreflang="en" href="https://modonty.com/en/blog/seo-strategy" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://modonty.com/en/blog/seo-strategy" />
</url>
```

Next.js sitemap.ts يدعم هذا عبر `alternates.languages`:

```typescript
return articles.map(article => ({
  url: `${BASE_URL}/${article.locale}/blog/${article.slug}`,
  lastModified: article.seo!.sitemapLastmod,
  alternates: {
    languages: Object.fromEntries(
      (article.seo!.hreflangVariants as any[]).map(v => [v.lang, v.url])
    ),
  },
}));
```

---

## 📚 المصادر الرسمية

- [Google — Tell Google about localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google — Managing multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Next.js — Metadata languages](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#languages)
- [Semrush — Hreflang Attribute 101](https://www.semrush.com/blog/hreflang-attribute-101/)
- [ISO 639-1 language codes](https://www.loc.gov/standards/iso639-2/php/code_list.php)
- [ISO 3166-1 country codes](https://www.iso.org/iso-3166-country-codes.html)
