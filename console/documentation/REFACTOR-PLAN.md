# REFACTOR-PLAN — console (`console/` فقط)

الفرع: `cloud/refactor-console` · المرجع: `documents/cloud/REFACTOR-TASK.md` · تاريخ الجرد: ٧ أكتوبر ٢٠٢٦.
القاعدة الحاكمة: نفس التطبيق بالضبط. لا تغيير في ناتج دالة أو استعلام أو `select` أو ترتيب أو كاش أو نص أو شكل أو رابط.

كل المسارات أدناه نسبية إلى `console/`. `D/` = `app/(dashboard)/dashboard/`.

---

## ٠. خط الأساس (قبل أي تعديل)

| القياس | القيمة | المصدر |
|---|---|---|
| ملفات `.ts/.tsx` (بلا `scripts/`) | ٣٨٢ | `find app components lib types` |
| أسطر `.ts/.tsx` | ٤٩٬٠٤٦ | `wc -l` |
| ملفات `.tsx` تخلط استعلام/جلب مع العرض | ١٦ | `grep db\.|prisma\.|await fetch(|findMany...` |
| ملفات > ٣٠٠ سطر | ٣٢ | `wc -l` |
| ملفات ميتة (`knip`) | ٢٣ (منها ٥ سكربتات يدوية في `scripts/` تُستثنى) | `knip-before.log` |
| تصديرات ميتة (`knip`) | ٧٠ دالة/ثابت + ١٢٧ نوع | `knip-before.log` |
| imports/متغيّرات غير مستعملة | ١٨ (`tsc --noUnusedLocals`) | `unused-locals.log` |
| `"use client"` | ١١٠ ملف | grep |
| imports عابرة للمسارات الشقيقة (sibling) | ٢٣ سطراً | `scan.py` |
| lib/ مستعمل من مسار واحد (يُنقل داخله) | ٢٨ ملفاً | import graph |
| `pnpm --filter ./console exec tsc --noEmit` | exit 0 | baseline |
| `pnpm --filter ./console build` | exit 0 (يحتاج `AUTH_SECRET` في البيئة — `lib/auth.ts:5` يرمي خطأ بدونه) | baseline |

---

## ١. الجرد — البند ١: `.tsx` يخلط المنطق بالعرض

### صفحات تستعلم مباشرةً (تنقل الاستعلامات إلى `helpers/` بجانبها، حرفياً)

| الملف | الأسطر | ما يُنقل |
|---|---|---|
| `D/articles/page.tsx` | 53-60, 66-73, 83-85 | `db.settings.findUnique`، `db.client.findUnique`، تنسيق `quotaResetDate`، فلتر `visibleArticles` |
| `D/documents/page.tsx` | 21-25, 30 | `db.clientDocument.findMany` → `helpers/get-client-documents.ts` |
| `D/gallery/page.tsx` | 22-46, 48-58 | `db.media.findMany` → `helpers/get-gallery-images.ts`؛ الـmap في 48-58 تحويل هويّة (نفس ٩ مفاتيح الـselect) |
| `D/page-content/page.tsx` | 19-37, 61-75 | `db.client.findUnique` → `helpers/get-page-content.ts`؛ `views`، `chrome` |
| `D/page.tsx` (الرئيسية) | 39-47, 87, 114-125, 135-141 | `Promise.all` مع `db.client.findUnique`؛ تسمية الفترة؛ خريطة النشاط→أيقونة؛ `Intl.DateTimeFormat` |
| `D/profile/page.tsx` | 18-56, 63-145, 151-186 | ثوابت `COMPLETENESS_SECTIONS`/`isFieldFilled`؛ استعلامات `Promise.all`؛ استعلام السلطات؛ حساب الاكتمال → `helpers/compute-profile-completeness.ts` |
| `D/seo/intake/page.tsx` | 21-30, 37-40 | استعلام؛ بذر `detectTech` |
| `D/settings/page.tsx` | 28-47, 54-69, 96-100 | `Promise.all` → `helpers/get-settings-data.ts`؛ بناء `subscription`؛ `Intl.DateTimeFormat` |
| `D/site-health/page.tsx` | 19-22, 27-29, 68-83 | `db.client.findUnique`؛ `targetUrl`؛ مكوّن `HealthReport` داخل الصفحة |
| `D/site-pages/[page]/page.tsx` | 16-26 | جدول `INTRO` → `helpers/page-intro.ts` |
| `D/subscribers/page.tsx` | 53-58, 114-120 | نِسَب `consentRate`/`churnedRate`؛ جدول `toneClasses` |
| `D/support/page.tsx` | 112-118 | جدول `toneClasses` |
| `D/analytics/page.tsx` | 51-77, 449-478, 594-774 | `parseDays`، `formatAvgTime`، `DAY_NAMES_SHORT`، `ctaTypeLabel`، ٨ مكوّنات فرعية داخل الصفحة |
| `app/(dashboard)/layout.tsx` | 61-98, 104-106, 112-125, 131-143 | ١٦ استعلاماً + `publicPageUrl` + اكتمال YMYL + كائن `subscription` → `helpers/get-dashboard-layout-data.ts` |
| `app/(preview)/site-preview/page.tsx` | 38, 41-71 | الجلب وبناء نموذج المعاينة → `helpers/build-preview-model.ts` |

### مكوّنات عميل فيها `fetch` أو حساب يُنقل إلى `helpers/`/`hooks/`

