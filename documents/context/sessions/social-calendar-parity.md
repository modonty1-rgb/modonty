# تقرير المطابقة: تقويم السوشيال (القديم مقابل الأدمن)، ٩ أكتوبر ٢٠٢٦

- **القديم:** `C:\Users\Lenovo\Projects\contentClaender-ref`، الإصدار `jbr-content-calendar` v1.6.0 (`package.json:2-3`).
- **الجديد:** `C:\Users\Lenovo\Projects\modonty-calendar`، الفرع `admin/social-calendar`، والمسار `admin/app/(dashboard)/social-calendar/`.
- **طريقة الفحص:** قراءة الكود فقط. لم يُشغَّل شيء ولم تُفتح أي قاعدة بيانات.
- **اختصار المسارات:** `OLD:` = `contentClaender-ref/`، و`SC/` = `admin/app/(dashboard)/social-calendar/`، و`SCHEMA` = `shared/prisma/schema/schema.prisma`.
- كل ما لم يُثبته الكود مباشرة موسوم «استنتاج».

---

## ١. ملخص في ٥ أسطر

1. **نسبة التغطية التقريبية ~٨٥٪ (استنتاج).** هذا عدّ يدوي لنحو ٤٥ سلوكاً في القديم، منها ~٣٨ موجودة في الجديد. الناقص أغلبه حُذف عمداً: إدارة العملاء، والعرض العامّ `/view`، ونوع العميل ولونه.
2. **الفجوة ١:** لا يوجد سكربت لترحيل البيانات من القديم. الحقلان `legacyEntryId` و`legacyAssetId` موجودان (`SCHEMA:5713, 5751`)، لكن لا شيء يكتب فيهما (لا نتيجة لـ`legacyEntryId` في `admin/scripts`).
3. **الفجوة ٢:** الحقل `creativeAssigneeId` لا يكتبه أي أكشن ولا أي واجهة. لذلك لا يصل جرس «منشور جديد» لأحد (`helpers/notify-post-event.ts:119-120`)، وتوجيه المهمة إلى «مصمم أو مونتير» حسب نوع المحتوى (`OLD:WORKFLOW.md:68-70`) غير منفّذ.
4. **الفجوة ٣:** صفحة المنشور هي ما يفتحه الجرس وزرّ «نسخ الرابط»، وليس فيها زرّا «موافقة» و«رفض» (`SC/[clientId]/posts/[postId]/page.tsx:70-96`). المراجع مضطرّ للرجوع إلى الجدول ليجد الزرّين عند المرور على الصف. يضاف إلى ذلك أن حدّ رفع الصور نزل من ١٠MB إلى ٤MB (`production/upload/route.ts:27`).
5. **أهم ٣ تحسينات في الجديد:**
   - آلة حالات وصلاحيات أدوار يفرضها الخادم (`helpers/post-transitions.ts:19-25`، `helpers/post-permissions.ts:20-27`)، بعد أن كان القديم يقبل الانتقال من أي حالة إلى أي حالة بلا تسجيل دخول (`OLD:app/actions/entries.ts:250-271`).
   - تاريخ بسنة كاملة وتوقيت الرياض. هذا يصلح خطأين في القديم: فبراير ٢٨ يوماً دائماً، وأسماء الأيام محسوبة على السنة الحالية.
   - كل أصل يُحفظ لحظة رفعه في جدوله الخاص مع الحذف من Bunny، والفيديو يُرفع مباشرة بـ tus، ومعه سجلّ تدقيق وجرس، وإشعار تيليجرام عند الرفض.

---

## ٢. جدول الشاشات

