# Content Quality Checks

> فحوصات المحتوى الـ on-page: headings hierarchy, word count, semantic HTML, AI-search readiness.

---

## 🎯 المبدأ

محتوى Modonty يجب أن:
1. يكون hierarchy صحيح (h1 → h2 → h3)
2. ≥ 300 كلمة (Semrush threshold)
3. يستخدم semantic HTML
4. يكون فريد (لا duplicate content)
5. يجاهز للـ AI Search (SearchGPT, Perplexity, Claude)

---

## 1️⃣ Headings Hierarchy

### القواعد الإلزامية

| القاعدة | السبب |
|---------|------|
| **`<h1>` واحد فقط** لكل صفحة | Semrush Notice — multiple h1 يربك Google |
| `<h1>` يصف الصفحة كاملة | UX + SEO |
| لا تقفز: h1 → h2 → h3 → h4 | accessibility (screen readers) |
| لا تستخدم `<h*>` لـ styling | استخدم CSS بدلاً |

### الترتيب الصحيح

```tsx
<article>
  <h1>كيف تبني استراتيجية SEO عربية ناجحة في 2026</h1>

  <p>المقدمة...</p>

  <h2>الخطوة الأولى: تحليل الكلمات المفتاحية</h2>
  <p>...</p>

  <h3>أدوات تحليل KW المجانية</h3>
  <p>...</p>

  <h3>أدوات تحليل KW المدفوعة</h3>
  <p>...</p>

  <h2>الخطوة الثانية: بناء المحتوى</h2>      {/* ← h2، ليس h4 */}
  <p>...</p>

  <h2>الخلاصة</h2>
  <p>...</p>
</article>
```

### الأخطاء الشائعة

```tsx
// ❌ تعدد h1
<h1>عنوان المقالة</h1>
<h1>قسم 1</h1>          // ← لازم h2
<h1>قسم 2</h1>

// ❌ قفزة hierarchy
<h1>عنوان</h1>
<h4>تفصيلة</h4>          // ← لازم h2

// ❌ heading للـ styling
<h3 style={{ fontSize: '14px' }}>نص صغير</h3>   // ← استخدم <p> + CSS

// ✅ صح
<h1>عنوان المقالة</h1>
<h2>قسم 1</h2>
<h3>تفصيلة</h3>
<h2>قسم 2</h2>
```

---

## 2️⃣ Word Count

### Semrush thresholds

| الصفحة | الحد الأدنى |
|--------|-------------|
| Article منشورة | **300 كلمة** (أقل = "thin content" warning) |
| Article للـ Tier 1 keywords | **1,000-1,500 كلمة** |
| Comprehensive guide | **2,000-3,000+ كلمة** |
| Landing page | حسب الغرض (لا يوجد حد أدنى) |

### الكشف في الكود

```typescript
// app/lib/text/word-count.ts
export function countArabicWords(text: string): number {
  // strip HTML
  const stripped = text.replace(/<[^>]*>/g, '');

  // العد للعربية: split على whitespace
  return stripped.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// validation عند create/update
const wordCount = countArabicWords(article.body);
if (article.publishedAt && wordCount < 300) {
  throw new ValidationError('Article body must be at least 300 words to publish');
}
```

### في الـ admin form

```tsx
// app/admin/articles/[id]/page.tsx
const wordCount = useMemo(() => countArabicWords(body), [body]);

<div className="text-sm">
  <span className={wordCount < 300 ? 'text-red-500' : 'text-green-500'}>
    {wordCount} كلمة
  </span>
  {wordCount < 300 && <span> — لا يمكن النشر إلا بعد 300 كلمة</span>}
</div>
```

### تخزينه في الـ DB

```typescript
// articleSEO.computeArticleSEO
return {
  // ...
  wordCount: countArabicWords(article.body),  // يدخل في JSON-LD
};
```

---

## 3️⃣ Semantic HTML

### المبدأ
Google + AI tools يفضلون semantic HTML. كل عنصر له معنى = أسهل للفهم.

### Modonty template للمقالة

```tsx
<article itemScope itemType="https://schema.org/BlogPosting">
  <header>
    <h1 itemProp="headline">{article.title}</h1>

    <div className="meta">
      <span itemProp="author" itemScope itemType="https://schema.org/Person">
        <a href={authorUrl} itemProp="url">
          <span itemProp="name">{article.author.name}</span>
        </a>
      </span>

      <time
        itemProp="datePublished"
        dateTime={article.publishedAt.toISOString()}
      >
        {formatDate(article.publishedAt, locale)}
      </time>

      {article.publishedAt.getTime() !== article.updatedAt.getTime() && (
        <time
          itemProp="dateModified"
          dateTime={article.updatedAt.toISOString()}
        >
          محدّث: {formatDate(article.updatedAt, locale)}
        </time>
      )}
    </div>
  </header>

  <figure>
    <Image
      src={article.coverImage}
      alt={article.coverAlt}
      width={1200}
      height={630}
      priority
      itemProp="image"
    />
    {article.coverCaption && (
      <figcaption>{article.coverCaption}</figcaption>
    )}
  </figure>

  <div itemProp="articleBody">
    {/* render markdown to HTML */}
    <MdxContent source={article.body} />
  </div>

  <footer>
    <nav aria-label="Article tags">
      <ul>
        {article.tags.map(tag => (
          <li key={tag.id}>
            <a href={tagUrl(tag.slug, locale)} itemProp="keywords">
              {tag.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </footer>
</article>
```

