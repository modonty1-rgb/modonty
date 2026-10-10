# أيقونات البراند v2 — تسليم من جهاز ٢ · ٩ أكتوبر ٢٠٢٦

جهاز ١ = **سند** (اللابتوب الرئيسي · تطبيق الجوال). جهاز ٢ = هذا اللابتوب (`DESKTOP-V6U86Q4`).
الفرع: `ui/icons-v2` من `origin/main`. **غير ملتزم وغير مرفوع** — ينتظر أمر خالد.

## ✅ الحالة النهائية (٩ أكتوبر ١٨:٠٠)
- **١٠٣ ماركة مرسومة من جديد** في Claude Design (M24 + M16 لكل واحدة) + **١٠ نسخ Filled** — كلها في الكود.
- فحص آلي على كل ملف (٢٠٦ رسمة Regular): viewBox · خطّ واحد · أطراف دائرية على كل عنصر · بلا transform · ماسة واحدة بالمقاس · داخل الإطار · فجوة الماسة · الوزن البصري → **٢٠٢/٢٠٦ ناجحة، والأربع الباقية ضمن ±٠٫٣٪ (دقّة القياس)**.
- مراجعة بصرية نقدية: رُفضت وأُعيدت ٣٢ رسمة قبل الاعتماد (أمثلة: «الاتجاهات» كانت تُقرأ «ممنوع»، «عجلة الحظ» تُقرأ «إغلاق»، «فك الرابط» تُقرأ `</>` ثم `%`، «كرة القدم» مقود سيارة، «على الماشي» ثلاث محاولات حتى صارت شخصاً يمشي والماسة رأسه).
- `tsc --noEmit` ناجح على **modonty · admin · console** بعد التغيير.
- لوحة كل الطقم: `documents/design/assets/icons-v2-sheet.png` (مستثنى من git بقاعدة `*.png` — يُعاد توليده من `documents/design/assets/icons-v2-source.json`).

### ما تغيّر في الكود
| | |
|---|---|
| `shared/components/icons/mark-size.ts` | جديد — `markSize(size, className)`: أقلّ من ٢٠ → M16، وبدون `size` يقرأ `size-3…4.5 / h-… / w-…` |
| ملفات الماركات (٦٠+ ملف) | كل ماركة = دالّة واحدة بنفس الاسم القديم، ترسم M24 أوّلاً ثم M16 (المولِّد يقرأ أوّل `<svg>`) |
| ماركات جديدة | `chevron` · `chevron-right` · `chevron-down` · `chevron-up` · `arrow-right` · `arrow-up` · `external` · `views-off` · `lock` · و١٠ `*-filled` |
| حُذفت (صفر استخدام) | `pricing` · `reels-closed-clapper` · `toc` · `ModontyMoreVerticalMark` + أسماؤها في السجلّ (`IconAlignJustify` · `IconContent` · `IconMoreVertical`) |
| `shared/lib/icons.ts` | ١٠ أسماء أُصلح معناها (Chevron* · External · ScrollTop · ArrowRight · EyeOff · VolumeX→ListenOff · Lightbulb→Idea) + قسم Filled |
| ٤ مواضع استدعاء | أُزيل تدوير كان يعوّض السهم الوحيد القديم: `reels-feed-client.tsx` (×٢) · `ScrollButtons.tsx` · `gallery-lightbox.tsx`؛ و`help/faq/page.tsx` أُضيف `rtl:rotate-180` |

### 🔧 مطلوب من سند (تطبيق الجوال) بعد السحب
1. `modonty-mobile/src/components/brand/ModontyIcon.tsx`: `viewBox: '0 0 120 120'` → **`'0 0 24 24'`** (الهندسة صارت على شبكة ٢٤). بدونها تظهر الأيقونات صغيرة جداً.
2. `scripts/generate-icons.mjs`:
   - احذف `toc` من `ICONS` (الملف حُذف).
   - `close` صار ماركة عادية بلا قناع → يمكن نقله للمولِّد وإلغاء الاستثناء اليدوي.
   - أضف الـFilled للتبويب: `articles-filled` … (الملفات `modonty-*-filled-mark.tsx`).
   - `paint()`: أضف `/knockout/` → `'white'` (حلقة الماسة في Filled تستعمل `var(--modonty-knockout, …)`).