| الملف | الأسطر | ما يُنقل |
|---|---|---|
| `D/documents/components/my-documents.tsx` | 25, 100-120, 204-205 | `SUGGESTIONS`؛ رفع `fetch /api/upload-bunny`؛ `expired`/`isImage` |
| `D/page-content/components/image-field.tsx` | 26, 54-81 | `IMG_MAX_BYTES`؛ الرفع → `helpers/upload-to-bunny.ts` |
| `D/profile/components/license-upload.tsx` | 28-66 | `handleFile` (الرفع) |
| `D/reels/components/reels-manager.tsx` | 37-69, 85-107, 151-173, 219-238 | `MAX_BYTES`، `readImageSize`، `STATUS`، حمولة onUploaded، `pick`، حالة البطاقة |
| `D/settings/components/pull-address-panel.tsx` | 24, 61-64 | `API_BASE`، `sampleCode` |
| `D/settings/components/change-password-form.tsx` | 20-32, 197-216 | `gradePassword` → `helpers/grade-password.ts`؛ جدول `StrengthMeter` |
| `D/settings/components/telegram-card.tsx` | 46-55, 121-129, 352, 375-378 | `formatDate`؛ `setAllInGroup`؛ `groups`؛ حالة المجموعة |
| `D/my-site/components/site-builder.tsx` | 35-61, 100-143, 173-196, 220-230, 530-541 | `LOOK_TOOL`/`toolTitle`/`toolHint`/`DESKTOP`/`PHONE`؛ تأثيرات القياس → `hooks/use-stage-scale.ts`؛ حارس المغادرة → `hooks/use-unsaved-guard.ts`؛ باني `preview` |
| `D/page-content/components/page-content-editor.tsx` | 405-436 | `REPEATED_TAIL`، `DEFAULT_UNIT`، `BLOCK_UNIT`، `arCount` |
| `D/page-content/components/{services,team,credentials,achievements}-editor.tsx` | انظر البند ٣ | `EMPTY`/`persist`/`submit`/`remove`/`patch` |
| `D/page-faq/components/page-faq-manager.tsx` | 22-32, 37-39, 107-118 | `decode`؛ التجميع؛ الصف المتفائل |
| `D/profile/components/profile-form.tsx` | 22-49, 92-96, 250-284 | `DAY_ORDER`/`readHours`؛ `toDateStr`؛ حمولة `updateProfile` → `helpers/build-profile-payload.ts` |
| `D/profile/components/ymyl-section.tsx` | 56-59, 68-72, 80-82 | `config`، `filledCount`، `cleaned` |
| `D/seo/intake/components/intake-form.tsx` | 31-154, 268-310 | `YMYL_KEYWORDS`/`isYmylIndustry` (مكرّر مع `lib/ymyl.ts`)، ٩ جداول خيارات، `detectDefaultMarket`، `toggleArrayItem`، `counts`/`totals` |
| `D/seo/intake/components/dynamic-intake-form.tsx` | 20-87 | `ICONS`، `getAtPath`/`setAtPath`، `asString`/`asArray`/`asBool`، `detectDefaultMarket`، `questionConfig`، `isFilled` |
| `D/leads/components/leads-table.tsx` | 42-127, 172-181 | `PAGE_LIMIT`، `formatDate`، `formatDateTime`، `levelMeta`، `csvEscape`، `buildCsv`؛ تنزيل CSV → `helpers/download-csv.ts` |
| `D/leads/components/kpi-info-card.tsx` | 27-33, 55-61 | `ICONS`، `toneClasses` |
| `D/media/components/media-gallery.tsx` | 19-22, 49-55 | `formatDimensions`، `getFormatLabel` |
| `D/questions/components/questions-table.tsx` | 47-83 | `formatDateTime`، `statusMeta`، `sourceLabel` |
| `D/bookings/components/bookings-list.tsx` | 51-91, 144-163 | `formatDateTime`، `waNumber`، `geoText`، `sourceLabel`، `statusMeta`؛ منطق التحديد → `hooks/use-selection.ts` |
| `D/comments/components/comments-table.tsx` | 55-90, 134-154 | `formatDateTime`، `statusMeta`؛ منطق التحديد |
| `D/faqs/components/faqs-table.tsx` | 54-100, 142-162 | `formatDate`، `formatDateTime`، `statusMeta`، `sourceMeta`؛ منطق التحديد |
| `D/client-comments/components/client-comments-table.tsx` | 35-53 | `fmt`، `statusMeta` |
| `D/client-reviews/components/client-reviews-table.tsx` | 33-51 | `fmt`، `statusMeta` |
| `D/subscribers/components/subscribers-table.tsx` | 47-67, 106-130, 204-212 | `PAGE_LIMIT`/`formatDate`/`formatDateTime`؛ التحديد؛ تنزيل CSV |
| `D/support/components/messages-list.tsx` | 53-87, 128-148 | `formatDateTime`/`decodeReferrer`/`statusMeta`؛ التحديد |
| `D/articles/components/article-card.tsx` | 25-33, 73-109 | `READING_WORDS_PER_MINUTE`/`formatDate`؛ معالجات القرار → `hooks/use-article-decision.ts` |
| `D/articles/components/article-preview-client.tsx` | 33-45, 49-86, 225-239 | `useExpandedSections`؛ معالجات القرار؛ ثابت صنف prose |
| `D/articles/components/articles-page-client.tsx` | 50-100, 169-177 | بناء `tabs`؛ رسالة الفراغ |
| `D/analytics/components/ga4-deep-dive-card.tsx` | 12-21, 59-69 | `DAY_NAMES_AR`، `formatNumber`، `pct`، `SOURCE_LABEL_AR` |
| `D/analytics/components/ga4-realtime-card.tsx` | 6-36 | `EVENT_LABEL_AR`، `arLabel`، `formatNumber` |
| `D/gallery/components/gallery-manager.tsx` | 39-91 | `REELS_RATIO`/`reelFit`/`REEL_STATE_LABEL`/`MAX_BYTES`/`readSize` |
| `D/site-health/components/{category-section,pagespeed-card,score-hero}.tsx` | 16-39, 56-62 / 6-11, 94-95 / 6-33, 105-112 | جداول الألوان والعناوين، `scoreColor`، `colorFor`، `formatTime`، `categoryLabel` |
| `D/components/{dashboard-overview,journey-strip,overview-charts,traffic-chart,account-notice}.tsx` | 22-34, 83-87 / 79-95 / 24-32 / 19-35 / 28-43 | سلسلة الأيام اليومية، `articlesAr`، نسبة النمو، ثيم المخططات، `sourceLabel`، جداول `TONES` |
| `app/(dashboard)/components/{dashboard-header,sidebar,mobile-sidebar,public-page-link,android-app-banner,sidebar-groups}.tsx` | 19-61 / 66-80 / 75-89 / 32-39 / 16-26 / 13-15 | `routeLabels`/`getNavTitle`، `navCounts`، `readableSlug`، `detectDevice`، `isHrefActive` |
| `app/help/console/{SalesPitchOverlay,ConsoleTourClient,LogoSpotlight}.tsx` | 19-51, 91-111, 195-247, 419-423 / 21-85, 231-233 / 21-55 | أنواع المانيفست، `stripTashkeel`، `loadManifest`، `highlightIndices`، `pickArabicVoice`، `formatTime` / جداول الأولوية والخطوات / `splitIntoPhrases` |
| `components/error-view.tsx` | 51-68 | `fetch` الإبلاغ عن الخطأ → hook |
| `components/media/video-upload.tsx` | 28-30, 62-121, 232-248 | الثوابت، `megabytes`، `probeVideo`، `rejectionReason`، `waitForEncoding` |

---

## ٢. الجرد — البند ٢: الكود الميت (`knip` + `grep`)

### ملفات بلا أي مستورد (تُحذف)

| الملف | أسطر | knip | grep |
|---|---|---|---|
| `D/analytics/components/analytics-stat-card.tsx` | 52 | unused file | 0 |
| `D/analytics/helpers/analytics-queries.ts` | 31 | unused file | 0 |
| `D/campaigns/components/campaigns-table.tsx` | 116 | unused file | 0 |
| `D/campaigns/components/utm-table.tsx` | 80 | unused file | 0 |
| `D/campaigns/helpers/campaign-queries.ts` | 172 | unused file | 0 |
| `D/media/actions/media-actions.ts` | 136 | unused file | 0 (ذكر في تعليق `lib/my-site/block-source.ts:15` فقط) |
| `D/my-site/components/my-site-editor.tsx` | 217 | unused file | 0 |
| `D/my-site/components/site-address-settings.tsx` | — | unused file | مستورده الوحيد `my-site-editor` الميت |
| `D/my-site/components/template-radio-picker.tsx` | — | unused file | مستورده الوحيد `my-site-editor` الميت |
| `components/ui/radio-group.tsx` | — | unused file | مستورده الوحيد `template-radio-picker` الميت |
| `D/profile/components/profile-url-bar.tsx` | 46 | unused file | 0 |
| `components/ui/info-help.tsx` | 40 | unused file | 0 |
| `components/ui/tabs.tsx` | 57 | unused file | 0 (الكلمة `tabs` تظهر في تعليقات فقط) |
| `lib/messages/en.ts` | 44 | unused file | 0 |
| `lib/mobile-api/push.ts` | 56 | unused file | 0 |
| `lib/my-site/build-page-block-rows.ts` | 32 | unused file | 0 |
| `lib/push/notify-client.ts` | 5 | unused file | 0 (تعليقه نفسه يقول «يُحذف») |

