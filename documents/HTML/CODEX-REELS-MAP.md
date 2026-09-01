# خريطة مسار الريلز — قراءة فقط

## الأخطر: أفعال تمس ريلاً حياً بلا حارس كافٍ

| المالك | الفعل | المرجع | الحارس / أثره |
|---|---|---|---|
| العميل (console) | حذف وسيط من مكتبة الوسائط | `console/app/(dashboard)/dashboard/media/actions/media-actions.ts:8-34` | يفحص ملكية الوسيط ثم `Article.count` فقط (`:18-29`)؛ لا يقرأ `inReels` أو `reelStatus`، ثم يحذف صف الريل (`:32-34`). |
| الأدمن | حذف وسيط من مكتبة الوسائط | `admin/app/(dashboard)/media/actions/delete-media.ts:14-83`; `can-delete-media.ts:17-67` | الحارس يفحص المقالات/شعار/hero/gallery فقط؛ لا يقرأ حقول الريل، ثم `db.media.delete` في `delete-media.ts:83`. |
| العميل (console) | حذف ريل من شاشة الريلز | `console/app/(dashboard)/dashboard/reels/actions/reels-actions.ts:234-260` | يملك الريل، لكنه إذا كان `PUBLISHED` ينقله بنفسه إلى `ARCHIVED` و`inReels:false` (`:250-257`)؛ ليس إذناً إدارياً. |

## ١. السكيما والحالات

### حقول Media الخاصة بالريل

| الحقل | المرجع | الكتاب / القرّاء |
|---|---|---|
| `inReels`, `reelStatus`, `reelUploadedBy`, `reelRejectionReason`, `reelSlug`, `reelApprovedAt`, `reelPublishedAt`, `reelRevealedAt` | `shared/prisma/schema/schema.prisma:1601-1612` | الإنشاء العميلي يكتب `inReels/PENDING_APPROVAL/CLIENT`: `console/.../reels-actions.ts:122-133`. الأدمن يقرأ الطابور: `admin/.../load-reels.ts:58-76`، ومدونتي لا تعرض إلا `PUBLISHED`: `modonty/lib/queries/get-reels-feed-page.ts:21` و`sitemap.ts:125-127`. |
| `bunnyVideoId`, `playbackUrl`, `mp4Url`, `thumbnailUrl` | `shared/prisma/schema/schema.prisma:1622-1628` | قارئ صفحة المشاهدة: `modonty/app/(fullscreen)/reels/[slug]/data/get-reel-by-slug.ts:46-77`؛ فحص/إصلاح Stream في الأدمن: `admin/.../repair-reel-media.ts:33-58`. |

### حالات ReelStatus

| الحالة | من يكتبها | من يقرأها |
|---|---|---|
| `DRAFT` | لا مسار كتابة وجد | معرّفة فقط في `schema.prisma:3630`؛ **كود ميت في السكيما**. |
| `PENDING_APPROVAL` | إنشاء العميل `console/.../reels-actions.ts:125-133`، وإعادة تقديم مرفوض `:198-208` | شاشة أدمن الحصر `admin/.../load-reels.ts:58-61`، وأفعال الاعتماد/الرفض `reel-approval.ts:66,151`. |
| `APPROVED` | لا مسار كتابة وجد؛ الاعتماد يقفز إلى `PUBLISHED` | محمي من تعديل العميل `console/.../reels-actions.ts:181-184`، ويظهر ضمن حجز العنوان `admin/.../load-reels.ts:14-16,90-95`. **كود ميت في السكيما**. |
| `PUBLISHED` | الأدمن فقط، `admin/.../reel-approval.ts:119-125` | feed/watch/sitemap: `modonty/app/(fullscreen)/reels/[slug]/data/get-reel-by-slug.ts:46-54` و`modonty/app/sitemap.ts:125-127`؛ العميل يكتشفه للحذف `console/.../reels-actions.ts:250-257`. |
| `REJECTED` | الأدمن، `admin/.../reel-approval.ts:149-159` | العميل يعيد إرساله `console/.../reels-actions.ts:198-208`; لم يُبنَ له تبويب أدمن مستقل. |
| `ARCHIVED` | العميل، `console/.../reels-actions.ts:250-257` | لا قائمة أدمن أو فعل استعادة وجد؛ يستثنيه feed لأن شرطه `PUBLISHED`. |

`ReelUploader.ADMIN` معرّف في `schema.prisma:3638-3641` ولا يوجد كاتب له في المسارات المقروءة؛ **قيمة ميتة**. `reelRevealedAt` معرّف (`:1612`) ولا يكتب مسار حالي؛ تعليق الاعتماد يؤكد أنه مؤجل (`admin/.../reel-approval.ts:9-11`).