3. شغّل `pnpm --filter ./modonty-mobile icons` وتأكّد من `back`/`forward`: سهم الماركة مرسوم **RTL أصلاً** (يشير لليسار = للأمام).
4. التبويب السفلي النشط: استعمل `*-filled` بدل الدائرة الملوّنة وحدها (Apple: tab bars «prefer filled»؛ Android: Filled للمحدَّد).

### مفتوح للمرحلة التالية (لم يُنفَّذ عمداً)
- ٤٨ استخداماً بمقاس ١٤px في `modonty/` → ١٦ (المعيار §8). مؤجَّل: تغيير تخطيط.
- ربط `IconLikeFilled` / `IconSavedFilled` بحالة «تم الإعجاب/الحفظ» في المكوّنات.
- `DESIGN-SYSTEM.md` §«أحجام الأيقونات» يشير لقواعد شبكة ١٢٠ القديمة — يُستبدل بإحالة لـ`ICON-STANDARD-v2.md`.

### مشاريع Claude Design (حساب خالد)
- المرحلة ١ (لوحة الأسلوب): https://claude.ai/design/p/b2101f3b-55e6-43f4-a750-4fa1f9a6ed92
- 2A: https://claude.ai/design/p/c76dd2ce-1bb3-4954-84f2-3f6991853416 · 2B: https://claude.ai/design/p/7ebee0d1-4638-4363-85cb-c7b6ad6cf09b
- 3A + التلميع: https://claude.ai/design/p/cb758e5d-63b1-49a5-9c69-4c6d7d6b4930 · 3B: https://claude.ai/design/p/1d4aa89a-d7d2-430b-a19f-d5d48400dae1
- Filled: https://claude.ai/design/p/7be0d6c1-2d03-4db6-994c-7144359f4e49

---
*(ما تحت هذا الخط: سجلّ القرارات والقياسات الذي قاد إلى النتيجة.)*

## المعيار — مرجع واحد
`documents/design/ICON-STANDARD-v2.md` (موثّق من Material 3 · Apple HIG · Fluent 2 · IBM · Lucide · WCAG 2.2 · Android · react-native-svg).
أهمّ قراراته:
- **ماستران:** M24 (شبكة ٢٤ · هامش ٢ · خطّ **١٫٧٥**) للمقاسات ٢٠–٤٠، وM16 (شبكة ١٦ · هامش ١ · خطّ **١٫٢٥**) للمقاس ١٦. السبب: ١٦px أكثر مقاس مستخدم في `modonty/` (٢١٢ مرّة مقابل ٨١ لـ٢٠ و١٣ لـ٢٤).
- أطراف وزوايا **دائرية** · خطّ واحد · **ماسة واحدة ٤٥°** مثل الشعار (M24: ٣٫٥ · M16: ٢٫٥).
- **Regular** في كل مكان · **Filled** للتبويب النشط فقط (iOS وAndroid كلاهما).
- **SVG واحد للمنصّات الثلاث:** ٢٤ وحدة = ٢٤pt = ٢٤dp = ٢٤px. لا رسم لكل منصّة ولا @2x/@3x.
- هدف اللمس **٤٨** في التطبيق (يطابق `documents/mobile/UIUX-RULES.md`).
- كل عنصر جسم يحمل `stroke-linecap="round"` و`stroke-linejoin="round"` بنفسه — react-native-svg يرسمها مربّعة افتراضياً، والمولِّد ينسخ خصائص العناصر.
- بلا `transform` (الماسة مخبوزة في الإحداثيات) — المولِّد يدعم path/circle/rect/line/polyline/polygon/ellipse فقط.