| القديم | الجديد (المسار) | الحالة | ملاحظة |
|---|---|---|---|
| `/` لوحة العملاء (`OLD:app/page.tsx`، `app/components/ClientsView.tsx`) | `/social-calendar` (`SC/page.tsx`، `SC/components/clients-view.tsx`) | مختلف | كروت وجدول مثل القديم، والاختيار محفوظ (`clients-view.tsx:42-58`). الفلتر صار «الكل / لهم منشورات» بدل «النوع» (`clients-view.tsx:107-135` مقابل `ClientsView.tsx:112-138`). سقط زرّا تعديل العميل وأرشفته من الكرت (`ClientsView.tsx:201-204`). |
| حوار «عميل جديد» وتعديل العميل وأرشفته (`NewClientDialog.tsx`، `EditClientButton.tsx`، `ArchiveClientButton.tsx`) | لا شيء. العميل يُدار من صفحة Clients (`SC/page.tsx:13-14`) | ناقص (مقصود) | لا لون للعميل ولا نوع (social/article). |
| `/archive` أرشيف العملاء مع حذف نهائي (`OLD:app/archive/page.tsx:20,90-91`) | لا شيء | ناقص (مقصود) | العميل المؤرشف في مدونتي يُستثنى من اللوحة (`helpers/queries/get-calendar-clients.ts:30`). |
| `/flow` دليل سير العمل (`OLD:app/flow/page.tsx`) | `/social-calendar/flow` (`SC/flow/page.tsx`) | مطابق | المراحل الأربع نفسها، والأدوار بأسماء StaffRole (`flow/page.tsx:86-155`). |
| `/clients/[slug]/calendar/[month]` (`OLD:.../page.tsx`، `CalendarTable.tsx`) | `/social-calendar/[clientId]/[yyyy-mm]` (`SC/[clientId]/[month]/page.tsx`، `components/calendar-table.tsx`) | مطابق مع زيادة | أُضيفت السنة، وأسهم للتنقّل بين السنوات (`month-sidebar.tsx:43-59`)، والفلاتر صارت في الرابط (`calendar-table.tsx:147-160`). |
| `.../[month]/new` (`OLD:new/page.tsx`، `EntryPageForm.tsx`) | `[clientId]/[month]/new` (`new/page.tsx`، `components/post-form.tsx`) | مطابق | أُضيف `?day=` لتحديد اليوم مباشرة (`new/page.tsx:30-37`). |
| `.../edit/[id]` | `[clientId]/posts/[postId]/edit` | مطابق | نقل المنشور بقائمتَي الشهر والسنة (`post-form.tsx:261-287`)، بدل قائمة الشهر وحدها (`EntryPageForm.tsx:464-480`). |
| `.../production/[id]` (`ProductionForm.tsx`، `UploadTipsCard.tsx`) | `posts/[postId]/production` (`production-form.tsx`، `upload-tips-card.tsx`) | مطابق مع اختلاف | الحفظ فوري لكل رفع. حدّ الصور ٤MB بدل ١٠MB. |
| `.../publish/[id]` (`PublishForm.tsx`) | `posts/[postId]/publish` (`publish-form.tsx`) | مطابق مع زيادة | زرّ جديد «إرجاع للإنتاج» بسبب إلزامي (`publish-form.tsx:343-365`). |
| نافذة «عرض التفاصيل» (`CalendarTable.tsx:379-437`) | نافذة في `row-actions.tsx:148-162` + `components/post-summary.tsx` | مطابق | أُضيف رابط «صفحة المنشور والسجلّ». |
| نافذتا «منح الموافقة» و«رفض الإبداع» (`CalendarTable.tsx:439-547`) | `[month]/components/approve-dialog.tsx`، `components/reject-dialog.tsx` | مطابق | النصوص والألوان نفسها. |
| `/clients/[slug]/gallery` (`GalleryClient.tsx`) | `[clientId]/gallery` (`gallery-client.tsx`) | مطابق مع اختلاف | فلاتر الشهر والنوع والحالة صارت في الرابط، والشبكة بصفوف مضبوطة (justified). المعاينة والتنقّل والتحميل والحذف موجودة. |
| `/clients/[slug]/archive` (`ArchiveClient.tsx`) | `[clientId]/archive` (`archive-list.tsx`) | مطابق | مجمّع بالشهر والسنة (`archive-list.tsx:57-70`). |
| `/view/[month]` عرض عامّ لكل العملاء للقراءة فقط (`OLD:app/view/[month]/page.tsx`) | لا شيء | ناقص (قرار «س١١») | الأدمن كله خلف تسجيل دخول (`row-actions.tsx:26-27`). |
| `/view/entry/[id]` رابط مشاركة عامّ (`OLD:app/view/entry/[id]/page.tsx`) | `posts/[postId]` بعد تسجيل الدخول | مختلف | `posts/[postId]/page.tsx:23-27`. |
| (غير موجود) | `posts/[postId]` صفحة المنشور: خطّ زمني، عدد مرات الرفض، سجلّ التدقيق | جديد | `posts/[postId]/page.tsx:44-49, 126-164`. |
| (غير موجود) | `loading.tsx` و`error.tsx` على الجذر وعلى `[month]` | جديد | حالات التحميل والخطأ. |

---

## ٣. جدول الحقول والبيانات

