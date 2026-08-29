# S00 — نظام Console Mobile العام

الحالة: `APPROVED` بتاريخ 2026-08-28. هذه الورقة تصف ما تمثله الصورة `S00-foundations.png`؛ لا تسمح بتعديل التطبيق قبل مرحلة التنفيذ المعتمدة.

## المصادر الحاكمة

1. `documents/mobile/UIUX-RULES.md` — أرقام الموبايل النهائية، وتفوز عند التعارض.
2. `documents/mobile/ENGINEERING-RULES.md` — تنفيذ المكونات والتنقل والصور.
3. `documents/design/DESIGN-SYSTEM.md` — هوية Modonty: كحلي `#0E065A`، أزرق `#3030FF`، وأكسنت تركواز `#00D8D8`.
4. [Material Design 3 — Navigation bar](https://m3.material.io/components/navigation-bar/overview)، [Buttons](https://m3.material.io/components/buttons/overview)، [Cards](https://m3.material.io/components/cards/overview)، [States](https://m3.material.io/foundations/interaction/states/overview) — بنية وسلوك المكونات، لا ألوان أو أيقونات Material.

## ما يثبته S00

- الشعار الكامل هو الافتراضي؛ العلامة المفردة للمساحات الضيقة فقط.
- Tajawal: 400 للنص، 500 للعناوين، و700 لرقم أو قرار حرج واحد فقط.
- أزرار Material 3: Filled لفعل أساسي واحد، Outlined لفعل ثانوي، وText للفعل الثالثي.
- بطاقات محددة بسطح وحدّ 1px؛ لا ظل داخل تدفق الصفحة.
- شريط تنقل من 3 إلى 5 وجهات عليا، مع مؤشر اختيار مرئي؛ كل وجهة هدف لمس 48×48dp.
- الأيقونات ModontyIcon فقط؛ الأيقونة البصرية 24dp داخل هدف لمس 48dp.
- الروابط الداخلية الأمامية من ModontyIcon/الهوية فقط: شيفرون هادئ مع نقطة أكوا. سهم الرجوع من Native Stack القياسي.
- الحالات لا تعتمد على اللون وحده، وكل ضغط يعطي استجابة مرئية خلال 100ms.

## الحجز قبل التنفيذ

قيم ألوان `console-mobile/src/theme/tokens.ts` الحالية ليست مطابقة تماماً لألوان هوية `DESIGN-SYSTEM.md`. لا يُعدّل التطبيق في هذه المرحلة. عند اعتماد S00 وتوجيه خالد بالتنفيذ، تُحسم مطابقة tokens للهوية أولاً ثم يُنفّذ بقية الشاشات.