### العناصر الـ semantic الأساسية

| Element | الاستخدام |
|---------|-----------|
| `<article>` | المقالة الكاملة (مستقلة بذاتها) |
| `<header>` | الـ header (title + meta) |
| `<main>` | المحتوى الرئيسي للصفحة |
| `<nav>` | navigation links |
| `<aside>` | side content (sidebar) |
| `<section>` | قسم بعنوان heading |
| `<footer>` | tags, citations, related |
| `<time datetime="...">` | تاريخ (مهم للـ AI tools) |
| `<figure>` + `<figcaption>` | صورة مع caption |
| `<blockquote cite="...">` | اقتباس |

### ❌ Anti-patterns

```tsx
// ❌ كل شي divs
<div className="article">
  <div className="title">...</div>
  <div className="content">...</div>
</div>

// ❌ <span> لـ time
<span>2026-05-22</span>

// ✅ semantic
<article>
  <header><h1>...</h1></header>
  <time dateTime="2026-05-22">22 مايو 2026</time>
</article>
```

---

## 4️⃣ Keyword Density — لا تبالغ

### القاعدة
- Keyword density معقول: **1-3%** من إجمالي الكلمات
- > 5% = keyword stuffing = Google penalty
- التركيز على **search intent**، ليس عدد التكرارات

### الكشف

```typescript
export function calculateKeywordDensity(
  text: string,
  keyword: string
): number {
  const totalWords = countArabicWords(text);
  const keywordWords = countArabicWords(keyword);

  const stripped = text.replace(/<[^>]*>/g, '').toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // عد المرات
  const matches = stripped.split(keywordLower).length - 1;

  return (matches * keywordWords / totalWords) * 100;
}

// warning في الـ admin form
const density = calculateKeywordDensity(article.body, article.primaryKeyword);
if (density > 5) {
  // ⚠️ keyword stuffing risk
}
```

---

## 5️⃣ Duplicate Content

### Semrush threshold
**≥ 85% similarity** = duplicate content error.

### كيف نمنعه

| المصدر | الإصلاح |
|--------|---------|
| نفس المقالة بـ URLs متعددة | canonical يشير للأصلية |
| نسخ ar/en بنفس المحتوى الحرفي | تأكد إن كل ترجمة بمحتوى عربي/إنجليزي مكتوب بشكل منفصل |
| محتوى منسوخ من موقع آخر | لا تنسخ — اكتب أصلي + اقتبس بـ `<blockquote cite>` |
| Tags pages بنفس قائمة المقالات | unique intro + sort مختلف |
| Category pages بنفس المحتوى | unique description لكل category |

### Internal duplicate check (cron)

```typescript
// app/jobs/check-duplicate-content.ts
import { createHash } from 'crypto';

export async function detectDuplicateContent() {
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, body: true },
    where: { publishedAt: { not: null } },
  });

  // shingle hash (4-word windows)
  const shingleMap = new Map<string, string[]>();

  for (const a of articles) {
    const shingles = makeShingles(a.body, 4);
    for (const s of shingles) {
      const hash = createHash('sha256').update(s).digest('hex').substring(0, 16);
      const list = shingleMap.get(hash) ?? [];
      list.push(a.id);
      shingleMap.set(hash, list);
    }
  }

  // articles that share > 85% shingles
  // ... (تطبيق MinHash للـ scale)
}
```

---

## 6️⃣ AI Search Readiness

### الأدوات اللي تستهدفها Modonty
- **Google AI Overviews** (SGE)
- **SearchGPT** (OpenAI)
- **Perplexity**
- **Claude search**
- **You.com**

### المتطلبات الإضافية للـ AI tools

| المتطلب | الإصلاح |
|---------|---------|
| **Last-Modified header** | يعكس آخر تحديث للمقالة فعلياً |
| **Semantic HTML** | `<article>`, `<time>`, `<figure>` بدل `<div>` |
| **Strong structured data** | Article + Breadcrumb + Organization + Author |
| **E-E-A-T signals** | author bio + credentials + publication date + sources |
| **Citation-ready paragraphs** | كل فقرة قائمة بذاتها (AI tools تقتبس فقرات) |
| **TL;DR في البداية** | الـ AI tools تقتبس summary |
| **بنية مستقرة (لا تغير URLs)** | لو غيرت slug، اعمل 301 redirect دائم |

