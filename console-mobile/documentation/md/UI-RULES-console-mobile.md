# قواعد UI الملزمة — Console Mobile

> **الحاكم عند أي تعارض:** `documents/mobile/UIUX-RULES.md` — أرقامه نهائية ومسنودة بمصادر رسمية،
> وهذا الملفّ يبقى للتفاصيل الخاصّة بتطبيق الكونسول وحده (التابات الخمس · شاشة الموافقة).
> والطبقة الهندسية في `documents/mobile/ENGINEERING-RULES.md`.

هذه قواعد تنفيذ، وليست اقتراحات. الصورة المعتمدة للمُلك هي مواصفة الشاشة؛ وعند تعديل القواعد يُحدّث هذا الملف ونسخة HTML معًا.

## بوابة التسليم

- [ ] صورة معتمدة أو امتداد مباشر لتصميم معتمد.
- [ ] اختبار Android فعلي + عرض iPhone مرجعي.
- [ ] Safe Area للهيدر والفوتر، ولا نص مقصوص أو متداخل.
- [ ] حالات loading / empty / error / offline / disabled موجودة.
- [ ] RTL صحيح، وكل هدف لمس 48×48dp أو أكثر.
- [ ] تستخدم الأيقونات `ModontyIcon` فقط؛ لا Ionicons أو Lucide في الـactive UI.
- [ ] لقطة جهاز فعلي قورنت بالصورة قبل العرض.

## 1. Safe Area والهيكل

1. الهيدر: 56dp للمحتوى + `insets.top`.
2. الفوتر: 64–72dp للمحتوى + `insets.bottom`، والـscroll يحجز مساحته.
3. الخلفية يمكن أن تصل للحافة؛ النص والأزرار لا تدخل status bar أو gesture area.
4. لا قياس ثابت للشاشة ولا `absolute` لتثبيت محتوى الصفحة.
5. الاختبار: 360×800 و390×844 و430×932 و720×1600 الفعلي.

## 2. التنقل والعودة للرئيسية

1. التابات للأقسام العليا فقط: الرئيسية، المقالات، الفيديوهات، الجمهور، التنبيهات.
2. Home هو أول tab في ترتيب RTL، لا وظيفة مخفية في الشعار.
3. Back داخل الشاشة يعيد خطوة واحدة فقط؛ Home tab ينقل للرئيسية مباشرة. لا نخلطهما.
4. Account في avatar؛ الأعمال الثانوية داخل hamburger؛ لا نضيف tab خامس بلا قرار UI.
5. التاب label ثابت وكلمة واحدة قدر الإمكان، ولا يستخدم tab لتنفيذ فعل مثل upload أو approve.
6. كل Drawer أو Modal أو overlay له زر إغلاق مرئي 48dp، مع دعم الضغط خارج العنصر وزر النظام Back.

## 3. اللمس والحركة

1. الحد الأدنى لكل هدف لمس 48×48dp؛ الرمز البصري داخله 20–24dp.
2. يوجد CTA أساسي واحد في الـviewport. الإجراء المدمر لا يكون primary ولا بنقرة واحدة.
3. لا رحلة تعتمد على swipe فقط؛ لكل إجراء بديل واضح وfeedback عند الضغط.

## 4. الخطوط

| الدور | الوزن | الحجم / line-height |
|---|---:|---:|
| Page title | Medium 500 | 18 / 26 |
| Section | Medium 500 | 16 / 24 |
| Body | Regular 400 | 15 / 23 |
| Label | Medium 500 | 13 / 20 |
| Meta | Regular 400 | 12 / 18 |
| Tab label | Medium 500 | 11 / 16 |

- Bold 700 ليس default؛ فقط لرقم أو قرار حرج واحد.
- ممنوع Light/Thin.
- النص المقروء يدعم تكبير النظام؛ tab وbadge لا يكبران بصورة تكسر التخطيط.
- عنوان البطاقة حدّه سطران؛ النص الطويل يلتف أو له «عرض الكل».

## 5. الشكل، RTL، والأيقونات

1. مقياس المسافة الوحيد: 4، 8، 12، 16، 20، 24، 32.
2. الحواف 16–20dp؛ Radius: input 12، button 16، card 20.
3. الوضعان dark/light يستخدمان semantic tokens؛ لا hex عشوائي داخل Route.
4. اللون لا ينقل الحالة وحده: نص + رمز/شكل + لون.
5. التطبيق RTL؛ email وURL والكود والأرقام التقنية LTR داخل سياق RTL.
6. الأيقونات من `src/components/brand/icons/ModontyIcon.tsx` فقط. إن لم توجد أيقونة معتمدة، تُعتمد في الـmaster أولًا ثم تُنسخ للتطبيق.

## 6. البيانات والوصولية

1. Dummy data بيانات عميل واقعية: طول عربي متغير وحالات حقيقية، لا Lorem Ipsum.
2. loading = skeleton، empty = سبب + فعل واحد، error = إجراء واضح + retry، submit يمنع double submit.
3. كل Pressable له `accessibilityRole` و`accessibilityLabel` عربي.
4. اختبار يدوي: قارئ شاشة، تكبير خط، dark/light، keyboard للـforms، وانقطاع إنترنت.

## طريقة العمل

`نطاق الشاشة + dummy data → صورة واحدة معتمدة → تنفيذ من tokens/components → لقطة جهاز فعلي ومقارنة → تعديل ذاتي → عرض`

## مصادر رسمية

- [Apple: Layout and safe areas](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple: Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Android: Accessibility for mobile](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility)
- [Android: Accessible touch targets](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views)
- [Material 3: Navigation bar](https://m3.material.io/components/navigation-bar/overview)