## ٢. كل فعل حالة أو حذف

| التطبيق / المالك | الفعل | الحارس | هل يفحص المنشور؟ |
|---|---|---|---|
| console / العميل | إنشاء ريل | يكتب صف العميل فقط؛ `PENDING_APPROVAL` | لا ينطبق؛ ليس منشوراً: `reels-actions.ts:122-133`. |
| console / العميل | تعديل ريل | ملكية + `inReels`; يمنع `APPROVED/PUBLISHED` | نعم: `reels-actions.ts:175-184`. |
| console / العميل | حذف ريل | ملكية + `inReels` و`inGallery`; المنشور/المتفاعل يؤرشف | يراه لكنه لا يرفضه: `reels-actions.ts:234-259`. |
| admin / أدمن | اعتماد | `id + inReels + PENDING_APPROVAL` + فحوص عنوان/وسيط | لا يمس منشوراً؛ يكتب منشوراً: `reel-approval.ts:65-125`. |
| admin / أدمن | رفض | `id + inReels + PENDING_APPROVAL` | لا يمس منشوراً: `reel-approval.ts:149-159`. |
| admin / أدمن | حذف من معرض العميل | يقرأ `inReels/reelStatus` والتفاعل؛ المنشور يزيله من المعرض فقط | نعم: `client-galleries/actions/gallery-mutations.ts:87-105,116-119`. |
| admin / أدمن | حذف وسائط عام | `canDeleteMedia` بلا حقول الريل | لا: `media/actions/can-delete-media.ts:17-67`; الحذف `delete-media.ts:83`. |
| console / العميل | حذف وسائط عام | ملكية + صورة مقال فقط | لا: `dashboard/media/actions/media-actions.ts:8-34`. |

## ٣. فيديو Bunny

| المسار | النتيجة | المرجع |
|---|---|---|
| حذف العميل للريل المستقل غير المتفاعل | يحذف صف `Media` فقط؛ لا استدعاء `deleteStreamVideo` في الفعل | `console/.../reels-actions.ts:253-260` — **فيديو Bunny محتمل يتيم** إذا كان `bunnyVideoId` موجوداً. |
| حذف وسائط الأدمن | يحذف Bunny URL المرآة فقط ثم صف القاعدة؛ لا `deleteStreamVideo` | `admin/.../media/actions/delete-media.ts:58-83` — **Stream video محتمل يتيم**. |
| حذف وسائط العميل | يحذف صف القاعدة فقط | `console/.../media/actions/media-actions.ts:32-34` — **Stream video محتمل يتيم**. |
| حذف من gallery بالأدمن | يحذف `deleteBunnyUrl("reels", media.url)` ثم الصف | `admin/.../client-galleries/actions/gallery-mutations.ts:116-119`; لا يحسم من الكود هل هذا يغطي `bunnyVideoId`/Bunny Stream، لذا **يحتاج قياساً حيّاً**: صف Media بفيديو Stream ثم فحص لوحة Bunny Stream. |
| فيديو بلا صف | لا مسار حذف Stream منفرد وجد في التطبيقات الثلاثة | يحتاج قياساً حيّاً: قائمة Bunny Stream مقابل `Media.bunnyVideoId` في Mongo. |

## ٤. فجوة الأدمن والكونسول

| القدرة | الأدمن يملكها؟ | العميل يملكها؟ |
|---|---|---|
| يرى المنتظر | نعم، فقط `PENDING_APPROVAL`: `admin/.../load-reels.ts:58-61` | يرى ريله في مدير الريلز: `console/.../reels-actions.ts:175-179`. |
| يرى المنشور/المرفوض/المؤرشف | لا قائمة؛ counts فقط في الصفحة: `admin/app/(dashboard)/reels/page.tsx:21-23` | يرى صفه وحالته لإدارة التعديل/الحذف. |
| ينشر | نعم، approve → `PUBLISHED`: `admin/.../reel-approval.ts:119-125` | لا. |
| يرفض | نعم: `admin/.../reel-approval.ts:149-159` | لا؛ يعيد تقديم المرفوض فقط: `console/.../reels-actions.ts:198-208`. |
| يؤرشف منشوراً | لا | نعم: `console/.../reels-actions.ts:250-257`. |
| يحذف نهائياً | لا فعل ريل مخصص | نعم للريل غير المرئي/غير المتفاعل، لكن بلا حذف Stream: `console/.../reels-actions.ts:253-260`. |
| يستعيد المؤرشف | لا | لا مسار استعادة وجد. |