### Last-Modified header

```typescript
// app/[locale]/blog/[slug]/route.ts (إذا تستخدم route handlers)
export async function GET(req, { params }) {
  const article = await getArticleWithSEO(params.locale, params.slug);
  if (!article) return new Response('Not Found', { status: 404 });

  const response = await renderArticle(article);

  response.headers.set(
    'Last-Modified',
    article.updatedAt.toUTCString()
  );
  response.headers.set('Cache-Control', 'public, s-maxage=3600');

  return response;
}
```

أو في page-level metadata:

```typescript
// generateMetadata
return {
  other: {
    'last-modified': article.updatedAt.toUTCString(),
  },
};
```

### TL;DR pattern

```tsx
<article>
  <h1>{article.title}</h1>

  {/* TL;DR — مفيد جداً للـ AI tools */}
  <aside aria-label="ملخص سريع" className="tldr">
    <h2>الخلاصة في 3 نقاط:</h2>
    <ul>
      <li>{article.tldr[0]}</li>
      <li>{article.tldr[1]}</li>
      <li>{article.tldr[2]}</li>
    </ul>
  </aside>

  <p>المقدمة...</p>
  {/* ... rest of content */}
</article>
```

---

## 7️⃣ E-E-A-T Signals

Google's quality framework: **Experience, Expertise, Authoritativeness, Trustworthiness**.

### كيف نظهرها في الكود

| Signal | الـ implementation |
|--------|-------------------|
| **Expertise** | Author bio + credentials + photo |
| **Experience** | مقالات سابقة لنفس الكاتب + count |
| **Authoritativeness** | About Us page + Editor info + Contact |
| **Trustworthiness** | datePublished + dateModified + sources + HTTPS + privacy policy |

### Author bio pattern

```tsx
<aside itemScope itemType="https://schema.org/Person">
  <Image
    src={author.photo}
    alt={author.name}
    width={80}
    height={80}
    itemProp="image"
  />
  <div>
    <h3>
      <a href={authorUrl} itemProp="url">
        <span itemProp="name">{author.name}</span>
      </a>
    </h3>
    <p itemProp="description">{author.bio}</p>
    <p>
      <span itemProp="jobTitle">{author.title}</span> — كتب
      <span> {author.articleCount} مقالة في Modonty</span>
    </p>
    {author.socialLinks.map(link => (
      <a key={link.platform} href={link.url} itemProp="sameAs">
        {link.platform}
      </a>
    ))}
  </div>
</aside>
```

---

## 8️⃣ Internal Linking Strategy

### القواعد للمحتوى

| القاعدة | السبب |
|---------|------|
| 3-5 internal links على الأقل لكل مقالة | يساعد crawling + UX |
| anchor text descriptive | "اقرأ دليل SEO عربي" بدل "اقرأ هنا" |
| ربط لمقالات ذات صلة (semantic) | يبني topical authority |
| ربط لـ category و author pages | structure |
| **لا تربط لـ noindex pages** | يضيع PageRank |

### Auto-related links

```typescript
// app/lib/related-articles.ts
export async function getRelatedArticles(
  articleId: string,
  locale: string,
  limit = 5
) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { categoryId: true, tagIds: true },
  });

  if (!article) return [];

  return prisma.article.findMany({
    where: {
      id: { not: articleId },
      locale,
      publishedAt: { not: null },
      OR: [
        { categoryId: article.categoryId },
        { tagIds: { hasSome: article.tagIds } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: { id: true, slug: true, title: true, coverImage: true },
  });
}
```

---

## 9️⃣ Checklist للمحتوى

```
☐ <h1> واحد فقط، يصف الصفحة
☐ headings مرتبة بدون قفزات (h1 → h2 → h3)
☐ word count ≥ 300 (أو أكثر حسب نوع المقالة)
☐ semantic HTML: <article>, <header>, <main>, <footer>, <time>
☐ author bio + photo + URL
☐ datePublished + dateModified visible (مش JSON-LD فقط)
☐ TL;DR في البداية (موصى به للـ AI search)
☐ 3-5 internal links على الأقل
☐ keyword density 1-3% (لا stuffing)
☐ لا duplicate content مع مقالات أخرى في Modonty
☐ Last-Modified header يعكس updatedAt الفعلي
☐ structured data (Article + BreadcrumbList) موجودة
```

---

## 📚 المصادر الرسمية

- [Google — Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google — Search Quality Rater Guidelines (E-E-A-T)](https://developers.google.com/search/docs/appearance/search-quality-rater-guidelines)
- [Google — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [W3C — HTML5 Semantic Elements](https://www.w3.org/wiki/HTML/Elements)
- [Semrush — Content audit](https://www.semrush.com/blog/content-audit/)