## العقد مع التطبيق (سند)
- أسماء الملفّات والمكوّنات **لا تتغيّر** (`modonty-bookmark-mark.tsx` → `ModontyBookmarkMark`) فلا يتأثّر `shared/lib/icons.ts` ولا `modonty-mobile/scripts/generate-icons.mjs`.
- بعد دمج الفرع: سند يعيد التوليد `pnpm --filter ./modonty-mobile icons`.
- التبويب السفلي في التطبيق مخصّص (React Native) ← يبدّل Regular↔Filled بنفسه، والأيقونات تكبر مع حجم الخطّ (`PixelRatio.getFontScale()` بسقف).

## الجرد — من الكود لا من التقدير (`shared/components/icons/`)
| | العدد |
|---|---|
| ملفّات مُصدَّرة | ١١٥ |
| شعارات منصّات أخرى (X · واتساب · إنستغرام …) | ١١ — **لا تُرسم أبداً** |
| شعار مدونتي (`ModontyMark`) | ١ — مرجع لا يُلمس |
| ماركات مدونتي | ١٠٣ |
| ↳ **غير مستخدمة** → تُحذف | ٤: `MoreVertical` · `Pricing` · `ReelsClosedClapper` · `Toc` |
| ↳ تُرسم | ٩٩ |

**الأولوية حسب الاستخدام الفعلي (ويب + تطبيق):**
- **أ (٥٥) — أوّلاً:** Arrow · Partner · Trust · Views · Email · Loading · Articles · Profile · Check · Like · Search · Play · Professionals · Close · Audio · Comment · Bookmark · AlertTriangle · Pause · Share · Ai · Success · Phone · Tags · Trending · Calendar · Industries · Location · Notifications · Reels · Clock · Question · Support · Error · Refresh · Link · Gallery · Booking · Directions · Info · Markets · Keypoints · Login · Rating · Quran · LuckyWheel · Armchair · Coffee · Company · Filter · Logout · Idea · Footprints · Categories · Whatsapp
- **ب (٣٤):** Activity · Featured · Replay · Advance · Website · Home · Download · SkipForward · Add · Analytics · Settings · Health · Listen · Folder · Delete · Grid · Mobile · Feedback · Football · Entertainment · Education · Shopping · Sort · TextNormal · ThemeLight · ThemeDark · LinkOff · List · Desktop · Offers · ListenOff · TextBigger · TextSmaller · Video
- **ج (١٠ — استخدام واحد):** Upload · Circle · MoreHorizontal · Speed · SkipBack · Remove · Copy · Invoice · Payment · Menu

## أخطاء معنى في السجلّ (`shared/lib/icons.ts`) — قاعدته «اسم واحد = معنى واحد» مكسورة
| الاسم | يرسم الآن | الصحيح |
|---|---|---|
| `IconVolumeX` (كتم) | سمّاعة تعمل (`Audio`) | `ListenOff` — **موجودة**، تبديل ربط فقط |
| `IconLightbulb` | `Ai` | `Idea` — **موجودة**، تبديل ربط فقط |
| `IconEyeOff` | عين مفتوحة (`Views`) | ماركة جديدة: عين مشطوبة |
| `IconLock` | درع (`Trust`) | ماركة جديدة: قفل |
| `IconChevron*` · `IconExternal` · `IconScrollTop` | سهم واحد لـ٨ معانٍ (`Arrow`، ٩٠ استخداماً) | ماركتان جديدتان: شيفرون · رابط خارجي |
| `IconStop` · `IconSearchX` · `IconSend` · `IconHistory` · `IconCode` · `IconZap` · `IconFileQuestion` | تُعرض بماركات قريبة | تُراجَع — مقبولة مؤقّتاً |
الإضافات الجديدة: **٤ فقط** (شيفرون · رابط خارجي · عين مشطوبة · قفل). المجموع المرسوم: ٩٩ + ٤ = **١٠٣**.

