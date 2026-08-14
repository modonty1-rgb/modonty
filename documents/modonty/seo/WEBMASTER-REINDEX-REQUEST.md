# طلب إعادة زحف — تحديث أيقونة الموقع (Favicon)

> **التاريخ:** 2026-06-03
> **النشر المرتبط:** commit `2956e31` — modonty v1.52.0 (Vercel: READY)
> **الموجَّه إليه:** الـ Webmaster (من عنده صلاحية Search Console / Bing WMT / Yandex WMT)

---

## السياق (ماذا تغيّر)
نشرنا **أيقونة موقع جديدة نظيفة** (الـ «m» المربّع) + ملفات البراند:
- `https://www.modonty.com/icon.svg` (SVG · `sizes="any"`)
- `https://www.modonty.com/favicon.ico` (‎16/32/48 — الصيغة اللي يفضّلها Bing)
- `https://www.modonty.com/apple-icon.png` (‎180×180 — iOS)

الثلاثة **حيّة وتُخدَم 200** على الإنتاج، والوسوم موجودة في `<head>` الصفحة الرئيسية.

## الوضع الحالي في المحركات (اختُبر 2026-06-03)
- **Google:** يعرض أيقونة «m» + روابط فرعية غنية (الأكثر رسوخاً).
- **Bing / Yandex / DuckDuckGo:** العنوان والوصف صحيحان، لكن **الأيقونة لسّه افتراضية (كرة أرضية)** — لأن المحرّك ما أعاد زحف الصفحة الرئيسية بعد نشر الأيقونة.

**السبب = توقيت إعادة الزحف فقط (مش خطأ إعداد).** التحقق التقني تمّ: `favicon.ico` بالجذر · Content-Type صحيح · robots.txt ما يحجب الأيقونة · مربّعة ‎1:1.

---

## المطلوب: اطلب إعادة زحف الصفحة الرئيسية في كل أداة

الأيقونة مرتبطة بالـ **hostname** (مصدرها الصفحة الرئيسية)، فإعادة زحف الرئيسية تكفي لكل الموقع.

**الرابط المستهدف:**
```
https://www.modonty.com/
```

### 1) Google Search Console
- URL Inspection → الصق `https://www.modonty.com/` → **Request Indexing**.

### 2) Bing Webmaster Tools
- URL Inspection → `https://www.modonty.com/` → **Request Indexing / Recrawl**.
- (اختياري) أعد إرسال الـ sitemap: `https://www.modonty.com/sitemap.xml`.

### 3) Yandex Webmaster
- Indexing → Recrawl pages → أضِف `https://www.modonty.com/` → **Send**.

### DuckDuckGo
- لا أداة مباشرة — يتبع فهرس Bing غالباً + cache أيقوناته الخاص. يتحدّث تلقائياً بعد تحديث Bing.

---

## المتوقّع والملاحظات
- التحديث **ليس لحظياً** — أيام إلى أسابيع، حسب جدول كل محرّك (حتى بعد طلب الزحف).
- **الوصف يعمل أصلاً** في كل المحركات — هذا الطلب لتسريع **الأيقونة** فقط. (جوجل أحياناً يعيد صياغة الوصف بنفسه؛ هذا طبيعي.)
- ⚠️ **لا تغيّر الـ favicon مرة ثانية** — المحركات تبغاه ثابتاً؛ التغيير المتكرّر يؤخّر الالتقاط.

المصادر الرسمية:
- Google Search Central — Favicon in Search: https://developers.google.com/search/docs/appearance/favicon-in-search
- Microsoft Q&A — favicon in Bing: https://learn.microsoft.com/en-us/answers/questions/800228/how-to-display-favicon-in-bing-search-engine