**لا يُحذف رغم أن knip يعدّه ميتاً:**
- `D/profile/components/cloudinary-license-upload.tsx` — Khalid ثبّته (٣٠ يوليو ٢٠٢٦) «tripwire، لا يُحذف». قرار المالك.
- `scripts/{check-campaign,check-contact-msg,find-kima,find-kima-article,reset-campaign}.ts` — سكربتات تُشغَّل يدوياً بـ`tsx`، ليست وحدات مستورَدة بطبيعتها.

### تصديرات ميتة (دوال/ثوابت) — تُحذف

| الملف:سطر | الاسم |
|---|---|
| `D/analytics/helpers/client-views-queries.ts:54` | `getClientViewsTrend` |
| `D/analytics/helpers/enhanced-analytics-queries.ts:64, 241, 318` | `getTrafficSources`، `getConversions`، `getArticlePerformance` (+ أنواعها 4-8, 36-41, 53-62) |
| `D/analytics/helpers/link-clicks-queries.ts:60` | `getLinkClickStats` |
| `D/faqs/helpers/faq-queries.ts:90` | `getFaqsLastActivity` |
| `D/media/helpers/media-queries.ts:75, 92, 115, 130` | `getMediaUsageCount`، `getMediaUsageDetails`، `getClientBrandingMedia`، `getMediaStats` |
| `D/seo/actions/seo-actions.ts:86, 155` | `listCompetitors`، `listKeywords` |
| `D/seo/intake/lib/intake-types.ts:109` | `EMPTY_INTAKE` |
| `app/help/data/sections.ts:37` | `sections` (والأنواع `Step`/`Callout`/`Section`؛ يبقى `Hotspot`) |
| `app/help/data/platform-capabilities.ts:285` | `realTimeMetrics` |
| `lib/analytics/events-registry.ts:112, 160-208` | `GA4_EVENTS` وكل `track*` عدا `trackCampaignInterest` |
| `lib/analytics/ga4-data-api.ts:121, 341` | تصدير `runReport`، `OUR_EVENTS` (يبقيان داخليين) |
| `lib/analytics/ga4-server.ts:141` | `sendGA4EventAwait` |
| `lib/analytics/visitor-cookie.ts:38, 68` | `getOrCreateVisitorId`، `getSessionId` |
| `lib/auth.ts:8` | تصدير `signIn`، `signOut` (يبقيان في التفكيك بلا `export`؟ — لا: `NextAuth()` يعيدهما؛ يُحذف الاسمان من التصدير فقط) |
| `lib/lead-scoring/compute.ts:327` | `upsertLeadScoring` |
| `lib/messages/index.ts:2, 17, 21, 25` | `validationMessages`، `getErrorMessage`، `getSuccessMessage`، `getErrorMessageByKey`، `getConfirmMessage` |
| `lib/messages/validation.ts:4, 15` | الملف كله يصبح بلا مستهلك بعد السابق → يُحذف |
| `lib/messages/ar.ts:8-15, 32-37` | `success`، `confirm` (لا يُقرأ إلا `messages.error`) |
| `lib/ar.ts:356-363, 1478-1483` | `content`، `errors` |
| `lib/mobile-api/login-throttle.ts:13` | تصدير `LOGIN_THROTTLE_WINDOW_SECONDS` |
| `lib/my-site/build-page-view.ts:78` | `head()` (محلّي غير مستعمل) |
| `lib/seo/ymyl-helpers.ts:21, 27, 33, 54, 157, 183` | `getYmylConfig`، `getRequiredYmylFields`، `getAuthorityOptions`، `resolveYmylSchemaType`، `findForbiddenClaims`، `checkYmylPublishGate` (ما يُستعمل داخلياً يبقى بلا `export`) |
| `lib/subscription/resolve-account-notice.ts:28` | تصدير `arAccountDate` (مستعمل داخلياً فقط) |
| `D/bookings/components/bookings-list.tsx:62-69` | `toDatetimeLocal` (محلّي) |
| `D/articles/components/article-card.tsx:65-71` | `viewUrl`، `viewTarget`، `viewRel` (محلّية) |

### أنواع مصدَّرة بلا مستورد خارجي (١٢٧ — `knip`)
تُحذف كلمة `export` عنها إن كانت مستعملة داخل ملفها، وتُحذف كلياً إن لم تُستعمل. **استثناء:** `components/ui/*` (shadcn: `ButtonProps`، `InputProps`، `TextareaProps`، `BadgeProps`، `DialogPortal/Overlay/Trigger/Close`، `SheetPortal/Overlay/Trigger/Close/Footer`، `SelectGroup`، `badgeVariants`، `buttonVariants`) تبقى كما هي — واجهة shadcn القياسية، وحذفها يخالف مهارة `shadcn`. تُذكر في التقرير.

### imports ومتغيّرات غير مستعملة (البند ٥)
`enhanced-analytics-queries.ts:2` · `articles/[articleId]/page.tsx:14 BarChart3` · `article-card.tsx:4 mediaSrc` · `article-preview-client.tsx:10-12, 21` · `media-actions.ts:5` (يُحذف الملف) · `keywords-tab.tsx:10 Textarea` · `api/v1/sites/[siteId]/sitemap.xml/route.ts:41 request` · `ConsoleTourClient.tsx:12 ArrowLeft` · `components/ui/select.tsx:5 ChevronUp` · `build-page-view.ts:78 head` · `ymyl-helpers.ts:15 YmylCategory` · `profile-actions.ts:251 catch (_e)` · `article-actions.ts:61, 98 catch (error)` غير مقروء · `subscribers-table.tsx:132-133` تعليق يتيم · `public-page-link.tsx:107-108` تعليق مكرّر.

---

## ٣. الجرد — البند ٣: المكرّر (متطابق سلوكاً = يُدمج؛ مختلف = لا)

