# الصفحة الرئيسية — لوحة الشغل

> ملاحظات هذا المسار وحده. أي شي نلاحظه على الرئيسية يُكتب هنا فوراً
> ونعالجه بالأولوية، عشان ما ننسى ولا نعالج نفس الشي مرّتين.
> القواعد العامة للتاسك في `.claude/skills/modonty-naming/`.
> **آخر تحديث: ١٥ أغسطس ٢٠٢٦**

---

## 🔴 أولوية عالية

### ١. الأسئلة الثلاثة — بانتظار جواب خالد
شرط قبل أي تعديل بصري على الصفحة. بلا إجابة مكتوبة، ما نفتح ملف تصميم.

**س١ — ليش الزائر وصل الرئيسية؟**
> الجواب: _(لم يُكتب بعد)_

**س٢ — وش الفعل الواحد اللي نبغاه منه على الرئيسية بالذات؟**
> الجواب: _(لم يُكتب بعد)_

**س٣ — وش الشي اللي يرجّعه بعد أسبوع؟**
> الجواب: _(لم يُكتب بعد)_

### ~~١ب. نقل `helpers/` → `data/`~~ — ✅ نُفِّذ ١٥ أغسطس
قاعدة خالد (١٥ أغسطس): **كل ما يجيب بيانات من السيرفر للواجهة يقعد في `data/`**،
و`helpers/` للدوالّ الصغيرة المساعدة فقط (تنسيق · تحويل · حساب).
الاسم `data` لا `actions`، لأن «أكشن» في Next تعني «سيرفر أكشن» تحديداً وأغلب جلبنا ليس كذلك.

القياس الخام على الرئيسية — الثمانية كلهم جلب بيانات، ولا واحد دالّة مساعدة:

```
get-categories-with-counts.ts      db-calls=1
get-clients-for-sidebar.ts         db-calls=1
get-core-publisher-articles.ts     db-calls=1
get-services-card.ts               db-calls=2
get-tags-with-counts.ts            db-calls=1
home-feed-shapes.ts                db-calls=1
get-home-feed-articles.ts          db-calls=0   ← يجلب عبر home-feed-shapes
get-more-articles.ts               db-calls=0   ← يجلب عبر lib/queries/get-articles
```

التسعة كلهم صاروا في `data/`، و`actions/` انتهى كاسم.

**و`helpers/` يبقى موجوداً ولو فاضياً** (قرار خالد، ١٥ أغسطس) — مجلّدات المسار
القياسية `api/` · `data/` · `helpers/` · `components/` تبقى كلها على كل مسار
عشان ما ننسى الشكل ولا نخترع مكاناً جديداً وقت الضغط. وفيه `.gitkeep` لأن الجيت
لا يحفظ المجلّد الفاضي، فبدونه تختفي القاعدة عند أول نسخة للمستودع.

**تنبيه للتنفيذ:** القاعدة تمشي على كل مسار في المشروع لا على الرئيسية وحدها،
والتعميم يصير لما يقول خالد «انتهينا من الهيكلة».

### ٢. زائر سطح المكتب ما يشوف دعوة اشتراك إطلاقاً
نموذج الاشتراك في النشرة مدفون في الشريط السفلي، والشريط للجوّال فقط.
هدف هذا التاسك كلّه «الزائر يشترك ويرجع» — والصفحة اليوم ما تطلب منه ذلك على أوسع شاشة.

### ٣. الريلز: استعارة من مسار شقيق + جلب ضعف الحاجة
`page.tsx` ينادي `getReelsFeedPage` من مجلّد صفحة الريلز — خرق لقاعدة المجلّدات.
والأسوأ: يجيب **٦ صفوف** بكل تفاصيلها (إعجابات · مفضّلات · مقاسات · شعار الشريك)
ليعرض **٣ بلاطات** تستخدم **٥ حقول** فقط.
**المتفق عليه:** دالّة خاصة بالرئيسية في `helpers/` — ثلاثة صفوف، خمسة حقول، بلا ترقيم صفحات.

---

## 🟡 أولوية متوسطة

### ٤. ما فيه رقم أساس للاشتراك
كم مشترك الآن، ومن أي صفحة جاء؟ بدون الرقم ما نقدر نجاوب «هل الريفاكتور نفع؟».

### ٥. بوّابة السيو لم تُقس على هذي الصفحة
المطلوب قياس خام قبل/بعد: العنوان · الوصف · الكانونيكال · تسع لغات · بيانات منظّمة · ترويسة `h1` واحدة.

### ٦. بوّابة الأداء لم تُقس
صفر استعلامات متسلسلة · صفر استيراد برميلي · `priority` على صورة واحدة فوق الطيّة.

### ٧. الـ`h1` مخفي (`sr-only`)
`page.tsx` يرسم `<h1 class="sr-only">مدونتي — منصة المحتوى العربي</h1>`.
الصفحة بلا عنوان مرئي ولا نقطة تركيز — الزائر يفتحها ولا يعرف وين هو ولا وش يسوّي.
يُحسم مع بند ١ و٢، لا لحاله.

---

## 📋 جرد `"use client"` — ١٦ مكوّناً من ٤٠ ملفاً

> القاعدة: الافتراضي سيرفر كومبوننت، و`"use client"` **فقط** لحالة أو تأثير أو مرجع
> أو معالج حدث أو واجهة متصفّح. الجرد أدناه مقيس، ولكل ملف سبب صريح.