| حقل القديم (`OLD:prisma/schema.prisma`) | مقابله في `SocialPost` (`SCHEMA`) | الحالة |
|---|---|---|
| `clientId String?` (:27) | `clientId String` إلزامي (:5660) | مختلف (صار إلزامياً) |
| `month String` + `day Int` بلا سنة (:28-29) | `scheduledFor DateTime` (:5664) | مختلف: يوم كامل بسنته |
| `status String` بالعربي (:32) | `status SocialPostStatus` تعداد (:5667، :5609-5614) | مطابق في المعنى |
| `statusUpdatedAt` (:33) | `statusUpdatedAt` (:5668) | مطابق |
| `productionStartedAt` / `productionCompletedAt` / `publishedAt` (:36-38) | نفس الأسماء (:5669-5671) | مطابق |
| `contentType String` (`vid` وغيرها) (:41) | `format SocialPostFormat?` (:5674) | مطابق (`vid` ← `VIDEO`) |
| `customerStage String[]` (:42) | `funnelStages SocialFunnelStage[]` (:5675) | مطابق (تغيّر الاسم) |
| `channels String[]` (:43) | `channels SocialChannel[]` (:5676) | مطابق، وصار Threads معروفاً |
| `idea String @default("")` (:44) | `idea String` + Zod `min(1)` و`max(500)` (:5677، `post-schema.ts:33-37`) | مختلف: صار إلزامياً في الخادم أيضاً |
| `text` / `hook` / `cta` (:45-47) | نفس الأسماء (:5678-5680) | مطابق، مع سقف أمان في Zod |
| `script` (:48) | `scriptUrl` (:5682) | مطابق (تغيّر الاسم) |
| `voiceTone` / `inspiration` / `notes` (:49-51) | نفس الأسماء (:5683-5685) | مطابق |
| `assetLink` (مهمل) (:54) | لا شيء | ناقص (مقصود) |
| `assets Json` بالشكل `{id,url,bunnyUrl,bunnyError,type,label,width,height,bytes}` (:55، `entries.ts:14-24`) | جدول `SocialPostAsset` (:5729-5757) فيه `kind,url,path,label,bytes,width,height,order,bunnyVideoId,playbackUrl,legacyAssetId,uploadedById` | مختلف: جدول مستقل، و`bunnyError` سقط |
| `rejectionNote` (:56) | `rejectionNote` (:5689) + `rejectionCount` (:5691) | مطابق، مع حقل جديد |
| `orgPaid` (:59) | `paidKind SocialPaidKind?` (:5694) | مطابق |
| `budget` (:60) | `budget` (:5695) | مطابق |
| `currency` (:61) | `currency` + Zod `enum(SAR,USD,EGP)` (:5697، `post-schema.ts:73`) | مطابق |
| `adDuration` (:62) | `adDurationDays` (:5698) | مطابق (تغيّر الاسم) |
| `scheduledDate` + `scheduledTime` (:63-64) | `publishAt DateTime?` لحظة واحدة بتوقيت الرياض (:5700) | مختلف (دُمج الحقلان) |
| `channelLinks Json` (:65) | `channelLinks Json` بمفاتيح التعداد (:5702) | مطابق، والفارغ يُسقط (`build-publish-data.ts:20-24`) |
| `archived Boolean?` (:67) | `archivedAt DateTime?` (:5710) | مختلف (صار تاريخاً) |
| `createdAt` / `updatedAt` (:69-70) | نفس الأسماء | مطابق |
| لا شيء | `createdById` / `creativeAssigneeId` / `publishedById` (:5705-5707) | جديد. **`creativeAssigneeId` لا يُكتب في أي مكان** |
| لا شيء | `legacyEntryId @unique` (:5713) | جديد. **لا يوجد سكربت يملؤه** |
| `Client.color` و`Client.type` و`Client.archived` (:14-16) | شعار عميل مدونتي و`Client.archivedAt` | مختلف: سقط اللون والنوع |

---

## ٤. سير العمل والحالات

### الحالات والانتقالات