| الدالة | النسخ المتطابقة | الوجهة |
|---|---|---|
| `getClientId()` (جلسة → `clientId ?? null`) | ١٧ ملف actions: articles, bookings, client-comments, client-reviews, comments, faqs, gallery, page-faq, questions, reels, settings×3, support, videos, page-content/intro-video + `sessionClientId` في seo/documents + `getCurrentClientId` في subscribers | `lib/get-session-client-id.ts` |
| `buildReelSlug()` | `reels-actions.ts:69`، `video-actions.ts:39`، `gallery-actions.ts:59` | `lib/build-reel-slug.ts` |
| `formatDateTime()` (nullable → «—») | bookings-list:51، comments-table:55، faqs-table:63، leads-table:53، questions-table:47، subscribers-table:58، messages-list:53 | `lib/format-date-time.ts` |
| `formatDate()` (nullable → «—») | subscribers-table:49، leads-table:44، faqs-table:54، `lib/subscription.ts:84 formatSubscriptionDate` | `lib/format-date.ts` |
| `fmt()` (غير nullable) | client-comments-table:35، client-reviews-table:33 | `lib/format-date-time-value.ts` — **لا** يُدمج مع `formatDateTime` (يختلف في الحارس) |
| `statusMeta(CommentStatus)` | client-comments-table:45، client-reviews-table:43 | `lib/client-feedback-status-meta.ts` |
| `FilterPill` | client-comments-table:234، client-reviews-table:239 | `components/shared/feedback-filter-pill.tsx` — باقي نسخ FilterPill (bookings/comments/faqs/leads/questions/subscribers/support) تختلف في خريطة الألوان → **لا تُدمج** |
| `run(id, fn, msg)` | client-comments-table:87، client-reviews-table:100 | `lib/run-feedback-action.ts`؟ — يعتمد على `useTransition` المحلّي؛ يُدمج كـhook في `lib/hooks/use-run-with-toast.ts` |
| منطق التحديد (`allFilteredSelected`…`toggleOne`) | bookings-list:144، comments-table:134، faqs-table:142، subscribers-table:106، messages-list:128 | `lib/hooks/use-selection.ts` (اختلاف اسم متغيّر الحلقة فقط) |
| `Section` (غلاف الشيت) | bookings-list:678، comments-table:815، faqs-table:866، leads-table:587، questions-table:598، kpi-info-card:172، subscribers-table:718، messages-list:834 | `components/shared/sheet-section.tsx` بعد مقارنة بايت-بايت؛ ما يختلف يبقى |
| `Field` | comments-table:832، faqs-table:883، leads-table:598، questions-table:615، subscribers-table:735، messages-list:851 (bookings يضيف `dir`) | `components/shared/sheet-field.tsx` بنفس الشرط |
| `clean()` | page-content/actions/update-{services,credentials,achievements,team}.ts | `D/page-content/helpers/clean.ts` |
| `DialogField` | services/team/credentials/achievements-editor | `D/page-content/components/dialog-field.tsx` |
| `LABEL_MAX=52`/`DESC_MAX=250` | update-achievements.ts:16، achievements-editor.tsx:32 | `D/page-content/helpers/achievement-limits.ts` |
| `PAGE_LIMIT=200` | lead-queries:37/leads-table:42؛ subscriber-queries:26/subscribers-table:47 | ملف ثابت بلا `db` في `helpers/` لكل مسار |
| `detectDefaultMarket()` | intake-form:143، dynamic-intake-form:62 | `D/seo/intake/helpers/detect-default-market.ts` |
| `YMYL_KEYWORDS`+`isYmylIndustry` | intake-form:31-45 ≡ `seo/intake/lib/ymyl.ts` | يُستورد من `ymyl.ts` |
| `Pill` | intake-form:156، dynamic-intake-form:89 | `D/seo/intake/components/pill.tsx` |
| `DAY_NAMES_AR` | ga4-deep-dive-card:12، insights-queries:165 | `D/analytics/helpers/day-names-ar.ts` |
| include+map تعليقات المقال | article-stats-queries:42-71 ≡ comment-queries:75-118 | `lib/comments/…` (يُستعمل من مسارين) |
| `getTrafficSources` | dashboard-queries:17 ≡ enhanced-analytics:64 | نسخة enhanced ميتة → تُحذف (البند ٢) |
| كتلة الشعار + `navCounts` | sidebar:112-127/66-80 ≡ mobile-sidebar:101-116/75-89 | `app/(dashboard)/components/sidebar-logo.tsx` + `helpers/build-nav-counts.ts` |
| جداول حالة الاشتراك (mobile API) | api/mobile/v1/dashboard/route.ts:10-12 ≡ subscription/route.ts:13-15 | `app/api/mobile/v1/helpers/subscription-status-labels.ts` |
| `VideoUploadTicket`، `MIN_DURATION_SEC` | video-actions:48/31 ≡ video-upload:32/28 | نوع واحد في `components/media/` |
| `Hotspot` style builder | Hotspot.tsx:13 ≡ ConsoleTourClient:231 | `app/help/helpers/hotspot-style.ts` |
| `replyToQuestion` ≡ `approveFaq` | question-actions:18، faq-actions:32 | **لا يُدمج**: اسمان مختلفان لإجراءي خادم في مسارين؛ كلاهما يفوّض إلى `publishFaqAnswer` أصلاً |
| `csvEscape` | leads-table:92، subscriber-actions | يُقارن؛ يُدمج إن تطابق |
| `BLOCKS_PAGES`/`isBlocksPage` | site-pages/helpers/blocks-pages.ts ≠ lib/my-site/page-keys.ts | **لا**: `isBlocksPage` يختلف |
| `SITE_PAGES` ≠ `PAGE_LABELS` | `book`: «الحجز» ≠ «احجز» | **لا** |

---

## ٤. الجرد — البند ٤: الملفات > ٣٠٠ سطر (٣٢)

