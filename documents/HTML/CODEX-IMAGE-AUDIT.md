# تدقيق الإطارات و`sizes` للصور — ١ سبتمبر ٢٠٢٦

استُثني `modonty/components/feed/postcard/PostCardHeroImage.tsx`: هو المرجع المصحح (`aspect-video`) وليس نتيجة. لا يوجد في عقد `Media` نسبة مصدر إلزامية؛ لذلك لا تُسمى نسبة «لا تطابق» إلا عندما يثبت المصدر في الكود، وإلا فالحكم «تحتاج قياساً حيّاً».

## نسبة لا تطابق / تحتاج قياساً حيّاً

| التطبيق | ملف:سطر | المكوّن | نسبة الإطار | sizes | الحكم |
|---|---|---|---|---|---|
| modonty | `components/client/client-card.tsx:53-61` | `ClientCard` | `6:1` | responsive: `100vw/50vw/33vw` | تحتاج قياساً حيّاً: `heroImageMedia` لا تحمل نسبة مفروضة في الكود، و`object-cover` يقص أي مصدر غير بانورامي. |
| modonty | `components/shared/partner-card/PartnerCard.tsx:61-68` | `PartnerCard` | `6:1` | `560px/600px/100vw` | تحتاج قياساً حيّاً: الغلاف مصدره متغير و`object-cover` داخل بانوراما شديدة العرض. |
| modonty | `app/(partner)/clients/[slug]/components/sections/client-results-section.tsx:36-42` | `ClientResultsSection` | `16:10` | `100vw/50vw/33vw` | تحتاج قياساً حيّاً: مصدر النتيجة لا يثبت نسبته؛ القص موجود بـ`object-cover`. |
| modonty | `app/(site)/team/components/team-member-card/TeamMemberCard.tsx:24-31` | `TeamMemberCard` | `4:5` | `280px/45vw/100vw` | تحتاج قياساً حيّاً: صورة العضو قد تكون عمودية أو مربعة؛ لا توجد نسبة محفوظة في النوع. |
| modonty | `app/(partner)/clients/[slug]/(inner)/(plain)/reels/page.tsx:56-64` | قائمة الريلز | `9:16` | `100vw/33vw/320px` | تحتاج قياساً حيّاً: الإطار عمودي والـthumbnail قد لا يكون عمودياً؛ المصدر لا يصرح بنسبة. |
| admin | `app/(dashboard)/modonty/setting/components/page-form.tsx:127-157` | `PageForm` | `1.91:1` و`2:1` | `100vw/600px` | تحتاج قياساً حيّاً: المعاينتان تقصان نفس `previewImage` بإطارين مختلفين؛ لا يثبت الكود نسبة الملف. |
| admin | `app/(dashboard)/clients/components/edit-workspace/edit-left-panel.tsx:68` | `EditLeftPanel` | الإطار تحدده بطاقة preview | `340px` | تحتاج قياساً حيّاً: صورة hero تُقص بـ`object-cover` وعرض الإطار يعتمد لوحة التحرير. |
| console | `app/(dashboard)/dashboard/articles/components/article-card.tsx:124-131` | `ArticleCard` | `16:9` على الجوال، `192×128` (`3:2`) على سطح المكتب | `100vw/192px` | تحتاج قياساً حيّاً: نفس الغلاف يمر بين نسبتين؛ المصدر لا يضمن 16:9. |

## sizes مشبوه

| التطبيق | ملف:سطر | المكوّن | نسبة الإطار | sizes | الحكم |
|---|---|---|---|---|---|
| modonty | `components/shared/partner-card/PartnerCard.tsx:61-68` | `PartnerCard` | `6:1` | يعلن `600px` عند `768–1239px` | مشبوه: الحاوية مرتبطة بتخطيط بطاقة مرن، فـ600px ثابتة تحتاج مقارنة بعرضها المرصود. |
| admin | `app/(dashboard)/modonty/setting/components/page-form.tsx:127-157` | `PageForm` | `1.91:1`/`2:1` | يعلن `600px` مع preview مرن | مشبوه: عرض المعاينة يتبع الصفحة/اللوحة، لا عرضاً ثابتاً مثبتاً هنا. |
| console | `app/(dashboard)/dashboard/page-content/components/page-content-editor.tsx:365` | `PageContentEditor` | `h-40 w-full` | يعلن `900px` على سطح المكتب | مشبوه: العرض مرن (`w-full`) بينما `sizes` يسقف النسخة عند 900px. |

## بلا sizes

| التطبيق | ملف:سطر | المكوّن | نسبة الإطار | sizes | الحكم |
|---|---|---|---|---|---|
| — | — | — | — | — | لم أجد `OptimizedImage`/صورة fill مرشحة بلا `sizes` في الاستعمالات التي تعرض محتوى؛ عناصر SVG و`img` ذات أبعاد CSS ليست حالة `fill`. |

## الحصيلة

لا توجد «نسبة لا تطابق» مثبتة من الكود خارج المرجع المستثنى. يوجد **8** مواضع تحتاج قياس نسبة المصدر الحية و**3** إعلانات `sizes` مشبوهة؛ لا حالة `fill` بلا `sizes` مرشحة.