| الانتقال | القديم | الجديد |
|---|---|---|
| إنشاء ← «قيد الإنتاج» | `createEntry` (`entries.ts:205-224`) | `create-post.ts:38-57` |
| «قيد الإنتاج» ← «جاهز للمراجعة» | `updateStatus` بلا أي شرط في الخادم. الشرط «أصل واحد على الأقل» موجود في الواجهة فقط (`ProductionForm.tsx:208, 522`) | `markReady` يشترط أصلاً واحداً على الأقل في الخادم (`mark-ready-for-review.ts:30-32`) |
| «جاهز للمراجعة» ← «جاهز للنشر» | `updateStatus` (`CalendarTable.tsx:264`) | `approve` (`approve-post.ts:30-37`)، ويمسح `rejectionNote` (:35). **القديم لم يكن يمسحه** |
| «جاهز للمراجعة» ← «قيد الإنتاج» برفض | `rejectEntry` (`entries.ts:325-344`) | `reject` + `rejectionCount++` (`reject-post.ts:49-57`) |
| «جاهز للنشر» ← «قيد الإنتاج» | غير موجود | جديد: إرجاع من الميديا باير بسبب إلزامي (`reject-post.ts:43-47`) |
| «جاهز للمراجعة» ← «قيد الإنتاج» تلقائياً بحذف آخر أصل | `entries.ts:375-378` | `remove-asset.ts:57-68` |
| «جاهز للنشر» ← «تم النشر» | كتابتان منفصلتان: حفظ ثم `updateStatus` (`PublishForm.tsx:114-131`) | كتابة واحدة (`publish-post.ts:38-47`) |
| أي حالة ← أي حالة | **ممكن**: `updateStatus` يقبل أي قيمة (`entries.ts:250-271`)، وصفحة النشر تُفتح وزرّ «نشر» يعمل في أي حالة (`PublishForm.tsx:345`). (استنتاج: يعني أنه يمكن النشر من «قيد الإنتاج» عبر كتابة الرابط يدوياً) | **ممنوع**: جدول واحد للانتقالات (`post-transitions.ts:19-36`)، وكل كتابة مشروطة بالحالة الحالية `where:{id,status}` لمنع الكتابة فوق تعديل زميل (`approve-post.ts:33-37`) |
| قفل الأصول بعد الموافقة | في الواجهة (`ProductionForm.tsx:205`) وفي `deleteAsset` (`entries.ts:355-357`) | في الخادم لكل أكشن أصول: `ASSETS_LOCKED_STATUSES` (`post-transitions.ts:31`) في `add-video-asset.ts:38`، و`remove-asset.ts:41`، و`update-asset-label.ts:26`، و`upload/route.ts:78` |
| «تم النشر» يتطلّب روابط النشر | الوثيقة تقول «بعد إضافة الروابط تلقائي» (`WORKFLOW.md:21, 92`)، لكن الكود لا يشترط ذلك | لا يشترط أيضاً (`publish-post.ts`). المطابقة هنا مع الكود لا مع الوثيقة |

### من يملك كل انتقال

القديم بلا أي مصادقة. لم يُعثر على كود auth أو session في `OLD:app` ولا `OLD:lib`. الأدوار موجودة في الوثيقة فقط (`WORKFLOW.md:5-10, 16-21`).

| الصلاحية | القديم (حسب الوثيقة فقط) | الجديد (`post-permissions.ts:20-27`) |
|---|---|---|
| عرض | الجميع، والعرض العامّ بلا تسجيل دخول | الأدوار الستة: ADMIN · EDITOR · CREATIVE · SOCIAL · QC · SALES |
| إنشاء وتعديل البريف ونقل التاريخ | كاتب المحتوى | ADMIN · EDITOR |
| رفع وحذف الأصول و«جاهز للمراجعة» | المصمم أو المونتير | ADMIN · EDITOR · CREATIVE |
| موافقة أو رفض من «جاهز للمراجعة» | كاتب المحتوى | ADMIN · EDITOR |
| بيانات النشر و«نشر» والإرجاع من «جاهز للنشر» | الميديا باير | ADMIN · SOCIAL |
| أرشفة واسترجاع | (أي أحد) | ADMIN · EDITOR |

يُطبَّق في ثلاثة أماكن:
- الخادم: `require-social-actor.ts:24-38`، ويقرأ الدور من القاعدة لا من التوكن.
- الصفحة: مثل `[month]/page.tsx:51-57`.
- الأزرار: مثل `row-actions.tsx:74, 119, 136`.

---

## ٥. الأفعال

