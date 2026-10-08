# CLOUD-TASK — أوّل مهمة سحابية: هيكل تطبيق القارئ + شاشتان

اقرأ قبلها: `modonty-mobile/AGENTS.md` · `documents/mobile/ENGINEERING-RULES.md` · `documents/mobile/UIUX-RULES.md` · `documents/mobile/BRANDING-STANDARD.md` · `modonty-mobile/documentation/API-INVENTORY.md`.

## الإذن والحدود

| | |
|---|---|
| **مسموح** | رفع فرع `claude/*` وفتح PR **إلى `cloud/modonty-mobile`** — هذا طلب صريح من خالد لهذه المهمة |
| **ممنوع** | أي رفع أو PR إلى `main` · لمس `modonty/` `admin/` `console/` `shared/` · أي اتّصال بقاعدة بيانات · أي سرّ أو رابط إنتاج مكتوب في الكود |
| **يُعدَّل فقط** | `modonty-mobile/**` · سطر `modonty-mobile` في `pnpm-workspace.yaml` · `pnpm-lock.yaml` |
| **فجوة في الـAPI** | تُكتب في تقرير الـPR، ولا تُصلَح في `modonty/` |

## المهمة

1. **الهيكل** — Expo SDK 54 بنفس نسخ `console-mobile/package.json` (`expo ~54.0.36` · `react-native 0.81.5`) + Expo Router + TypeScript strict + **React Native Paper** بثيم مدونتي (قرار ٤ أكتوبر؛ الكونسول يبقى على ثيمه الخاص). البنية كما في `AGENTS.md`: `app/` · `src/components` · `src/services` · `src/theme`.
2. **العنوان** — رابط الـAPI من `EXPO_PUBLIC_API_URL` فقط، و`.env.example` يوثّقه. لا قيمة احتياطية في الكود.
3. **شاشة الرئيسية** — `GET /api/mobile/v1/home` (`modonty/app/api/mobile/v1/home/route.ts`): قائمة المقالات بحالات تحميل/خطأ/فراغ.
4. **شاشة المقال** — `GET /api/mobile/v1/articles/[ref]`: العنوان · الكاتب · التاريخ · المتن. قراءة فقط، بلا تسجيل دخول.
5. **الأنواع** — أنواع الاستجابة تُستخرج من شكل الـroute الفعلي (`modonty/lib/mobile-api/article-detail-shape.ts`)، لا تُخمَّن.
6. **عربي وRTL** — Tajawal · `I18nManager` · أيقونات من مصدر الماركة لا إيموجي.

## التحقّق قبل فتح الـPR

```bash
pnpm install
pnpm --filter ./modonty-mobile exec tsc --noEmit
```

- النتيجة المطلوبة: صفر أخطاء. يُلصق الناتج الخام في وصف الـPR.
- **غير ممكن في السحابة:** تشغيله على جوال أو محاكي، وبناء APK. يُكتب في الـPR «لم يُجرَّب على جهاز» — التجربة يعملها خالد محلياً.

## التسليم

PR واحد إلى `cloud/modonty-mobile`، وصفه بالعربي: ما بُني (ملفّات) · ناتج tsc · فجوات الـAPI · ما لم يُتحقَّق منه.