| الملف | أسطر | التقسيم (نقل حرفي) |
|---|---|---|
| `lib/ar.ts` | 1484 | `lib/ar/<section>.ts` لكل مفتاح علوي (٢٧ قسماً: login 22-46 · nav 61-101 · dashboard 107-236 · articles 238-354 · media · analytics 396-530 · leads · subscribers · campaigns · comments · faqs · questions · bookings · support · profile · seo · settings · telegram · articleStats …) و`lib/ar.ts` يجمعها بنفس الترتيب `{ ...}` ويبقى `as const` |
| `D/seo/intake/components/intake-form.tsx` | 989 | `helpers/intake-options.ts` (47-139)، `helpers/count-intake-fields.ts` (268-310)، `components/intake-sections/*.tsx` (375-960: voice, audience, content-focus, policy, gbp, business-brief, story, customers, strategy, competition, ymyl-reviewer)، `save-bar.tsx` (962-986) |
| `app/help/console/SalesPitchOverlay.tsx` | 902 | `helpers/` (أنواع 19-47، 49-51، 195-223، 419-423)، `hooks/use-sales-pitch-player.ts` (70-417)، `components/` (476-560، 563-663، 665-748، 751-875) |
| `D/faqs/components/faqs-table.tsx` | 900 | helpers 54-100؛ hooks 142-274؛ components: filter-pill 429-469، faq-row 471-660، row-buttons 662-742، empty-state 744-784، faq-detail-sheet 788-864 |
| `D/comments/components/comments-table.tsx` | 871 | helpers 55-90؛ hooks 134-234؛ components: filter-pill 397-437، comment-row 439-576، row-buttons 578-654، empty-state 656-698، comment-detail-sheet 702-813، mini-stat 853-871 |
| `D/support/components/messages-list.tsx` | 870 | helpers 53-87؛ hooks 101-148؛ components: filter-pill 372-413، message-row 415-525، row-actions 527-627، empty-state 629-668، message-detail-sheet 672-832 |
| `D/analytics/page.tsx` | 774 | helpers 51-77, 765-774؛ components 559-763 (٨ مكوّنات)؛ أقسام الصفحة 154-552 كمكوّنات تأخذ البيانات props |
| `D/subscribers/components/subscribers-table.tsx` | 752 | helpers 47-67, 204-212؛ components: filter-pill 446-476، status-badge 478-494، consent-badge 496-512، icon-button 514-546، empty-state 548-592، subscriber-detail-sheet 596-716 |
| `D/bookings/components/bookings-list.tsx` | 696 | helpers 51-91؛ hooks 144-163؛ components: channel-pill 321-354، filter-pill 356-390، booking-row 392-507، empty-state 509-539، booking-detail-sheet 541-676 |
| `D/leads/components/leads-table.tsx` | 642 | helpers 44-127؛ components: filter-pill 363-404، score-bar 406-424، empty-state 426-468، lead-detail-sheet 470-642 |
| `D/questions/components/questions-table.tsx` | 634 | helpers 47-83؛ components: filter-pill 255-295، question-row 297-458، empty-state 460-502، question-detail-sheet 504-634 |
| `D/profile/components/profile-form.tsx` | 614 | helpers 22-49, 92-96, 250-284؛ components: section-header 98-132، readonly-row 134-164، verified-info-card 349-378، business-hours-card 526-585، save-bar 587-611 |
| `D/articles/components/article-preview-client.tsx` | 599 | hooks 33-45, 49-86؛ components لكل بطاقة 121-579 (١٤ بطاقة) |
| `D/page-content/components/page-content-editor.tsx` | 589 | components: intro-video-section 128-287، source-tag 289-321، header-sketch 323-361، hero-sketch 363-398، page-view 438-587؛ helpers 405-436 |
| `D/my-site/components/site-builder.tsx` | 583 | helpers 29-61؛ components: missing-list 369-406، panel-group 408-417، device-frame 419-463، color-choices 465-509، shape-choices 511-583 |
| `D/articles/helpers/article-queries.ts` | 513 | دالة لكل ملف: article-list-include 10-83، النوع 85-243، get-pending-articles، get-published-articles، get-all-articles، get-site-articles، get-article-for-approval، can-see-site-articles، get-monthly-published-count، get-pending-articles-count + `index.ts` |
| `app/help/console/tour-config.ts` | 502 | tour-types 1-45، tour-stops-start 47-174، tour-stops-content 176-302، tour-stops-audience 304-501؛ الملف الأصلي يجمعها بنفس الترتيب |
| `D/seo/intake/components/dynamic-intake-form.tsx` | 467 | helpers 37-87؛ components: pill 89-101، question-field 267-467 |
| `D/settings/components/telegram-card.tsx` | 440 | helpers 46-55؛ components 189-201، 203-286، 288-334، 336-440 |
| `D/campaigns/components/campaigns-teaser.tsx` | 426 | components: reach-card 267-327، step-card 329-354، feature-card 356-374، proof-card 376-426 |
| `D/reels/components/reels-manager.tsx` | 417 | helpers 39-69؛ components: video-cover-picker 143-191، reel-card 193-417 |
| `app/help/data/guide-v2.ts` | 412 | tier1-intro 12-38، tier2-client-page 40-106، tier3-engagement 108-229، tier4-console-pages 231-351، tier5-account 353-392، tiers 394-412 |
| `D/analytics/helpers/enhanced-analytics-queries.ts` | 383 | بعد حذف الميت: get-core-web-vitals، get-engagement-metrics، get-campaign-performance |
| `D/articles/components/article-card.tsx` | 363 | helpers 25-33؛ hooks 73-109؛ components 125-142، 147-182، 185-217، 237-265، 271-341 |
| `D/profile/actions/profile-actions.ts` | 353 | helpers 14-24 (بلا `"use server"`)؛ actions: update-profile 26-254، update-ymyl-data 256-317، accept-disclaimer 319-353 |
| `lib/analytics/ga4-data-api.ts` | 341 | (بعد نقله إلى analytics/helpers) ga4-auth 17-77، run-report 79-123، our-events 127-133، ودالة لكل ملف 135-339 |
| `lib/lead-scoring/compute.ts` | 332 | (بعد نقله إلى leads/helpers) types 1-57، compute-lead-scores-for-client 59-222، refresh-lead-scoring 224-324؛ 326-332 ميت |
| `components/media/video-upload.tsx` | 320 | video-upload-types 32-60، video-upload-rules 28-30/62-68/104-121، probe-video 78-102، use-video-upload 132-248 |
| `D/analytics/components/ga4-deep-dive-card.tsx` | 319 | helpers 12-21, 59-69؛ components 25-55، 71-107، 111-159، 163-212، 216-236، 240-269 |
| `app/help/console/ConsoleTourClient.tsx` | 314 | helpers 20-66, 71-85؛ components 165-191، 198-283 |
| `D/media/components/media-gallery.tsx` | 314 | helpers 19-22/49-55؛ components: filter-button 24-47، media-lightbox 218-311 |
| `D/gallery/components/gallery-manager.tsx` | 307 | helpers 30-71, 81-91؛ components: gallery-card 165-307 |

---

## ٥. الجرد — البند ٦: الـDOM

أعمق تعشيش: `client-comments-table.tsx:158` و`client-reviews-table.tsx:186` (١٠) · `leads-table.tsx:302` (١١) · `subscribers-table.tsx:388` (١٠) · `SalesPitchOverlay.tsx:601` (١٠) · `analytics/page.tsx:424`، `campaigns-table.tsx:69`، `invoices/page.tsx:126`، `overview-charts.tsx:57`، `app/page.tsx:101`، `HelpLanding.tsx:62` (٩).

فُحص كل `<div>`/`<span>` بلا خصائص (≈١٢٠ موضعاً). **الأغلبية داخل أب `flex`/`grid`/`space-y-*`، فإزالتها تغيّر التخطيط → لا تُلمس.** ما ثبت أنه متطابق بكسل-بكسل:

| الملف:سطر | الحالة | لماذا متطابق |
|---|---|---|
| `D/articles/components/articles-page-client.tsx:162` | `<div>` عارٍ يلفّ عنصراً واحداً داخل `div.space-y-6` | الابن الوحيد يأخذ نفس موضع الشقيق ونفس `margin-top` |
| `D/settings/components/change-password-form.tsx:107-118` | `div.space-y-2` بابن واحد (`PasswordField` كتلة) داخل `form.space-y-4` | `space-y` بلا أثر مع ابن واحد؛ الصنف لا يضيف شيئاً |
| `app/help/HelpClient.tsx:58-59` | `div` بأصناف → ابنه الوحيد `<main>` عارٍ | نقل الأصناف إلى `<main>` وحذف الـdiv: كلاهما block بلا تعارض |
| `D/subscribers/components/subscribers-table.tsx:730`، `D/support/components/messages-list.tsx:846` | `div.space-y-2` داخل `section.space-y-2` | نفس قيمة التباعد؛ الأبناء مباشرةً في section يعطي نفس الفراغات |
| `D/site-health/page.tsx:72` | جذر `HealthReport` هو `div.space-y-6` الوحيد داخل Suspense داخل `div.space-y-6` | إرجاع Fragment يعطي نفس التباعد؛ placeholder الـstreaming `[hidden]` يتجاهله `space-y` |

مرفوض بعد الفحص (يبقى): `D/documents/page.tsx:28`+`my-documents.tsx:41` (دمج عبر حدّ مكوّن)، `dashboard-layout-client.tsx:128`+`layout.tsx:150` (يغيّر هامش الإشعار الفارغ — تقرير فقط)، `ImageModal.tsx:57`، وكل div→div حيث الخارجي block والداخلي flex.