| الفعل | القديم | الجديد: موجود؟ أين؟ |
|---|---|---|
| إنشاء منشور | `entries.ts:205` + `EntryPageForm.tsx:400-453` | نعم: `actions/create-post.ts` + `post-form.tsx:207-232` |
| تعديل ونقل التاريخ | `entries.ts:228` (بلا Zod) | نعم: `actions/update-post.ts`، وكل حقل يمرّ بـ Zod (`post-schema.ts:30-59`) |
| رفع صورة | `/api/upload-bunny` بحدّ ١٠MB للصورة و٥٠٠MB للفيديو، والملف يمرّ بالخادم (`api/upload-bunny/route.ts:8-9`) | نعم: `posts/[postId]/production/upload/route.ts`، بحدّ **٤MB** (:27) |
| رفع فيديو | نفس المسار عبر الخادم | نعم: `request-video-upload.ts` ثم tus مباشرة ثم `add-video-asset.ts` (`production-form.tsx:231-280`) |
| تسمية الأصل | حالة محلية تُحفظ عند «جاهز للمراجعة» فقط (`ProductionForm.tsx:233, 443-450`) | نعم: تُحفظ عند مغادرة الحقل (`update-asset-label.ts`، `production-form.tsx:467-470`) |
| تبديل نوع الأصل (صورة/فيديو) | يدوي (`ProductionForm.tsx:413-427`) | يُستنتج من نوع الملف (`production-form.tsx:282-297`)، والتبديل اليدوي للصفّ المعلّق فقط |
| حذف أصل | `deleteAsset` (`entries.ts:348-396`)، من المعرض فقط. الحذف في صفحة الإنتاج كان محلياً | نعم: `remove-asset.ts` من الإنتاج والمعرض، مع نافذة تأكيد (`production-form.tsx:590-609`) |
| جاهز للمراجعة | `ProductionForm.tsx:229-247` | نعم: `mark-ready-for-review.ts` |
| منح الموافقة | `CalendarTable.tsx:261-278` | نعم: `approve-post.ts`، من الجدول فقط (**ليس في صفحة المنشور**) |
| رفض | `entries.ts:325-344` | نعم: `reject-post.ts`، من الجدول ومن صفحة النشر |
| حفظ بدون نشر / حفظ التعديلات | `PublishForm.tsx:99-112, 357` | نعم: `save-publish-details.ts`، مسموح فقط في «جاهز للنشر» و«تم النشر» (:30-32) |
| نشر | `PublishForm.tsx:114-131` | نعم: `publish-post.ts` |
| أرشفة | `archiveEntry` (`entries.ts:413-422`) + تأكيد (`CalendarTable.tsx:1039-1056`) | نعم: `archive-post.ts` + `calendar-table.tsx:581-600` |
| استرجاع | `unarchiveEntry` (`entries.ts:424-433`) | نعم: `restore-post.ts` |
| حذف منشور نهائياً | `deleteEntry` (`entries.ts:400-409`)، مستخدم فقط في المسار القديم `/calendar` (`OLD:app/calendar/[month]/CalendarPageClient.tsx:36`) | لا (مقبول) |
| عملاء: إنشاء وتعديل وأرشفة وحذف | `clients.ts:81-165` | لا (مقصود) |
| نسخ رابط المشاركة | رابط عامّ (`CalendarTable.tsx:297-305`) | رابط داخل الأدمن (`row-actions.tsx:46-55`) |
| تحميل بشريط تقدّم | `PublishForm.tsx:209-237`، المعرض | نعم: `components/download-button.tsx` (`publish-form.tsx:226`، `gallery-client.tsx:278`) |
| تيليجرام عند الإنشاء (اختياري) | `EntryPageForm.tsx:432-447`، والمربّع يظهر في الإنشاء فقط (:600) | نعم: `notify-post-event.ts:70-87, 139`، `post-form.tsx:508-516` |
| تيليجرام عند «جاهز للمراجعة» و«موافقة» و«نشر» | `ProductionForm.tsx:237-239`، `CalendarTable.tsx:267-269`، `PublishForm.tsx:121-123` | نعم: `notify-post-event.ts:89-104`، والنصوص منقولة مع رابط «افتح المنشور» |
| تيليجرام عند الرفض | لا | جديد: مع نصّ الملاحظة (`notify-post-event.ts:95-101`) |
| قناة تيليجرام | `TELEGRAM_BOT_TOKEN/CHAT_ID` (`OLD:app/actions/telegram.ts:6-7`) | `CONTENT_TEAM_BOT_TOKEN/CHAT_ID`، و**معطّل خارج الإنتاج** (`shared/lib/telegram/client.ts:116-125`) |
| جرس الأدمن | لا | جديد: `notify-post-event.ts:116-166`، ورابطه `admin/lib/notifications/registry.ts:98` |
| سجلّ التدقيق | لا | جديد: `logAction` في كل أكشن، والعرض في `posts/[postId]/page.tsx:143-163` |
| بحث وفلاتر وفرز وأعمدة و«إخفاء الفارغة» | `CalendarTable.tsx:568-651, 986-1036` | نعم: `calendar-table.tsx:142-229, 531-578`. فرز الحالة صار بترتيب المراحل (:204) بدل الترتيب الأبجدي (`CalendarTable.tsx:620-623`) |

