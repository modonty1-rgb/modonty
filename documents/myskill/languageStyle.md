---
name: arabic-pure-prose
version: 1.1.0
description: For Arabic-language conversations and content, keep Arabic prose in pure Arabic script using a three-tier model — (1) established Arabic translations for widespread terms, (2) phonetic transliteration in Arabic letters for technical jargon, (3) product/library names in Latin script grouped in end-of-paragraph bullet lists. This solves the reading difficulty caused by RTL/LTR direction-switching in mixed Arabic-English text while avoiding awkward forced translations. Apply whenever generating Arabic responses, documentation, articles, or any content for an Arabic-reading audience.
license: MIT
compatibility: claude-code opencode claude-ai cursor api
allowed-tools: Read, Write, Edit
author: Created for Eng. Khalid Ali (Modonty / DreamToApp)
---

# Arabic Pure Prose: Bilingual Text Separation Rule

You are writing for an Arabic-reading audience who experiences genuine reading difficulty when Arabic and English words alternate inside the same sentence. The direction-switching between right-to-left and left-to-right disrupts visual flow and breaks comprehension. This skill enforces strict separation between the two languages while preserving technical accuracy.

## The Core Problem

Mixed bilingual text like this is hard to read:

> نستخدم Google Search Console API لجلب الـ impressions و الـ clicks من الـ dashboard

The eye must switch direction five times in one sentence. By the time the reader finishes, the meaning is lost in the visual jumping. Even readers fluent in both languages struggle with sustained mixed text.

## The Three-Tier Model (v1.1 — updated 2026-05-20)

The original rule of "100% pure Arabic translation" produced awkward dictionary-style renderings for highly technical terms (e.g., "خط الإنتاج" for *pipeline*, "تيار البيانات البطيئة" for *Suspense boundaries*). Real Saudi/Gulf developers don't talk that way. The refined rule keeps the **direction-consistency principle** (everything in Arabic script, no RTL/LTR mid-line jumps) while replacing forced translations with **phonetic transliteration** for technical jargon.

### Rule 1: Arabic prose stays in pure Arabic script

No Latin-script characters inside Arabic sentences — but "Arabic script" includes BOTH Arabic translation AND phonetic Arabic transliteration. The eye stays RTL throughout.

### Rule 2: Choose the right tier per term

**🥇 Tier 1 — Established Arabic translations** (use as-is):

Terms with widespread, natural Arabic equivalents already used in the Gulf/Saudi tech community.

- "dashboard" → "لوحة التحكم"
- "ranking" → "الترتيب"
- "impressions" → "الظهور" · "clicks" → "النقرات"
- "deploy" → "النشر" (also fine: "ديبلوي" in dev-heavy contexts)
- "validate" → "التحقّق" · "sync" → "المزامنة"
- "cache" → "الكاش" · "browser" → "المتصفح"
- "UI" → "واجهة المستخدم" · "UX" → "تجربة المستخدم"
- "SEO" → "تحسين محركات البحث" · "search" → "البحث"
- "model" → "النموذج" · "field" → "الحقل"
- "database" → "قاعدة البيانات" · "index" → "الفهرس"
- "path/route" → "المسار" · "tag" → "الوسم"
- "session" → "الجلسة" · "permission" → "الصلاحية"
- "referral" → "الإحالة" · "discount" → "الخصم" · "bonus" → "المكافأة"

**🥈 Tier 2 — Phonetic transliteration** (Arabic letters):

Terms where forced Arabic translation feels awkward, dictionary-style, or unclear. Transliterate so the eye stays RTL but the reader still recognizes the technical concept.

- "Server Component" → "سيرفر كومبونت" · "Client Component" → "كلاينت كومبونت"
- "bundle" → "باندل" · "build" → "بيلد"
- "pipeline" → "بايبلاين" · "endpoint" → "إندبوينت"
- "schema" → "سكيما" · "hook" → "هوك"
- "middleware" → "مِدلوير" · "render" → "رِندَر"
- "Suspense" → "سَسبنس" · "dynamic import" → "داينمك إمبورت"
- "fetch" → "فيتش" · "mutation" → "ميوتيشن"
- "hash" → "هاش" · "token" → "توكن"
- "refactor" → "رِفاكتور" · "hydration" → "هايدريشن"
- "TypeScript" → "تايب سكربت" · "JavaScript" → "جافاسكربت"

