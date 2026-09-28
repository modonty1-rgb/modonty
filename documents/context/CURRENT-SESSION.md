# الجلسة الحاليّة

**٢٨ سبتمبر ٢٠٢٦ — صفحات القطاعات: ٥ حيّة، والصحة موقوفة**

## وقفنا عند

انتهى العمل على القطاعات. سأل خالد «القطاعات كلها خلصت؟» لأن عنده شغلاً آخر، وجاه الجواب مع دليل الإيقاف.

**الخطوة التالية:** ننتظر خالد يحدّد الشغل الجديد.

## حالة القطاعات (`shared/lib/sectors/live-sectors.ts`)

| القطاع | الحالة | الكوميت |
|---|---|---|
| الكورة `/modonty/football` | حيّة | `ec33a1a` |
| الذكاء الاصطناعي `/modonty/ai` | حيّة | — |
| ريادة الأعمال `/modonty/entrepreneurship` | حيّة ومؤقتة («لازم نعمل لها تحسين وتعديل»، كرت ENTRE-1) | `9b9a83e` |
| التعليم `/modonty/education` + «تعلّم مجاناً» | حيّة | `fa1012a` · `b540254` |
| الترفيه `/modonty/entertainment` (خروجات عائلية فقط، بلا سينما ولا حفلات) | حيّة | `7fefc25` |
| الصحة والجمال `/modonty/health` | **موقوفة** (`paused: true`)، تعرض «قريباً» مع noindex وخارج السايت ماب | `a70fa4b` |

- **فحص الإيقاف على الإنتاج:** الصفحة ترجع 200 و«قريباً» ونو-إندكس، وعدد `modonty/health` في السايت ماب 0.
- **إرجاع الصحة:**
  1. نحذف `paused: true` من `live-sectors.ts`.
  2. نرفع صورتي الهيرو من السكراتش: `hero-health-desktop.png` و`hero-health-mobile.png`.
  3. نضيف السيو والمقالات من الأدمن.

## قرارات وعوائق مفتوحة

1. **الصحة، بيانات open.data.gov.sa محجوبة جغرافياً:**
   - لا ترد إلا من داخل السعودية. Vercel iad1 يرجع «fetch failed»، و١٢ دولة في check-host انتهت مهلتها.
   - الخياران (كرت HEALTH-1):
     - نسحب البيانات من جهاز داخل السعودية إلى ملفات داخل الكود.
     - أو نستخدم بروكسي سعودي (GCP الدمام).
   - خالد: «i do not want data in my db».
2. **هيئة الغذاء والدواء:** شروط موقعها تمنع النسخ والربط بلا موافقة، فشِلنا السكرابينج والروابط. خالد: «اي حاجه فيها مخاطره ابعدنا عنها».
3. **الموافقات المطلوب مراسلتها:** مسجّلة في كرت APPROVALS-1.
4. **ريادة الأعمال:** تحتاج نقاشاً قبل أي كود (ENTRE-1).
5. **أفكار مؤجلة:** تصوير اسم الدواء بالجوال وقراءته بالـOCR، و«حق إيش؟». الاثنتان تحتاجان موافقة هيئة الغذاء والدواء.
6. **مجلد `modonty/app/(site)/modonty/[sector]`:** صار يرجع ٤٠٤ فقط، ويحتاج حذفاً يدوياً لأن الحذف مرفوض في الجلسة.

## ملفات رئيسية لكل قطاع

- **مشترك:**
  - `modonty/app/(site)/modonty/helpers/`: `normalize-arabic` و`use-debounced-search`.
  - `components/translation-credit/`.
  - `modonty/lib/i18n/fill.ts`.
  - `modonty/lib/users/alert-topics.ts`.
  - `messages/ar.json`.
- **الأدمن:**
  - `sidebar.tsx` و`page-config.ts` (SECTOR_ABOUT) و`hero-prompts.ts`.
  - `sectors/actions.ts` (`setPlaceHidden`).
  - `sector-tabs` و`places-panel`.
  - السكيما فيها حقل `SectorPage.hiddenPlaces`.
- **سكربتات الاستيراد في `modonty/scripts/`:**
  - `import-mc-activities.mjs`
  - `import-etec-education.mjs`
  - `import-entertainment-places.mjs`
- **الصحة:**
  - `health/data/`: `download-open-data-csv` و`get-drugs` و`get-facilities` و`search-*`.
  - `health/api/drugs` و`health/api/facilities`.
  - ملفات SFDA المشالة نُقلت إلى السكراتش `removed-health/`.

## تنظيف معلّق (الحذف بـ`rm` مرفوض في هذه الجلسة)

- `modonty/scratch-flow-db.mjs` و`docs/`، والاثنان غير متتبَّعين.
- حسابات تجربة على `modonty_dev` (@test.local).
- مجلدات كاش قديمة `modonty/.next/cache-stale-*`.

## Git

- الفرع `main`، وآخر كوميت مدفوع `a70fa4b`.
- غير مثبّت: هذا الملف فقط، مع `docs/` و`modonty/scratch-flow-db.mjs` غير المتتبَّعين.

## البناء والنشر

- قبل آخر دفع: tsc للتطبيقين بلا أخطاء، والبناءان exit 0، والنشر نجح وفُحص حيّاً في هذه الجلسة.

## ملاحظات تشغيل

- **سيرفرات dev شغّالة:** مدونتي على 3000 والأدمن على 3001.
- **`prisma generate`:** يحتاج إيقاف السيرفرات أولاً، لأن ملف DLL يكون مقفلاً (EPERM).
- **قبل البناء:** ملف `.next/dev/types/validator.ts` يتلف أحياناً، فننقله إلى السكراتش.
- **Vercel CLI:** نستخدم `npx -y vercel@latest` مع `VERCEL_TOKEN`، والمشروع modonty-modonty.
- **الإنتاج والتطوير:** قاعدة الإنتاج `modonty`، وقاعدة التطوير `modonty_dev`.