---

## ٦. التفاصيل البصرية التي قالت الكوميتات إنها «كالقديم»

| البند | القديم | الجديد | الحكم |
|---|---|---|---|
| رؤوس الأسبوع Su..Sa | `EntryPageForm.tsx:100, 127-133` | `components/day-calendar.tsx:10, 44-50` | **مطابق** (الشفافية ٤٠ بدل ٣٥، فرق لا يُرى) |
| قفل الأيام الماضية عند الإنشاء فقط (أخضر إن كان فيها منشور، أحمر باهت إن لم يكن) | `EntryPageForm.tsx:115, 139-156` | `post-form.tsx:191-192`، `day-calendar.tsx:54-71` | **مطابق** |
| «Thu · 8 أكتوبر» | `EntryPageForm.tsx:238-244`، يطبع `Thu · 8 أكتوبر` | `post-form.tsx:52-54, 260`، يطبع `Thu · 8 أكتوبر 2026` | **شبه مطابق**: أُضيفت السنة |
| زرّ الإضافة بعلامة + | نصّ `"✚  إضافة المنشور"` (`EntryPageForm.tsx:576`) | أيقونة `Plus` + النص (`post-form.tsx:479-483`) | مطابق بصرياً |
| organic / sponsored | `ChipRadio` بالقيم الخام (`PublishForm.tsx:250`، `constants.ts:29`)، والحقول المدفوعة تظهر مع sponsored فقط (:253) | `PAID_CHIP_LABEL` (`publish-form.tsx:67, 237`)، والحقول عند :239 | **مطابق**. ملخّص المنشور يعرضها بالعربي «عضوي/مدفوع» (`post-summary.tsx:84`)، وهي غير موجودة في نافذة القديم أصلاً |
| أيقونات النوع والهدف | `react-icons/fa6` (`EntryPageForm.tsx:61-80`، `ProductionForm.tsx:32-51`) | نظائر من lucide (`components/brief-icons.ts:19-32`) | **مختلف قليلاً**: نفس الفكرة بأشكال lucide (مثل Megaphone مكان FaBullhorn) |
| مكان الأيقونات في سطر الإنتاج | `ProductionForm.tsx:278-320` | `production-form.tsx:370-407` | مطابق في البنية |
| فلتر العملاء | الكل / وسائل تواصل / مقالات بعدّادات، ويُحفظ في المتصفّح (`ClientsView.tsx:80-81, 92, 112-138`) | الكل / لهم منشورات بعدّادات، **ولا يُحفظ** (`clients-view.tsx:40, 107-135`) | **الشكل مطابق والمعنى مختلف** |
| كرت العميل: شريط علوي، ثم «منشور \| شهر» | الشريط بلون العميل (`ClientsView.tsx:195, 209-219`) | الشريط `bg-primary` (`clients-view.tsx:183`) + الشعار (:187) | الشكل مطابق واللون مختلف |
| أزرار الحالة بعدّاداتها | `CalendarTable.tsx:670-694` | `calendar-table.tsx:347-376` | **مطابق** |
| عدّادات الشهر و«All months» في الرأس | `OLD:.../page.tsx:73-93` | `[month]/page.tsx:62-98` | **مطابق**، مع إضافة السنة (`October 2026`) |
| شريط الملخّص السفلي | `CalendarTable.tsx:986-1004` | `calendar-table.tsx:531-544` | **مطابق** |
| عدّادات الشريط الجانبي | `MonthSidebar.tsx:33-66` | `month-sidebar.tsx:61-96` | مطابق. التذييل يعرض «N منشور» بدل رقم الإصدار (:98-101 مقابل `MonthSidebar.tsx:70-73`) |
| أيقونات التنقّل الثلاث | `NavIconLinks.tsx:18-43` | `nav-icon-links.tsx:16-33` | **مطابق** |
| شارة الحالة بلا نقطة في الأرشيف والمعرض | `ArchiveClient.tsx:91` | `archive-list.tsx:96`، `gallery-client.tsx:256` | **مطابق** |
| «سير العمل» في الإنتاج والنشر فقط | `production/[id]/page.tsx:47-50`، `publish/[id]/page.tsx:46-49` | `sub-page-header.tsx:42-50` + `showFlowLink` في `production/page.tsx:40` و`publish/page.tsx:39` | **مطابق** |
| رجوع المعرض إلى اللوحة | `gallery/page.tsx:30` (`href="/"`) | `gallery/page.tsx:29` | **مطابق** |
| شريط اللون فوق رأس التقويم | `OLD:.../page.tsx:41` | لا شيء (`client-page-header.tsx:25`) | **ناقص**: لا لون للعميل |
| عدّادات الأحرف (٤٠٠/٨٠٠ · ١٠٠/٢٠٠ · ٨٠/١٥٠) | `EntryPageForm.tsx:501-531` | `post-form.tsx:324, 333, 342` | **مطابق** |
| أيقونة Threads | في الجدول تظهر «th» كنصّ (`OLD:channel-icon.tsx:11-19, 29-34`) | `AtSign` (`components/channel-icon.tsx:33`) | مختلف (تحسين) |

