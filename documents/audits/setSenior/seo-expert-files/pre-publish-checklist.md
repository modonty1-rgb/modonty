# Pre-Publish Checklist (Hard Gate)

> القائمة الشاملة قبل أي merge/deploy لتغيير يخص SEO.
> هذا الـ checklist يجب أن يمر **كل بنوده** قبل النشر — صفر استثناءات.

---

## 🚦 كيف نستخدمها

1. عند أي PR/MR يلمس ملف SEO (Prisma schema, generateMetadata, JSON-LD builder, sitemap, robots) → نسخ القائمة في الـ PR description
2. كل بند يأخذ ☐ في البداية، يصير ✅ لما يـ pass
3. **لا merge** قبل ما الكل ✅
4. لو في بند ما ينطبق على الـ PR → علّمه N/A مع شرح

---

## القسم 1: Compute Layer (`computeArticleSEO`)

```
☐ الدالة ترمي SEOPrerequisiteError صريح لو أي حقل إلزامي مفقود
☐ assertions على:
  ☐ article.slug موجود وغير فاضي
  ☐ article.title موجود
  ☐ article.body موجود (≥ 300 word)
  ☐ article.coverImage URL مطلق https://
  ☐ article.publishedAt محدّد (للمقالات المنشورة)
  ☐ article.author.name + author.url موجودين
  ☐ article.category موجود
☐ metaTitle ≤ 60 حرف (truncate لو أطول)
☐ metaDescription بين 50 و 160 حرف
☐ canonical URL مطلق + يبدأ بـ https://
☐ ogImage = 1200×630 minimum، WebP/JPG (لا SVG)
☐ jsonLdArticle محسوب من builder type-safe
☐ jsonLdBreadcrumb positions متسلسلة 1, 2, 3, ...
☐ hreflangVariants فيها self-referencing
☐ contentHash يدخل فيه كل القيم اللي تأثر على SEO
☐ Zod schema يتحقق من الناتج قبل ما الدالة ترجّع
```

---

## القسم 2: Save Layer (`saveArticleSEO`)

```
☐ idempotency check موجود (skip لو contentHash نفسه)
☐ prisma.upsert (مش create فقط) — يدعم create + update
☐ بعد الـ upsert: revalidatePath لكل locales
☐ بعد الـ upsert: revalidateTag للـ cache invalidation
☐ معالجة أخطاء واضحة (try/catch + log)
☐ لا يفشل بصمت — لو فشل، يطلع للـ caller
```

---

## القسم 3: Read Layer (`generateMetadata`)

```
☐ يقرأ من articleSEO، لا يحسب شيء وقت الطلب
☐ لو seo ما موجود → notFound() (لا يرجع metadata غلط)
☐ مرّر القيم كما هي من الـ DB، بدون transform إضافي
☐ alternates.canonical موجود
☐ alternates.languages من hreflangVariants
☐ openGraph: type='article', locale=ar_SA/en_US
☐ openGraph.images فيه width + height + alt
☐ openGraph: publishedTime + modifiedTime (ISO 8601)
☐ twitter: card='summary_large_image'
☐ robots: متطابق مع seo.robots
```

---

## القسم 4: Render Layer (الصفحة)

```
☐ <JsonLd data={seo.jsonLdArticle} /> موجود
☐ <JsonLd data={seo.jsonLdBreadcrumb} /> موجود
☐ <html lang={locale} dir={locale==='ar'?'rtl':'ltr'}>
☐ <article> مغلف بالـ content (ليس <div>)
☐ <h1> واحد فقط
☐ headings مرتبة (لا قفزات h1→h3)
☐ <time dateTime={...}> للـ publishedAt و updatedAt
☐ كل <Image> له width + height + alt
☐ hero image: priority + fetchPriority="high"
☐ لا inline JSON-LD مكتوب يدوياً (كله من builder)
```

---

## القسم 5: robots.txt + sitemap.xml

```
☐ app/robots.ts يطلع 200 على /robots.txt
☐ Sitemap entries في robots.ts موجودة وصحيحة
☐ app/sitemap.ts يطلع 200 على /sitemap.xml
☐ كل URL في sitemap يرجع 200 (مش 3xx/4xx/5xx)
☐ كل URL في sitemap canonical (مش redirected)
☐ كل URL في sitemap https://
☐ lastModified, changeFrequency, priority محددين
☐ alternates.languages موجودة في sitemap للترجمات
☐ Sitemap < 50 MB و < 50,000 URLs (split لو أكبر)
```

---

## القسم 6: Internationalization

```
☐ hreflang values بـ ISO 639-1 + ISO 3166-1
☐ hreflang absolute URLs (https://)
☐ كل URL في hreflang يرجع 200
☐ self-referencing hreflang موجود
☐ reciprocal: كل النسخ تربط ببعض
☐ x-default موجود ويشير لـ english عادةً
☐ og:locale = ar_SA (مع underscore)
☐ hreflang = ar-SA (مع dash)
☐ JSON-LD inLanguage = ar-SA (مع dash)
```

---

## القسم 7: HTTPS & Security Headers

```
☐ Strict-Transport-Security header موجود
☐ X-Content-Type-Options: nosniff
☐ X-Frame-Options: SAMEORIGIN
☐ Referrer-Policy: strict-origin-when-cross-origin
☐ كل canonical URL https://
☐ كل JSON-LD URL https://
☐ كل OG image URL https://
☐ لا mixed content (تحقق في Network tab)
☐ Vercel/Cloudflare SSL valid + auto-renew
```