---

## ٦. الجرد — البند ٧: الهيكل (`.claude/rules/folder-structure.md`)

### استيراد من مسار شقيق (ممنوع) — ٢٣ سطراً

| المستورِد | المستورَد | الحل |
|---|---|---|
| `D/articles/[articleId]/page.tsx:18-19` | `comments/components/comments-table`، `questions/components/questions-table` | مسارين → `components/shared/comments-table/`، `components/shared/questions-table/` (مع تقسيمهما) |
| `D/articles/[articleId]/helpers/article-stats-queries.ts:2-3` | أنواع من comments/questions helpers | الأنواع تنتقل مع الدوال المرقّاة إلى `lib/` |
| `D/client-reviews/helpers/set-client-review-status.ts:5`، `D/gallery/actions/gallery-actions.ts:10`، `D/page-content/actions/*.ts ×5`، `D/page-faq/{actions,helpers}/*.ts ×2` | `profile/actions/regenerate-client-seo` | ٦ مسارات → `lib/regenerate-client-seo.ts` |
| `D/gallery/actions/gallery-actions.ts:11` | `reels/actions/notify-reel-pending` (`server-only` لا `use server`) | مسارين → `lib/notify-reel-pending.ts` |
| `D/reels/components/reels-manager.tsx:17-18` | `gallery/actions/setImageInReels`، `videos/actions/{removeVideoReel,setVideoCover}` | `ReelCard` مشترك بين reels وvideos → `components/shared/reel-card.tsx`؛ الإجراءات المشتركة → `lib/reels/actions/` (`"use server"`، مسارين) |
| `D/videos/components/videos-manager.tsx:7-8` | `reels/components/reels-manager ReelCard`، `reels/actions ClientReel` | كما فوق؛ النوع `ClientReel` → `lib/reels/client-reel.ts` |
| `D/videos/page.tsx:5` | `reels/helpers/reel-queries getClientReels` | مسارين → `lib/reels/get-client-reels.ts` |
| `app/page.tsx:5` | `(auth)/login/components/login-form` | المستهلك الوحيد هو الجذر → `app/components/login-form.tsx` |

### الأب يستورد من ابنه (ممنوع)

| المستورِد | المستورَد | الحل |
|---|---|---|
| `app/(dashboard)/layout.tsx:23-38` | `dashboard/components/account-notice` + ١٤ دالة عدّ من articles/comments/questions/subscribers/leads/bookings/support/faqs/page-faq/client-comments/client-reviews/reels | `account-notice.tsx` → `app/(dashboard)/components/`؛ دوال العدّ المستعملة من الـlayout ومسارها → `lib/nav-counts/<get-x-count>.ts` |
| `D/page.tsx:10-12` | helpers من articles/comments/support | نفس الترقية إلى `lib/` |

### `api/` يستورد من مسارات اللوحة

`notify-article-decision` (articles)، `set-comment-status` (comments)، `set-client-review-status` (client-reviews)، `update-client-page-faq` (page-faq)، `get-client-google-performance`، `get-site-activity` (dashboard home) → `lib/` (كلٌّ مستعمل من مسارين).

### `lib/` مستعمل من مسار واحد (يُنقل داخله)

| الملف | المسار الوحيد | الوجهة |
|---|---|---|
| `lib/analytics/ga4-data-api.ts` | analytics | `D/analytics/helpers/ga4/` |
| `lib/analytics/{events-registry,ga4-server,visitor-cookie}.ts` | campaigns (فقط `trackCampaignInterest`) | `D/campaigns/helpers/` |
| `lib/telegram/notify.ts` | campaigns | `D/campaigns/helpers/` |
| `lib/google/{get-client-page-paths,get-google-report-url,sign-google-report-key}.ts` | dashboard home | `D/helpers/` |
| `lib/google/{get-client-search-rows,verify-google-report-key}.ts` | api/google-report | `app/api/google-report/helpers/` (sign/verify يتغيّران معاً — يُذكر) |
| `lib/health/{aggregator,dns,domain,headers,meta,schema-check,ssl,pagespeed}.ts` | site-health | `D/site-health/helpers/health/` (robots/sitemap/types تبقى: settings يستعملها) |
| `lib/lead-scoring/compute.ts` | leads | `D/leads/helpers/lead-scoring/` |
| `lib/media/generate-blur.ts`، `lib/utils/sharp-loader.ts` | api/upload-bunny | `app/api/upload-bunny/helpers/` |
| `lib/mobile-api/{arabic-format,booking-status,client-inbox,http,login-throttle,params,request}.ts` | api/mobile | `app/api/mobile/v1/helpers/` (`auth.ts`، `article-decisions.ts` تبقى: settings/articles تستعملهما) |
| `lib/my-site/build-missing-data.ts` | my-site | `D/my-site/helpers/` |
| `lib/my-site/build-page-view.ts` | page-content | `D/page-content/helpers/` |
| `lib/my-site/build-preview-chrome.ts` | (preview) | `app/(preview)/site-preview/helpers/` |
| `lib/my-site/save-hidden-blocks.ts` (`"use server"`) | site-pages | `D/site-pages/actions/` |
| `components/gtm/GTMContainer.tsx` | app/layout | `app/components/gtm-container.tsx` |
| `components/error-view.tsx` | ٣ مستهلكين | `components/shared/error-view.tsx` |
| `components/media/video-upload.tsx` | videos + page-content | `components/shared/video-upload/` |

### مخالفات أخرى
- `D/seo/intake/lib/` → `helpers/`.
- `app/api/v1/_lib/` → `app/api/v1/helpers/` (لا underscore).
- ملفات `*-queries.ts` ذات الدوال المتعدّدة (٢٠ ملفاً) → دالة لكل ملف + `index.ts`.
- ملفات مكوّنات في جذر المسار بدل `components/`: `app/help/{HelpClient,HelpLanding}.tsx`، `app/help/console/{ConsoleTourClient,LogoSpotlight,SalesPitchOverlay,SalesPitchPlayer}.tsx`.
- helpers في `components/`: `app/(dashboard)/components/{nav-config,site-pages,site-page-tools}.ts`، `use-confirm.tsx` (hook مستعمل من ٩ مسارات → `lib/hooks/use-confirm.tsx`)، `app/help/console/tour-config.ts`.
- **تعارض قاعدتين (لا يُنفَّذ، للقرار):** `folder-structure.md` يرسم `actions.ts` ملفاً واحداً للمسار، وقاعدة «دالة لكل ملف» تطلب العكس. المشروع كله يستعمل مجلّد `actions/`. يُبقى على `actions/` كما هو، وتُقسَّم فقط ملفات الإجراءات > ٣٠٠ سطر.
- **ينتمي لـ`shared/` (يُكتب ولا يُنقل):** `lib/db.ts` (مطابق لـ`admin/lib/db.ts`)، `lib/analytics/ga4-data-api.ts` (نسخة مختلفة في admin)، `events-registry/ga4-server/visitor-cookie` (نسخ في modonty).

---

## ٧. الجرد — البند ٨: أفضل الممارسات