---

## ٧. الفجوات بالأولوية

### P0 (قبل استبدال القديم)

1. **ترحيل البيانات غير موجود.**
   - الحقلان `legacyEntryId` و`legacyAssetId` موجودان (`SCHEMA:5713, 5751`)، ولا يوجد سكربت يقرأ `ContentEntry` ويكتب `SocialPost` و`SocialPostAsset`.
   - المطلوب تحويل: الشهر واليوم إلى `scheduledFor` بسنة، والنصوص العربية إلى تعدادات، و`scheduledDate+Time` إلى `publishAt`، و`assets[].bunnyUrl` إلى `url`.
   - **الملف المقترح:** `admin/scripts/migrate-social-calendar-from-jbr.ts`. يجب أن يكون idempotent على `legacyEntryId`، ويبدأ بتشغيل تجريبي (dry-run)، ويُشغَّل بأمر خالد فقط.
   - إن كان القرار البدء من صفر، تسقط هذه الفجوة.
2. **ضبط تيليجرام قبل الإطلاق.**
   - الجديد يقرأ `CONTENT_TEAM_BOT_TOKEN/CHAT_ID` ومعطّل خارج الإنتاج (`shared/lib/telegram/client.ts:116-125`).
   - بلا هذين المتغيّرين على Vercel يتوقف كل إشعار الفريق دون أي خطأ ظاهر. الفشل يُكتب في السجلّ فقط (`notify-post-event.ts:142-146`).
   - لا ملف لتعديله في الكود. المطلوب التحقّق من متغيّرات البيئة.

### P1

3. **`creativeAssigneeId` لا يُكتب أبداً.**
   - النتيجة: جرس «منشور جديد» لا يصل لأحد (`notify-post-event.ts:119-120`)، وجرس الرفض يذهب لكل CREATIVE (:127-131)، ولا توجيه حسب النوع (`OLD:WORKFLOW.md:68-70`).
   - **المقترح:** حقل «المصمم» في `SC/[clientId]/components/post-form.tsx` + `helpers/post-schema.ts` + `actions/create-post.ts` و`update-post.ts`. البديل: إشعار كل CREATIVE نشط عند الإنشاء.
4. **صفحة المنشور بلا موافقة ورفض.**
   - الجرس والرابط المنسوخ يفتحانها (`registry.ts:98`، `row-actions.tsx:47`)، والأزرار في الجدول فقط (`row-actions.tsx:72-96`).
   - **المقترح:** إضافة `ApproveDialog` و`RejectDialog` إلى `SC/[clientId]/posts/[postId]/page.tsx` عبر مكوّن عميل صغير. يُفضَّل أيضاً زرّا الموافقة والرفض في `production-form.tsx` عندما تكون الحالة «جاهز للمراجعة».
5. **حدّ الصور ٤MB مقابل ١٠MB في القديم** (`production/upload/route.ts:27`، `production-form.tsx:54`).
   - ملفات PNG للكاروسيل تتجاوزه بسهولة (استنتاج).
   - **المقترح:** رفع مباشر من المتصفّح إلى Bunny Storage برابط موقّع، أو ضغط في المتصفّح قبل الرفع، داخل `production-form.tsx:209-229`.
