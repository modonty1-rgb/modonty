# التصنيفات — المفتوح

بترتيب الأولوية. المنجز يُحذف من هنا، لا يُعلَّم.

## 🟡 القسمة القديمة تركت ترويسة ملصوقة في ثلاثة ملفات

مقيس ١٨ أغسطس ٢٠٢٦ بـ`tsc --noUnusedLocals` على `modonty/`:

`helpers/` فيه ثلاثة ملفات مقسومة من ملف واحد قديم، وترويسة الاستيراد نُسخت كما هي في
الثلاثة بدل ما تُقصّ على حاجة كل ملف — فطلع **١٧ استيراداً ميتاً**:

| الملف | كان يستورد | يحتاج فعلياً |
|---|---|---|
| `categories-page-size.ts` | ٦ أسطر (١١ اسماً) | `Prisma` وحده |
| `get-categories-page.ts` | ٦ أسطر (١١ اسماً) | `CategoryResponse` · `CategoryQueryOptions` |
| `get-categories-enhanced.ts` | نفس الستّة | بلا `Prisma` ولا `cacheTag`/`cacheLife` ولا ٣ أنواع |

**نُظّفت الاستيرادات في نفس الجلسة.** الباقي المفتوح: **الاحتمال أنّ نفس النمط في مسارات أخرى**
— أي مسار انقسم ملفه إلى ملفات بـ«انسخ الترويسة» يحمل نفس الميت. الفحص:
`npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p .` من داخل `modonty/` ثم اقرأ
أخطاء `TS6133`/`TS6192`/`TS6196`. لم يُنفَّذ على بقية المسارات بعد.

## ✅ أُقفل ١٨ أغسطس ٢٠٢٦

- **`helpers/category-utils.ts` حُذف.** كان اسمه `*-utils` (تسمية ممنوعة بقاعدة المستودع)،
  ويحمل أربع دوالّ ونوعاً: ثلاثة منها بصفر مستهلك (`generateCategoryGradient` ·
  `formatCategoryStats` · `CategoryIconComponent`)، و`getCategoryIcon` مستهلكه الوحيد
  كان مسار `modo-chat` (استيراد من مسار شقيق = كسر قاعدة) فانتقل إلى داخله،
  و`parseCategorySearchParams` انتقل إلى ملفّه `helpers/parse-category-search-params.ts`.