### (أ) يُصلَح — لا يغيّر الناتج
- ثوابت داخل جسم المكوّن لا تعتمد على props/state → تُرفع خارجه حرفياً: `analytics/page.tsx:594-599, 703-708, 745-749`؛ `bookings/page.tsx:72-79`؛ `bookings-list.tsx:371-376`؛ `campaigns-teaser.tsx:35, 288-292, 392-403`؛ `client-comments/page.tsx:65-71`؛ `client-comments-table.tsx:249-254`؛ `client-reviews/page.tsx:76-82`؛ `client-reviews-table.tsx:254-259`؛ `comments/page.tsx:107-113`؛ `comments-table.tsx:412-416`؛ `faqs/page.tsx:107-113`؛ `faqs-table.tsx:444-448`؛ `kpi-info-card.tsx:55-61`؛ `questions/page.tsx:104-109`؛ `leads-table.tsx:378-383`؛ `questions-table.tsx:270-274`؛ `site-builder.tsx:532`؛ `profile/page.tsx:162`؛ `profile-form.tsx:227-230`؛ `seo-readiness-button.tsx:31-45`؛ `profile-completeness-button.tsx:47-55`؛ `change-password-form.tsx:197-216`؛ `subscribers/page.tsx:114-120`؛ `support/page.tsx:112-118`؛ `messages-list.tsx:387-392`؛ `telegram-card.tsx:352`؛ `traffic-chart.tsx:39-41, 51-55`؛ `SalesPitchOverlay.tsx:89, 201-203, 419-423`؛ `(dashboard)/layout.tsx:104`؛ `first-time-welcome.tsx:59`؛ `HeroV2.tsx:13`؛ `videos-manager.tsx:34-38`؛ `ga4-realtime-card.tsx:99` (`max` ثابت داخل map).
- `import type` لما يُستعمل كنوع فقط في ملفات عميل: `client-comments-table.tsx:5`، `client-reviews-table.tsx:5`، `comments-table.tsx:35`، `subscribers-table.tsx:30`.
- JSX متطابق في فرعين → فرع واحد: `article-card.tsx:273-278≡291-296`؛ `faqs-table.tsx:714-723≡730-739`؛ `login-form.tsx:81` (`"space-y-4":"space-y-4"`)؛ `public-page-link.tsx:160` (`"h-8 w-8":"h-8 w-8"`)؛ `public-page-link.tsx:81-91≡120-130`؛ `messages-list.tsx:563-573≡614-624`؛ `SalesPitchOverlay.tsx:591-618≡631-658`؛ `dashboard-header.tsx:153-157≡172-176≡191-195`.
- تعليقات في غير مكانها: `comment-queries.ts:145-148`، `faq-queries.ts:35-39`، `page-content-editor.tsx:400-416, 589`، `api/mobile/v1/audience/route.ts:19`، `api/mobile/v1/me/notifications/route.ts:9-10`.
- أسطر فارغة مكرّرة: `gallery/page.tsx:5-6`، `site-builder.tsx:85-86`، `page-faq-actions.ts:18-19`، `page-blocks-editor.tsx:14-15`، `SalesPitchOverlay.tsx:112-113`، `api/mobile/v1/subscription/route.ts:16-18`.
- import في وسط الملف: `help/data/guide-v2.ts:357-358`.
- `catch (e)` غير مقروء → `catch`.
- أصناف Tailwind بلا أثر (لا تولّد CSS في 3.4.1): `score-hero.tsx:82 sm:grid-cols-2` (مكرّر مع `grid-cols-2`)، `site-tool-button.tsx:59, 72 inset-inline-end-[-4px]`، `site-health/page.tsx:45 dir-ltr` — **لا تُلمس** (قد تكون مقصودة لاحقاً؛ تُذكر في التقرير).
- التسمية (`modonty-naming`): كلمات ممنوعة Manager/Section/Enhanced/Widget/Overlay/Strip/Panel/V2 في ١٥ ملفاً — **تُؤجَّل**: إعادة تسمية الملفات غير مطلوبة في الثمانية إلا ضمن البند ٥ «أسماء محلّية داخل الملف». الأسماء المحلّية غير الواضحة تُحسَّن داخل الملف فقط (`fmt`، `run`، `s`، `a`).