6. **رابط MP4 للفيديو ثابت على 720p** (`shared/lib/bunny-stream.ts:66-72`، ويُستدعى في `add-video-asset.ts:42-48`).
   - إن كان المصدر أقلّ من 720p، أو كان «MP4 fallback» مطفأً في المكتبة، فالمعاينة والتحميل يعطيان 404 (استنتاج).
   - **المقترح:** تخزين `bestRendition` أو `playbackUrl` (HLS) للعرض في `add-video-asset.ts` و`components/asset-media.tsx`.

### P2

7. **المنشور المؤرشف ما زال يقبل الانتقالات والتعديل.**
   - الحقل `archivedAt` يُقرأ (`transition-select.ts:18`) لكن لا يفحصه أي أكشن.
   - **المقترح:** شرط في `approve-post.ts` و`reject-post.ts` و`publish-post.ts` و`mark-ready-for-review.ts` و`update-post.ts`، أو في `require` مشترك.
8. **روابط قنوات محذوفة تبقى ظاهرة.**
   - عند تعديل البريف وإزالة قناة، يبقى رابطها في `channelLinks` (`update-post.ts:38-54`)، ويظهر في الملخّص (`post-summary.tsx:38-39, 105-115`).
   - **المقترح:** تقليم `channelLinks` إلى القنوات الحالية داخل `update-post.ts`.
9. **فلتر لوحة العملاء لا يُحفظ** كما كان في القديم (`clients-view.tsx:40`). المقترح: `clients-view.tsx`.
10. **وثيقة المرجع غير موجودة.** الكود يشير إلى `documents/prd/content-calendar-admin-PRD.md` (`SCHEMA:5605`، `post-permissions.ts:4`)، والمجلّد `documents/prd/` غير موجود في هذا الفرع. القرارات «س٥ · س٧ · س١١ · س١٢ · س١٥» بلا مصدر مكتوب. المقترح: إضافة الوثيقة أو نقل القرارات إلى `documents/context/sessions/social-calendar.md`.
11. **موعد النشر بلا وقت يظهر في الملخّص كأنه منتصف الليل** (`post-summary.tsx:96-103` مع `riyadh-inputs-to-date.ts:11-13`). المقترح: عرض التاريخ وحده إذا كان الوقت 00:00 في `post-summary.tsx`.
12. **(مقصود، للتوثيق فقط)** سقط العرض العامّ `/view`، وإدارة العملاء، ولونهم ونوعهم، وأرشيف العملاء، والحذف النهائي للمنشور.

---

## ٨. ما لا يُحكم عليه من الكود وحده (يحتاج فحصاً حياً)

1. هل تتحدّث `useSearchParams` بعد `history.replaceState` في Next 16.3.4؟ الفلاتر والبحث معتمدان على ذلك (`calendar-table.tsx:154-160`، `gallery-client.tsx:80-84`).
2. تخطيط الصفحة الكامل بالهوامش السالبة `-m-4 h-[calc(100%+2rem)]` داخل إطار الأدمن (`[month]/page.tsx:60`)، والرأس اللاصق `-mx-4 -mt-4` (`sub-page-header.tsx:28`) على ١٢٨٠×٨٠٠.
3. رفع tus إلى Bunny Stream من أوّله لآخره. يشمل ذلك: وجود ملف `play_720p.mp4`، ووقت الترميز، وظهور الفيديو في المعرض والمعاينة.
4. رفع صورة قريبة من ٤MB على Vercel، وقراءة أبعادها (`readImageMeta` في `upload/route.ts:83-86`).
5. وصول تيليجرام في الإنتاج وشكل HTML فيه (`<blockquote>` والرابط)، ووصول الجرس لحظياً.
6. طبقة أزرار الصف عند المرور وعند التركيز بالكيبورد (`calendar-table.tsx:328`). القديم كان فيه خطأ معروف هو أن الطبقة تغطّي نص الفكرة (`OLD:TODO.md:55`).
7. الوضع الداكن، وترتيب Su..Sa في اتجاه RTL، وغياب خطأ الترطيب (hydration) في Tooltip (`nav-icon-links.tsx:11-13`).
8. سلوك كل دور بحسابات تجريبية (CREATIVE · SOCIAL · QC · SALES): ما يظهر من أزرار وما يرفضه الخادم.
9. تجميع لوحة العملاء على مجموعة فارغة أو جديدة `social_calendar_posts` (`get-calendar-clients.ts:35-47`).
10. هل يُراد ترحيل بيانات القديم أصلاً، وكم صفّاً وأصلاً سينتقل؟ يحتاج قراءة قاعدة `jbr-content`، وهو خارج نطاق هذا التقرير.
