# تثبيت `seo-senior-expert` Skill

## للتثبيت في Modonty (Cursor / VS Code)

### الخطوة 1: انسخ المجلد لمشروعك

```bash
# من مجلد المشروع (modonty repo)
mkdir -p .claude/skills
cp -r seo-senior-expert .claude/skills/

# أو لو كنت تستخدم مكان آخر للـ skills:
mkdir -p ~/.config/claude/skills
cp -r seo-senior-expert ~/.config/claude/skills/
```

### الخطوة 2: تحقق من البنية

```
.claude/skills/seo-senior-expert/
├── SKILL.md
├── INSTALL.md   ← هذا الملف
└── references/
    ├── arabic-rtl-seo.md
    ├── content-quality-checks.md
    ├── core-web-vitals.md
    ├── crawlability-indexability.md
    ├── external-audit-tools-mapping.md
    ├── hreflang-international-seo.md
    ├── images-seo.md
    ├── jsonld-article-schema.md
    ├── meta-tags-reference.md
    ├── modonty-cached-seo-architecture.md
    └── pre-publish-checklist.md
```

### الخطوة 3: فعّل المهارة

في Cursor، المهارة تتفعّل تلقائياً لما تتحدث في موضوع له علاقة بالـ SEO. لاختبارها:

```
Khalid: "راجع لي generateMetadata في app/[locale]/blog/[slug]/page.tsx"
Claude: [يقرأ SKILL.md أولاً، ثم references/meta-tags-reference.md، ثم يراجع الكود]
```

أو فعّل صراحة:

```
Khalid: "استخدم skill seo-senior-expert لمراجعة هذا الكود..."
```

---

## استخدام المهارة

### Triggers تلقائية

المهارة تتفعّل لما تذكر:
- "SEO", "ميتا تاج", "meta tag"
- "JSON-LD", "structured data", "schema"
- "canonical", "hreflang", "sitemap", "robots"
- "Open Graph", "OG", "Twitter card"
- "generateMetadata", "Article schema", "BreadcrumbList"
- "Core Web Vitals", "LCP", "INP", "CLS"
- "PageSpeed", "Lighthouse", "Rich Results"
- "audit", "فحص سيو", "ميتا داتا"

### Triggers في الكود

تتفعّل تلقائياً عند فتح/تعديل:
- `app/[locale]/blog/`, `app/article/`, `app/post/`
- `app/sitemap.ts`, `app/robots.ts`
- `prisma/schema.prisma` (للـ ArticleSEO model)
- أي ملف يحتوي على `generateMetadata`
- أي builder للـ JSON-LD

---

## بعد التثبيت — أول اختبار

ابدأ بأبسط سيناريو:

```
Khalid: "عندي مقالة منشورة وSemrush طلع لي تقرير فيه أخطاء.
كيف أراجع الكود قبل أنشر المقالة الجاية بحيث أتجنب نفس الأخطاء؟"

Claude المتوقع:
1. يقرأ SKILL.md (يفهم المعمارية)
2. يقرأ references/external-audit-tools-mapping.md
3. يقرأ references/pre-publish-checklist.md
4. يعطيك خطة فحص مبنية على معمارية cached-SEO
5. يقترح assertions وtests للـ regression
```

---

## ملاحظات

- المهارة مبنية على معمارية **cached-SEO** في Modonty (الـ SEO data محسوبة ومخزنة في الـ DB)
- لو غيّرت المعمارية في المستقبل، حدّث `references/modonty-cached-seo-architecture.md` خاصةً
- كل قاعدة في المهارة مربوطة بمصدر رسمي (Google, Schema.org, Semrush KB, Ahrefs Help)
- لو لاحظت قاعدة قديمة (مثلاً Google غيّر سياسته)، حدّث المصدر فوراً

---

## للتحديثات المستقبلية

عند تحديث المهارة:

1. غيّر `name` field في YAML frontmatter لو الـ scope تغيّر
2. حدّث الـ description لو في triggers جديدة
3. أضف references files جديدة في `references/` لو في موضوع جديد
4. ارفع version في commit message: `feat(skill): seo-senior-expert v1.1 — add llms.txt support`