**🥉 Tier 3 — Product / library / framework names** (Latin script, in end-of-paragraph list ONLY):

Never inline in Arabic prose. Always grouped at the end.

- Next.js · Prisma · tRPC · Tailwind · Vercel · React · Zod · MongoDB · GitHub · shadcn/ui · Cloudinary · GA4 · GSC

### Rule 3: End-of-paragraph English terms list

After the Arabic paragraph, place a bulleted list containing:

- All Tier 3 product names referenced
- Optionally, the original English of any Tier 2 transliterations (for searchability/precision)

```
[Arabic paragraph — mix of Tier 1 translations + Tier 2 transliterations]

المصطلحات الإنجليزية:
- Product Name 1
- Product Name 2
- (optional) Server Components / Client Components
```

### Decision rule when both Tier 1 and Tier 2 are possible

- If the Arabic translation is **widespread and natural** in Gulf/Saudi tech speech → **Tier 1**
- If it sounds **forced, dictionary-style, or unclear** → **Tier 2** (transliterate)
- Product/library/framework name → always **Tier 3**

Consistency matters: pick the tier once per document and stick with it for the same concept.

## Examples

### Example 1: Tools and APIs

**Before (mixed, hard to read):**

> لازم نستخدم Google Search Console API و نسحب الـ impressions و الـ clicks. بعدها نحلل الـ data ونحط النتائج في الـ dashboard.

**After (clean, applies the rule):**

> لازم نستخدم واجهة جوجل لتحليل أداء البحث و نسحب بيانات الظهور و النقرات. بعدها نحلل البيانات و نعرض النتائج في لوحة التحكم.
>
> المصطلحات الإنجليزية:
>
> - Google Search Console API
> - impressions
> - clicks
> - dashboard

### Example 2: Development workflow (three-tier model in action)

**Before:**

> الـ deployment فشل لأن الـ build كسر بسبب الـ TypeScript errors في الـ Server Components

**After (three-tier — recommended):**

> النشر فشل لأن البيلد كسر بسبب أخطاء تايب سكربت في السيرفر كومبونتس.
>
> المصطلحات الإنجليزية:
>
> - deploy · build · TypeScript · Server Components

Notice the mix: "النشر" stays Tier 1 (widespread translation), but "بيلد"، "تايب سكربت"، "سيرفر كومبونتس" go Tier 2 (transliteration) because forced Arabic translations would feel awkward.

### Example 3: SEO concepts (Tier 1 dominant)

**Before:**

> نريد نحسن الـ ranking عن طريق تحسين الـ schema markup و الـ internal linking

**After (three-tier):**

> نبغى نحسّن الترتيب عبر تحسين السكيما والروابط الداخلية.
>
> المصطلحات الإنجليزية:
>
> - ranking · schema markup · internal linking

"الترتيب" and "الروابط الداخلية" are Tier 1 (natural Arabic). "السكيما" is Tier 2 (transliteration — "المخططات المهيكلة" sounds dictionary-ish).

### Example 4: Headers and titles

**Before:**

> ## استخدام Next.js مع tRPC

**After:**

> ## بناء الواجهة باستخدام إطار العمل الحديث
>
> (و في القسم: المصطلحات الإنجليزية: Next.js, tRPC)

For headers, prefer descriptive Arabic. Product names (Tier 3) stay in the section's end-of-paragraph list, never in the header itself.

### Example 5: Full developer paragraph (mixed tiers)

**Before:**

> الـ Server Component يجلب الـ data من الـ database عبر Prisma، و الـ Client Component يعرضها مع Suspense boundaries

**After (three-tier):**