### ✅ مبرَّرة — لها سبب حقيقي (١٥)

| الملف | السبب المقيس |
|---|---|
| `articles-list/MoreArticles.tsx` | `useState` `useEffect` `useRef` `useCallback` `useSearchParams` + `onClick` |
| `articles-list/MoreArticlesOnScroll.tsx` | `useState` `useEffect` `useRef` + `dynamic()` ×١ |
| `ask-modo/AskModo.tsx` | `useState` `useRouter` + `onSubmit` `onChange` |
| `industries-card/IndustriesCard.tsx` | `useRef` (تمرير الشريط) + `onClick` |
| `mobile-bottom-bar/BottomBarLoader.tsx` | `dynamic()` بـ`ssr:false` — القشرة كلّها خارج المسار الحرج |
| `mobile-bottom-bar/BottomBarShell.tsx` | `useState` `useSearchParams` + `dynamic()` ×٢ |
| `mobile-bottom-bar/DiscoverSheet.tsx` | `onClick` (إغلاق الورقة عند التنقّل) |
| `mobile-bottom-bar/FloatingButton.tsx` | `useState` + `onClick` |
| `mobile-bottom-bar/PartnersSheet.tsx` | `useState` `useMemo` + `onClick` `onChange` |
| `mobile-bottom-bar/SortMenu.tsx` | `onChange` (قائمة منسدلة) |
| `modonty-card/ModontyCard.tsx` | `useState` (الكاروسيل) + `onClick` |
| `scroll-buttons/BackToTop.tsx` | `useState` `useEffect` + `onClick` |
| `scroll-buttons/ScrollButtons.tsx` | `useState` `useEffect` `onScroll` + `dynamic()` ×٢ |
| `scroll-buttons/ScrollProgress.tsx` | `useState` `useEffect` (مستمع تمرير) |
| `user-card/UserCard.tsx` | `useSession` — يقرأ الجلسة من المتصفّح |

### 🔴 مشكوك فيها — مرشّحة للحذف (١)

**`mobile-bottom-bar/AskModoButton.tsx`** — **صفر حالة · صفر تأثير · صفر معالج حدث.**
كل ما يفعله أنه يمرّر ثوابت لـ`FloatingButton` (وهو العميل الحقيقي).
`"use client"` هنا يسحب `OptimizedImage` و`IconForward` و`CHARACTER_URL` للباندل بلا داعٍ.
**المقترح:** يُحذف السطر ويبقى سيرفر كومبوننت — العميل يبدأ من `FloatingButton` وحده.
**قبل التنفيذ:** يُتحقّق أن `FloatingButton` يقبل `ReactNode` من السيرفر (يقبله، الأنواع `ReactNode`).

---

## 🟢 أولوية منخفضة

### ٨. استيراد برميلي
`page.tsx` يستورد من `@/lib/seo` (برميل) — القاعدة تمنعه لأنه يجرّ ما لا يُستخدم.

### ٩. أربعة أخطاء `JWTSessionError` في الكونسول
كوكي جلسة قديمة على `localhost`. **ليست من الكود** — سابقة لهذا التاسك.
تنحلّ بمسح كوكيز `localhost`. تُذكر هنا فقط عشان ما نطاردها كل مرّة.

---

## ✅ منجز

- `app/(homepage)/` — الصفحة والرابط والمكوّنات والدوالّ في مكان واحد.
  مقيس: `/` = ٢٠٠ · `/api/articles` = ٢٠٠ · `/homepage` = ٤٠٤.
- مجلّد لكل قسم يُشاف على الشاشة، بأسماء بسيطة.
- حذف كود ميت: ملف الهياكل الجانبية + ثلاث `<Suspense>` ما كانت تشتغل ولا مرّة.
- `loading.tsx` صار بنفس عرض الصفحة — لا قفزة عند انتهاء التحميل.
- فصل الدالّة عن الباب: `helpers/get-more-articles.ts` + `actions/load-more-articles.ts`.
  مُختبَر حيّاً: التمرير جاب ٢٠ ← ٦٠ مقالاً.
- `api/articles/route.ts` — الشبّاك للجوّال، ينادي نفس الدالّة.
  مُختبَر: `page=1` ← ٢٠٠ · `page=abc` ← ٤٠٠.
- عنوان الصفحة كان يكتب البراند مرّتين — أُصلح، ومقيس من HTML الخام قبل/بعد.
- **كل عنصر تحكّم صار من shadcn** — كانت ١٠ `<button>` خام و`<input>` خام.
  المقيس بعدها: صفر عنصر خام في المسار.
- **الروابط بهيئة زرّ صارت `buttonVariants` لا `<Button asChild>`** في خمسة مواضع.
  السبب من توثيق shadcn: *"Avoid wrapping an anchor tag inside the Button component,
  as the component applies a button role that overrides the semantic link role."*
- **كنسة نظام التصميم:** صفر ظلّ في التدفّق (٢١ حلقة بدلها) · صفر وزن ممنوع ·
  ثلاثة أقطار بدل سبعة · الحاوية `1128px` · صفر جهة فيزيائية ·
  أسهم الكاروسيل قرص ٣٢ داخل هدف لمس ٤٨.
- **كود ميت محذوف:** ٣٩ مستورَداً بلا استعمال في ٦ ملفات · ٣ تصديرات بلا مستهلك ·
  النوع الوسيط `LoadMoreArticlesResult` · الحقل `ReelItem.slug`.