---

## القسم 8: Performance (Core Web Vitals)

```
☐ LCP < 2.5s محلياً (Lighthouse)
☐ INP < 200ms محلياً
☐ CLS < 0.1 محلياً
☐ Server Components افتراضياً، 'use client' بحذر
☐ ISR مفعّل (export const revalidate = X)
☐ Cloudinary URLs بـ f_auto + q_auto
☐ next/font للـ fonts (Cairo, Inter)
☐ Third-party scripts via next/script
☐ JS bundle لكل route < 50KB compressed
☐ HTML size < 2MB
```

---

## القسم 9: Validation (تشغيل فعلي)

### محلياً

```bash
☐ pnpm tsc --noEmit       (TypeScript يمر)
☐ pnpm lint               (ESLint يمر)
☐ pnpm test               (kel tests pass)
☐ pnpm build              (build ناجح)
☐ pnpm start ثم:
  ☐ curl localhost:3000/robots.txt → 200 + content صحيح
  ☐ curl localhost:3000/sitemap.xml → 200 + XML صحيح
  ☐ curl localhost:3000/ar/blog/SLUG → 200 + HTML فيه:
    ☐ <title>
    ☐ <meta name="description">
    ☐ <link rel="canonical">
    ☐ <meta property="og:title">
    ☐ <meta property="og:image">
    ☐ <link rel="alternate" hreflang="ar">
    ☐ <link rel="alternate" hreflang="en">
    ☐ <link rel="alternate" hreflang="x-default">
    ☐ <script type="application/ld+json"> (Article + BreadcrumbList)
☐ npx lighthouse localhost:3000/ar/blog/SLUG → SEO score = 100
```

### Smoke tests خارجية (للـ PRs المهمة)

```
☐ Rich Results Test: https://search.google.com/test/rich-results
  → Article + Breadcrumb valid
☐ Schema Validator: https://validator.schema.org/
  → No errors
☐ Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
  → OG preview صحيح
☐ Twitter Card Validator (opengraph.xyz): https://www.opengraph.xyz/
  → Twitter Card preview صحيح
☐ Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
  → Passes
☐ Mozilla Observatory: https://observatory.mozilla.org/
  → Grade ≥ A
```

---

## القسم 10: External Audit Tools (للـ PRs الكبيرة)

بعد deploy لـ staging:

```
☐ Semrush Site Audit على الـ staging URL → no new Errors
☐ Ahrefs Site Audit على الـ staging URL → no new Errors
☐ Google Search Console URL Inspection
  ☐ URL is on Google? (لو مفهرسة سابقاً)
  ☐ Mobile usability: passed
  ☐ Page experience: good
☐ PageSpeed Insights (mobile + desktop)
  ☐ Performance ≥ 80
  ☐ SEO = 100
  ☐ CWV = passing
```

---

## القسم 11: Regression Prevention

```
☐ كتبت test يفشل قبل التعديل و يـ pass بعده
☐ التعديل لم يكسر مقالات موجودة (sample 5-10 مقالات قديمة وفحصتها)
☐ Database migration safe (لو في Prisma migration)
☐ Backward compatible (لو الـ computeVersion ارتفع، background job محضّر)
☐ Rollback plan موجود لو الـ deploy فشل
```

---

## القسم 12: Documentation

```
☐ CLAUDE.md (لو موجود) محدّث لو التغيير غير القواعد
☐ Cursor rules محدّثة لو في pattern جديد
☐ README للـ feature موجود
☐ صور before/after في الـ PR description لو UI changes
☐ Link لـ Rich Results Test results في الـ PR
```

---

## 🎯 Final Sign-off

```
☐ كل البنود فوق ✅
☐ Senior reviewer وقّع على الـ PR
☐ Staging environment يعكس التعديل ويـ pass
☐ Deploy plan واضح (مع rollback)
☐ Monitoring مفعّل لمراقبة post-deploy
```

---

## ⏱️ متى نـ skip بنود من الـ checklist؟

**أبداً لا.** كل بند موجود لسبب — لو ما ينطبق، علّمه N/A مع شرح:

```markdown
☑ Sitemap entries — N/A (هذا PR ما يلمس sitemap)
☑ Smoke tests خارجية — N/A (تغيير في internal helper فقط، ما يلمس HTML الناتج)
```

> **القاعدة:** "N/A" تتطلب شرح. "skip" أبداً ما هو خيار.

---

## 📋 Template للـ PR description

```markdown
## SEO Pre-Publish Checklist

### Compute Layer
- [ ] assertions على كل الحقول الإلزامية
- [ ] metaTitle ≤ 60 char
- [ ] metaDescription 50-160 char
- ... (انسخ القائمة كاملة)

### Validation
- [x] pnpm tsc --noEmit
- [x] pnpm test
- [x] Rich Results Test: [screenshot]
- [x] Schema Validator: [screenshot]

### Performance
- [x] Lighthouse SEO = 100
- [x] CWV passing (LCP: 1.8s, INP: 120ms, CLS: 0.05)

### Notes
[أي ملاحظات أو exceptions]
```

---

## 📚 المصادر الرسمية

- [Google — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google — Search Console URL Inspection](https://support.google.com/webmasters/answer/9012289)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Validator](https://validator.schema.org/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Semrush Site Audit](https://www.semrush.com/siteaudit/)
- [Ahrefs Site Audit](https://ahrefs.com/site-audit)