### (ب) يغيّر السلوك/الأداء — تقرير فقط، لا يُنفَّذ (للقرار)
- **`"use client"` قابل للإزالة بعد التحقّق من كل import** (يغيّر الحدّ خادم/عميل والحزمة، لا الـHTML): `app/(dashboard)/components/site-tool-button.tsx:1`، `app/components/providers/providers.tsx:1`، `app/help/components/v2/Tier3Engagement.tsx:1`.
- **تحميل/أخطاء:** لا `loading.tsx` في ٢٥ مساراً من ٢٨ (موجود فقط في `articles/[articleId]`، `my-site`، `reels`، `videos`)؛ `my-site/loading.tsx` لا يطابق الصفحة.
- **شلالات await متسلسلة قابلة لـ`Promise.all`:** `enhanced-analytics-queries.ts:167-199`؛ `register-interest.ts:45-54`؛ `(dashboard)/layout.tsx:112-114`؛ `api/mobile/v1/{me:26-31, notifications:44-56, articles:31-53, videos:56-68, subscription:100}`.
- **N+1:** `link-clicks-queries.ts:32-53`؛ `media-queries.ts:61-70`؛ `update-achievements.ts:66-75`؛ `comment-actions.ts:82-84` (auth لكل عنصر).
- **جلب زائد (`include`/بلا `select`):** `article-queries.ts:245-317`؛ `lead-queries.ts:40-47`؛ `media-queries.ts:51-59`؛ `subscriber-queries.ts:35-39`؛ `seo-queries.ts:7-27`؛ `profile/page.tsx:294` (يمرّر `client` كاملاً للعميل)؛ `articles/page.tsx:44-46` (صفوف مكرّرة في props).
- **عدّات بدل groupBy:** `lead-queries.ts:52-62`، `question-queries.ts:72-94`، `subscriber-queries.ts:57-66`، `support-queries-enhanced.ts:66-74`.
- **أخطاء ظاهرة (نص/سلوك):** `analytics/page.tsx:234, 241` (`last30d` مع 7/90)؛ `analytics/page.tsx:517 toLocaleString()` بلا locale؛ `faqs-table.tsx:369` aria-label إنجليزي؛ `save-intake.ts:67` يعيد التحقّق من `/dashboard/intake-v2` غير الموجود؛ `save-intake.ts:46, 70` نص إنجليزي/خام؛ `seo-actions.ts:21-24` لا يعيد تحقّق الصفحات الفرعية؛ `page-faq-manager.tsx:108` id وهمي؛ `leads-table.tsx:172` يصدّر الكل لا المفلتر؛ `profile/page.tsx:61`، `D/page.tsx:36` يرجعان null بدل redirect؛ `articles/[articleId]/page.tsx:42` redirect بدل notFound؛ `questions-table.tsx:164` رسالة خاطئة؛ `bookings-list.tsx:543` حالة تبقى بين الحجوزات (لا key)؛ `subscribers-table.tsx:200-218` بلا finally؛ `messages-list.tsx:688-703` `sending` تعلق.
- **`window.location.reload()` → `router.refresh()`:** `page-content-editor.tsx:156, 220`، `reels-manager.tsx:111, 167`، `videos-manager.tsx:39`.
- **`<a href>` داخلي → `Link`:** `site-builder.tsx:390`، `page-content-editor.tsx:523`، `first-time-welcome.tsx:99`.
- **مفاتيح index على قوائم ديناميكية:** `analytics/page.tsx:368-370, 409-411`؛ `article-preview-client.tsx:563-564`؛ `profile-form.tsx:507`؛ `D/page.tsx:110`؛ المحرّرات الأربعة.
- **Hydration/timezone:** `article-preview-client.tsx:420, 545`، `reels-manager.tsx:205`، `ymyl-section.tsx:267` (`ar-SA`)؛ `my-documents.tsx:204` (`new Date()` أثناء الرندر)؛ المنسّقات في المتصفح بعد رندر الخادم.
- **Sheets تُفكّ قبل أنيميشن الإغلاق:** `comments-table.tsx:710`، `faqs-table.tsx:796`، `bookings-list.tsx:546`، `subscribers-table.tsx:615`، `messages-list.tsx:707`.
- **مكوّن معرَّف داخل مكوّن:** `article-preview-client.tsx:88-116 SectionHeader`.
- **إتاحة (a11y) — كلها تغيّر HTML:** `<Button>` داخل `<Link>` (`article-card.tsx:273-316`، `[articleId]/page.tsx:51-56`، `site-articles-upsell.tsx:50-55`، `dashboard-header.tsx:125-223`)؛ `feedback-form.tsx:43-96`، `first-time-welcome.tsx:33-46`، `ImageModal.tsx:33-40`، `media-gallery.tsx:219-311`، `SalesPitchOverlay.tsx:430-466` نوافذ بلا `role="dialog"`؛ `<p>`/كتل داخل `<button>` (`bookings-list.tsx:462-468`، `leads-table.tsx:295-309`، `media-gallery.tsx:174-210`، `profile-form.tsx:352-364`، `site-builder.tsx:548-578`)؛ حقول بلا label (`leads-table.tsx:198`، `questions-table.tsx:177`، `media-gallery.tsx:102`، `subscribers-table.tsx:230`، `messages-list.tsx:213`، `gallery-manager.tsx:253`، …)؛ أزرار تبديل بلا `aria-pressed`؛ `tabIndex={-1}` على إظهار كلمة المرور (`change-password-form.tsx:181`، `login-form.tsx:155`)؛ `articles-page-client.tsx:140-156` بلا `role="tablist"`؛ أشرطة تقدّم بلا role؛ `GTMContainer.tsx:27` iframe بلا title.
- **حزمة:** `recharts`، `driver.js`، `canvas-confetti`، `IntakeForm` القديم (989 سطراً) تُحمَّل ثابتةً بلا `next/dynamic`؛ `SalesPitchOverlay.tsx:109-111` يجلب المانيفست وهو مغلق؛ `app/layout.tsx:23-28` خطوط Google عبر `<link>` لا `next/font`.
- **أمان:** `api/upload-bunny/route.ts:66` يعيد رسالة الخطأ الخام؛ `api/telegram/webhook/route.ts:52-58` فحص السرّ اختياري؛ `lib/auth.ts:16-19`، `lib/mobile-api/auth.ts:20-24` أسرار تطوير احتياطية؛ `sitemap.xml/route.ts` بلا rate limit و`take: 5000`.
- **تخطيط:** `(dashboard)/layout.tsx:150`+`dashboard-layout-client.tsx:128` — `div.mb-6` يلفّ إشعاراً `empty:hidden` فيضيف 24px لمن لا إشعار له.
- **استعلام مكرّر:** `getSubscribersCount` ≡ `stats.active`؛ `getNewSupportMessagesCount` ≡ `stats.new`؛ `check-client-site-seo.ts:66, 77` robots مرّتين.

---

## ٨. الخطة — الأقسام من الأقلّ خطراً للأعلى (commit لكل قسم)

كل commit يتبعه: `pnpm install` · `pnpm --filter ./console exec tsc --noEmit` · `AUTH_SECRET=<placeholder> pnpm --filter ./console build` — صفر أخطاء وإلا يُرجَع.

| # | القسم | البنود | الخطر |
|---|---|---|---|
| S0 | هذا الملف | — | لا شيء |
| S1 | الكود الميت: ١٧ ملفاً + التصديرات + imports/المحلّيات غير المستعملة | ٢، ٥ | منخفض (tsc يكشف أي مستورد مفقود) |
| S2 | دمج المكرّر إلى `lib/` و`components/shared/` (`getClientId`، `buildReelSlug`، المنسّقات، `use-selection`، `Section`/`Field`، …) | ٣ | منخفض |
| S3 | الهيكل العام: ترقية ما تستعمله مسارات متعدّدة/`api`/الـlayout إلى `lib/`، إنزال `lib/` أحادي المستهلك إلى مساره، `seo/intake/lib`→`helpers`، `_lib`→`helpers`، `login-form`، `account-notice`، `error-view`، `video-upload`، `use-confirm` | ٧ | متوسط (imports كثيرة؛ tsc يحكم) |
| S4 | `lib/ar.ts` → `lib/ar/*` بنفس الترتيب | ٤ | منخفض (كائن ثابت) |
| S5 | analytics + articles | ١، ٤، ٥، ٦، ٧، ٨أ | متوسط |
| S6 | bookings + comments + faqs + questions (عائلة جداول الإشراف) | ١، ٤، ٥، ٧، ٨أ | متوسط |
| S7 | client-comments + client-reviews + subscribers + support + leads | ١، ٤، ٦، ٧، ٨أ | متوسط |
| S8 | campaigns + documents + gallery + media + reels + videos + invoices | ١، ٤، ٥، ٧، ٨أ | متوسط |
| S9 | my-site + page-content + page-faq + site-pages + site-health | ١، ٣، ٤، ٦، ٧، ٨أ | متوسط |
| S10 | profile + settings + seo | ١، ٤، ٦، ٧، ٨أ | متوسط |
| S11 | الرئيسية + layout اللوحة ومكوّناته + جذر `app/` + `(auth)`/`(preview)`/`android`/`admin-access` + `api/` + `help/` + `components/` + باقي `lib/` | ١، ٤، ٦، ٧، ٨أ | أعلى (layout يمسّ كل الصفحات) |

S5–S11 مستقلّة (مجلّدات متباينة) وتُنفَّذ بـsubagents متوازية في worktrees منفصلة، ثم تُدمج واحدةً واحدة مع التحقّق بعد كل دمج. لا يمسّ أيٌّ منها `lib/` أو `components/shared/` إلا S11؛ ما يحتاجه قسم من `lib/` يُؤسَّس في S2/S3 قبل البدء.

### الأقسام التي تحتاج تجربة يدوية قبل الدمج
- كل جداول الإشراف (comments, faqs, bookings, questions, subscribers, support, client-comments, client-reviews): التحديد الجماعي، الشيت الجانبي، الفلاتر.
- `articles` (البطاقة والمعاينة والقرار)، `seo/intake` (النموذجان)، `my-site` (الـstage والحارس)، `page-content` (المحرّرات الأربعة والفيديو)، `reels/videos/gallery` (الرفع).
- `(dashboard)/layout` والـsidebar (العدّادات)، `help/console` (الجولة والـpitch).
- الملفات التي لُمس فيها الـDOM (القسم ٥ أعلاه) — فحص بصري.