## تشخيص الطقم الحالي (قبل v2)
- الماسة بثلاثة أنظمة: ٤٤ ماركة ٤px بزاوية **٣٠°** · ٢٤ ماركة ٢–٢٫٤px بزاوية ٤٥° · ١٧ بأحجام وزوايا عشوائية.
  ⚠️ `DESIGN-SYSTEM.md` (٢٢ أغسطس) يقول «موحَّدة على ٤٥°» والكود فيه ٣٠° — تناقض يحسمه v2.
- ٢٥ ماركة تخلط سماكتين أو ثلاثاً · ٣٣ تخلط أطرافاً مقصوصة ودائرية · الوزن البصري من ٣٫٨٪ إلى ٣٤٫٥٪.
- شبكات مختلفة (١٢٠ · ١٠٠ · ٥١٢) · `Settings` يخرج عن الإطار.
- ٤٨ استخداماً بمقاس **١٤px** في `modonty/` تخالف «لا شيء تحت ١٦» ← تُرفع إلى ١٦ مع v2.

## التصميم الجاري — Claude Design
- المشروع: https://claude.ai/design/p/b2101f3b-55e6-43f4-a750-4fa1f9a6ed92 (مفتوح من جهاز ٢).
- مشروع قديم بالبريف الأوّل (غير معتمد): `.../7f820e36-9e29-4e42-a991-48eb83061e7f` — لا يُبنى عليه.
- **المرحلة ١ (لوحة الأسلوب، ٨ ماركات × ٥ سماكات):** فُحصت آلياً — الهيكل نظيف ١٠٠٪ (viewBox · خطّ واحد · أطراف دائرية · بلا transform · ماسة واحدة صحيحة). السماكة ثُبّتت ١٫٧٥ / ١٫٢٥.
- أُعيدت ٦ ملاحظات: السمّاعة تُقرأ «تشغيل» · الترس متموّج وثقيل (٢١٫٩٪) · ريلز M16 ثقيلة (٢٩٫٦٪) · سطور المقالات تبدأ من اليمين · ماسة «حسابي» تقطع الكتف · حجم ماسة M16.
- **التصحيحات (١٣:٤٠):** نُفّذت الست وأُعيد فحصها آلياً — ١٦ ملف SVG (٨ × M24/M16) كلها ناجحة: خطّ واحد · أطراف دائرية · بلا transform · ماسة واحدة · داخل الإطار · فجوة الماسة ≥ ١٫١٢. الوزن: M24 من ١٦٫١٪ إلى ٢٣٫٨٪ (الحاويات) · M16 من ١٦٫١٪ إلى ٢٢٫٦٪. ماسة M16 صارت **٢٫٥** (توصية Claude Design: نسبتها من الأيقونة تساوي M24) ← يُحدَّث §4 في المعيار من «٣ / ٢٫٦px» إلى ٢٫٥.
- ملاحظة مفتوحة: مخروط السمّاعة (Audio) ضيّق ← يُوسَّع ضمن المرحلة ٢.
- **التالي:** اعتماد خالد ← المرحلة ٢ = الأولوية «أ» (٥٥) ← ب ← ج ← Filled للتبويبات ← اللوحة النهائية فاتح/داكن.
- كل دفعة تُفحص آلياً قبل العرض (سكربتات الفحص خارج المستودع على جهاز ٢: `C:\Users\Lenovo\Projects\modonty-design\`).

## ملاحظات تنسيق
- إضافة Claude in Chrome على جهاز ٢ **متّصلة بكروم سند** — لا تُستعمل من جهاز ٢. المتصفّح المحلّي هنا Playwright.
- ملفات env لجهاز ٢: مؤجَّلة (الأيقونات لا تحتاجها).
- لا push ولا merge إلا بأمر خالد.