> السيرفر كومبونت يجلب البيانات من قاعدة البيانات عبر طبقة الوصول، والكلاينت كومبونت يعرضها مع سَسبنس باوندريز.
>
> المصطلحات الإنجليزية:
>
> - Server Component / Client Component · Suspense boundaries
> - Prisma

Mix of Tier 1 ("البيانات"، "قاعدة البيانات") + Tier 2 ("السيرفر كومبونت"، "الكلاينت كومبونت"، "سَسبنس باوندريز") + Tier 3 (Prisma in the list).

## Edge Cases and Exceptions

### Code blocks: leave English untouched

Inside fenced code blocks (` ``` `), all code stays in English. The visual separation of the code block container already signals to the reader to switch context.

```typescript
const result = await api.fetch();
```

Same applies to inline `code` references when referring to actual code identifiers (a function name, a variable, a CSS class). These are code, not prose.

### URLs and file paths: in code formatting or in lists

URLs go in code formatting or in the English terms list. Never inline in Arabic prose:

**Wrong:**

> اذهب إلى https://example.com لإكمال التسجيل

**Right:**

> اذهب إلى الرابط أدناه لإكمال التسجيل: `https://example.com`

Or:

> اذهب إلى الموقع الرسمي لإكمال التسجيل.
>
> الرابط: https://example.com

### Numbers, dates, percentages: Arabic numerals preferred

Use Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) or Western Arabic numerals (0123456789) consistently. Don't mix. For technical contexts where Western numerals are clearer (version numbers, error codes, IDs), use Western and keep them inline as they are mathematical, not English-prose.

Acceptable: `النسخة 4.2 تدعم هذي الميزة`
Also acceptable: `النسخة ٤.٢ تدعم هذي الميزة`

### Product version strings: in lists

Things like "Next.js 15", "Claude Sonnet 4.6", "Node.js 22" — these are product names. Refer to them descriptively in prose, list them at the end.

### Acronyms (SEO, UI, UX, API, HTML, CSS): in lists

These are pronounceable English acronyms. They count as English. Refer to them descriptively in prose:

- SEO → "تحسين محركات البحث" or "السيو" (if user prefers transliteration)
- UI → "واجهة المستخدم"
- UX → "تجربة المستخدم"
- API → "واجهة برمجية"
- HTML → "لغة ترميز الصفحات"
- CSS → "أوراق الأنماط"

If the audience expects transliterated forms like "سيو" or "إيه بي آي", those are Arabic-script words and acceptable inline.

### Quotations from English sources

When quoting from an English source, wrap the quote in code formatting or a blockquote, and provide an Arabic paraphrase in the prose:

> الباحث ذكر أن الأنماط الجديدة لا تختلف جوهرياً عن السابقة.
>
> النص الأصلي:
> > "The new patterns do not differ substantially from the prior ones."

### Mathematical and scientific notation

Equations, formulas, and mathematical symbols remain in their universal notation. They are not English prose:

> معادلة السلطة الموضوعية: `Topical Authority = Topical Coverage + Historical Data`

The formula stays in code formatting; the explanation around it is pure Arabic.

### User mixed languages first

If the user writes mixed Arabic-English to you, your response still applies the rule. The rule governs YOUR output, not theirs. Don't mirror their mixing.

### Brief inline product names in casual context

In very brief, casual conversations, requiring full Arabic descriptive replacement can feel pedantic. Example:

> User: "تشتغل على Modonty الحين؟"  
> Acceptable response: "إي، أكمل في المرحلة الأولى."

Modonty here is a proper name of the user's own product, used casually, with no technical density. Forcing "نعم، أكمل في منصة مدونتي" is fine but optional. Use judgment based on tone and density.

### Pure English conversations

If the entire conversation switches to English, this skill stops applying. Apply when generating Arabic content for Arabic readers.

## Quality Checklist (Apply Before Sending)

Before sending an Arabic response, scan it with these checks:

1. Are there any Latin-script characters inside Arabic paragraphs?
2. If yes: can they be moved to an "المصطلحات الإنجليزية" list at the end of the paragraph?
3. Did I use clear Arabic descriptive phrases for the technical concepts?
4. Are URLs in code formatting or in lists, not inline?
5. Are product/library names listed at the end of relevant sections?
6. Do code blocks contain English code (correct) and not Arabic prose?
7. Are headers in pure Arabic where possible?

If any check fails, revise before sending.

## Common Mistakes to Avoid

### Mistake 1: Half-applying the rule

> ✗ نستخدم واجهة Google لتحليل البحث

The Arabic equivalent was used but the product name still appears inline. Either fully replace ("نستخدم واجهة جوجل لتحليل البحث") or move to list.

### Mistake 2: Translating everything literally

Forcing literal Arabic for every English term sometimes produces awkward results. "Pipeline" doesn't always need to be "خط أنابيب". "منظومة المعالجة" or "خط الإنتاج" reads more naturally depending on context. Choose the equivalent that reads naturally, not the dictionary translation.

### Mistake 3: Long English lists for short paragraphs

If a paragraph references one English term, a single-item list at the end can feel excessive. In that case, parenthetical reference at the end works: "...نستخدم لوحة التحكم (Dashboard)." This is a soft exception for single-item cases.

### Mistake 4: Inconsistency across paragraphs

If you established that "ranking" maps to "الترتيب" in paragraph one, keep that mapping in paragraph two. Don't switch to "التصنيف" arbitrarily. Internal consistency aids reader comprehension.

### Mistake 5: Forgetting the rule applies to headers too

Headers carry as much reading load as body text. Apply the rule to H1, H2, H3, list items, and table cells, not just to paragraphs.

### Mistake 6: Putting English term in prose AND in list

Redundant. Once it's in the list at the end, don't also leave it in the prose. Pick one place. The prose should be Arabic; the list should hold the English.

## Workflow Application

When applying this skill in any agentic workflow (Cursor, Claude Code, API integration):

1. Detect language of the conversation. If Arabic, activate this skill.
2. Generate response draft.
3. Apply the Quality Checklist as a post-generation pass.
4. If any check fails, regenerate the affected paragraphs.
5. Send only after all checks pass.

For batch document generation (articles, reports, documentation), apply the same checklist per paragraph and finalize the document only after all paragraphs pass.

## Why This Skill Exists

The user (Eng. Khalid Ali, founder of Modonty) experiences sustained reading difficulty with mixed Arabic-English text. This is a real accessibility constraint, not a stylistic preference. Direction-switching between Arabic (RTL) and English (LTR) in the same line forces the eye to make repeated visual jumps that disrupt parsing, slow reading speed, and reduce comprehension.

This effect is well-documented in bidirectional text research and affects most Arabic-script readers to varying degrees. By keeping prose pure and isolating English in vertical lists (which preserve consistent direction within each list item), reading flow is restored.

This skill is a non-negotiable rule in conversations with this user. Apply it consistently across all Arabic outputs, including chat replies, generated documents, code comments, commit messages (when Arabic), and any other text destined for an Arabic-reading audience.

## Installation

To install this skill in an environment that supports Anthropic skills:

1. Create a folder: `<skills-directory>/arabic-pure-prose/`
2. Save this file as `SKILL.md` inside that folder
3. The skill becomes available automatically

For Claude.ai web interface, this skill is enforced via persistent memory (a memory entry mirrors the core rule).

For Cursor IDE, place in the skills directory or reference in `.cursor/rules/`.

For Claude API integrations, include the rule text in the system prompt when generating Arabic content.

## Version History

- **1.1.0** (2026-05-20): Replaced single "100% Arabic translation" rule with three-tier model (translation · transliteration · product names). Reason: forced translations like "خط الإنتاج" for *pipeline* or "تيار البيانات البطيئة" for *Suspense boundaries* felt unnatural and dictionary-style. Transliteration (e.g., "سيرفر كومبونت") preserves the direction-consistency principle while keeping technical terms recognizable to working developers.
- **1.0.0** (May 2026): Initial release based on direct user feedback and applied rule across multiple conversations.

---

**End of Skill**
