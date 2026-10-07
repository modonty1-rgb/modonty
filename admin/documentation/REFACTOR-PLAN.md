# خطة تنظيف `admin/` — جرد قبل التنفيذ

المرجع: `documents/cloud/REFACTOR-TASK.md` · الفرع `cloud/refactor-admin` · التاريخ ٢٠٢٦-١٠-٠٧.
الجرد أُخذ على الكوميت الأساس قبل أي تعديل. كل الأرقام من سكربتات قياس (knip · رسم بياني للاستيرادات · عدّ أسطر) لا من انطباع.

## ٠. الأساس قبل التعديل

| القياس | القيمة |
|---|---|
| ملفات .ts/.tsx داخل admin (بلا node_modules · .next · tests · scripts · public) | 1604 |
| أسطر | 209235 |
| ملفات `"use client"` | 489 |
| ملفات > ٣٠٠ سطر | 155 |
| ملفات .tsx تستورد Prisma مباشرة (منطق داخل العرض) | 47 |
| knip: ملفات بلا مستورِد | 144 |
| knip: تصديرات بلا مستعمِل | 377 |
| knip: أنواع مصدَّرة بلا مستعمِل | 396 |
| مجموعات دوال مكرّرة (جسم متطابق حرفياً في أكثر من ملف) | 28 |
| ملفات داخل مسار تستوردها مسارات أخرى (مخالفة folder-structure) | 100 |
| ملفات جذرية (components/ · lib/ · hooks/) يستعملها مسار واحد فقط | 55 |
| أغلفة `<div>` بلا أي خاصية تلفّ عنصراً واحداً | 11 في 10 ملفات |
| `any` صريح | 47 |
| `as X` casts | 774 |
| ملفات فيها `useEffect` | 75 |
| متغيّرات/استيرادات غير مستعملة (tsc --noUnusedLocals/Parameters) | 201 |
| `catch {}` فارغ | 2 |
| `pnpm --filter ./admin exec tsc --noEmit` | صفر أخطاء (EXIT 0) |
| `pnpm --filter ./admin build` | نجح (EXIT 0) — يحتاج `.env.shared` بقيم وهمية لـAUTH_SECRET/DATABASE_URL لأن `lib/auth.ts:5` يرمي خطأ عند غيابها |

## ١. الجرد التفصيلي

### ١.١ البند ١ — ملفات `.tsx` تخلط المنطق بالعرض

47 ملف `.tsx` يستورد `@/lib/db` أو ينادي Prisma مباشرة داخل المكوّن. السطر المذكور هو سطر الاستيراد/أوّل نداء. العمود `await` = عدد الاستعلامات/الانتظارات داخل الملف.

| الملف:السطر | await | أسطر |
|---|---|---|
| `app/(dashboard)/seo-health/page.tsx:25` | 12 | 352 |
| `app/(dashboard)/orders/page.tsx:3` | 11 | 441 |
| `app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx:3` | 7 | 486 |
| `app/(dashboard)/orders/renewals/page.tsx:6` | 6 | 191 |
| `app/(dashboard)/orders/[id]/page.tsx:10` | 5 | 677 |
| `app/(dashboard)/search-console/page.tsx:11` | 5 | 363 |
| `app/(dashboard)/clients/[id]/account/page.tsx:8` | 5 | 199 |
| `app/(dashboard)/clients/activate/[orderId]/page.tsx:5` | 5 | 216 |
| `app/(dashboard)/components/sections/clients-pipeline.tsx:19` | 4 | 374 |
| `app/(dashboard)/daily-tasks/page.tsx:8` | 4 | 168 |
| `app/(dashboard)/users/[id]/page.tsx:5` | 4 | 52 |
| `app/(dashboard)/tasks/archive/page.tsx:11` | 4 | 102 |
| `app/(dashboard)/orders/[id]/invoice/page.tsx:5` | 4 | 123 |
| `app/(dashboard)/orders/[id]/edit/page.tsx:4` | 4 | 87 |
| `app/(dashboard)/contact-requests/page.tsx:6` | 4 | 179 |
| `app/(dashboard)/modonty/media/page.tsx:2` | 4 | 144 |
| `app/(dashboard)/modonty/sectors/[sector]/page.tsx:5` | 4 | 220 |
| `app/(dashboard)/articles/pipeline/[id]/page.tsx:5` | 4 | 105 |
| `app/(dashboard)/clients/[id]/documents/page.tsx:3` | 4 | 50 |
| `app/(dashboard)/clients/segment/[key]/page.tsx:4` | 4 | 127 |
| `app/(dashboard)/campaigns/reports/[brand]/page.tsx:7` | 4 | 413 |
| `app/(dashboard)/tasks/assign/page.tsx:4` | 3 | 114 |
| `app/(dashboard)/orders/new/page.tsx:4` | 3 | 110 |
| `app/(dashboard)/articles/workflow/[transition]/page.tsx:4` | 3 | 322 |
| `app/(dashboard)/commercial-plans/page.tsx:12` | 3 | 146 |
| `app/(dashboard)/clients/suspend/page.tsx:3` | 3 | 98 |
| `app/(dashboard)/clients/[id]/site/page.tsx:3` | 3 | 53 |
| `app/(dashboard)/clients/page.tsx:6` | 3 | 101 |
| `app/(auth)/login/page.tsx:3` | 2 | 53 |
| `app/(dashboard)/pay-preview/page.tsx:8` | 2 | 110 |
| `app/(dashboard)/articles/[id]/edit/page.tsx:8` | 2 | 81 |
| `app/(dashboard)/articles/[id]/technical/page.tsx:5` | 2 | 449 |
| `app/(dashboard)/articles/segment/[key]/page.tsx:5` | 2 | 95 |
| `app/(dashboard)/articles/homepage/page.tsx:4` | 2 | 125 |
| `app/(dashboard)/media/maintenance/page.tsx:4` | 2 | 161 |
| `app/(dashboard)/commercial-plans/[id]/page.tsx:7` | 2 | 45 |
| `app/(dashboard)/clients/[id]/seo-technical/page.tsx:6` | 2 | 300 |
| `app/(dashboard)/clients/activate/page.tsx:5` | 2 | 109 |
| `app/(dashboard)/payment-failures/page.tsx:6` | 2 | 168 |
| `app/(dashboard)/layout.tsx:6` | 2 | 112 |
| `app/(dashboard)/campaigns/[id]/edit/page.tsx:3` | 2 | 38 |
| `app/(dashboard)/components/sections/subscribers-pipeline.tsx:5` | 1 | 111 |
| `app/(dashboard)/articles/technical/page.tsx:2` | 1 | 252 |
| `app/(dashboard)/articles/health/page.tsx:3` | 1 | 38 |
| `app/(dashboard)/articles/workflow/maintenance/page.tsx:3` | 1 | 145 |
| `app/(dashboard)/commercial-features/page.tsx:8` | 1 | 95 |
| `app/(dashboard)/clients/seo/page.tsx:1` | 1 | 88 |

المعالجة (نقل حرفي): الاستعلام والتحويل → `helpers/` أو `actions/` بجانب الصفحة، والصفحة تستدعي وتعرض فقط. نفس الـselect ونفس الترتيب ونفس الكاش.

### ١.٢ البند ٢ — الكود الميت (knip)

الأمر: `pnpm dlx knip@5 --config <knip.json> --include files,exports,types,nsExports,nsTypes` بمداخل Next (page/layout/loading/error/route/…) + proxy.ts + instrumentation.ts + auth.config.ts + scripts/ + tests/.

**الدليل الثاني** (رسم بياني للاستيرادات يشمل scripts/ و tests/): كل ملف من الـ144 ليس له أي مستورِد حيّ — مستورِدوه إمّا لا أحد أو ملفات ميتة مثله (عناقيد ميتة). النتيجة: `dead files: 144 with live importers: 0`.

| # | الملف | مستورِدوه (كلّهم ميتون) |
|---|---|---|
| 1 | `lib/jbrseo-client.ts` | — |
| 2 | `components/admin/contact-messages-badge.tsx` | — |
| 3 | `components/admin/theme-toggle.tsx` | — |
| 4 | `components/gtm/GTMClientTracker.tsx` | — |
| 5 | `components/shared/deferred-image-upload.tsx` | `app/(dashboard)/actions/upload-image.ts` |
| 6 | `components/shared/jsonld-validation-button.tsx` | `app/(dashboard)/articles/components/steps/metatag-preview-step.tsx` |
| 7 | `components/shared/jsonld-validation-dialog.tsx` | `components/shared/jsonld-validation-button.tsx` |
| 8 | `components/shared/material-input.tsx` | — |
| 9 | `lib/constants/licenses.ts` | — |
| 10 | `lib/gsc/index.ts` | — |
| 11 | `lib/messages/en.ts` | — |
| 12 | `lib/tasks/notify-assigner-on-done.ts` | — |
| 13 | `app/(dashboard)/actions/upload-image.ts` | — |
| 14 | `app/(dashboard)/components/activity-feed.tsx` | — |
| 15 | `app/(dashboard)/components/alerts-section.tsx` | — |
| 16 | `app/(dashboard)/components/articles-overview.tsx` | — |
| 17 | `app/(dashboard)/components/articles-trend-chart.tsx` | — |
| 18 | `app/(dashboard)/components/client-growth-chart.tsx` | — |
| 19 | `app/(dashboard)/components/client-health-overview.tsx` | — |
| 20 | `app/(dashboard)/components/dashboard-section.tsx` | `app/(dashboard)/components/sections/article-workflow-board.tsx`، `app/(dashboard)/components/sections/gsc-section-skeleton.tsx`، `app/(dashboard)/components/sections/gsc-section.tsx` |
| 21 | `app/(dashboard)/components/delivery-progress-chart.tsx` | — |
| 22 | `app/(dashboard)/components/delivery-progress.tsx` | — |
| 23 | `app/(dashboard)/components/engagement-queue.tsx` | — |
| 24 | `app/(dashboard)/components/kpi-strip.tsx` | `app/(dashboard)/components/sections/gsc-section.tsx` |
| 25 | `app/(dashboard)/components/mini-action-items.tsx` | `app/(dashboard)/components/sections/gsc-section.tsx` |
| 26 | `app/(dashboard)/components/mini-activity-feed.tsx` | — |
| 27 | `app/(dashboard)/components/quick-actions.tsx` | — |
| 28 | `app/(dashboard)/components/recent-articles.tsx` | — |
| 29 | `app/(dashboard)/components/recent-subscribers.tsx` | — |
| 30 | `app/(dashboard)/components/status-breakdown.tsx` | — |
| 31 | `app/(dashboard)/components/subscriber-breakdown.tsx` | — |
| 32 | `app/(dashboard)/components/subscriber-growth-chart.tsx` | — |
| 33 | `app/(dashboard)/components/subscriber-overview.tsx` | — |
| 34 | `app/(dashboard)/components/subscription-health-card.tsx` | — |
| 35 | `app/(dashboard)/components/subscription-status-chart.tsx` | — |
| 36 | `app/(dashboard)/components/visitor-engagement-card.tsx` | — |
| 37 | `app/(dashboard)/helpers/prepare-image-data.ts` | — |
| 38 | `components/admin/icons/modonty-icon.tsx` | — |
| 39 | `components/shared/seo-doctor/validators.ts` | `app/(dashboard)/clients/helpers/client-seo-config/create-organization-seo-config.ts`، `app/(dashboard)/clients/helpers/client-seo-config/create-validate-seo-title-and-og.ts` |
| 40 | `components/shared/seo-form-fields/index.ts` | — |
| 41 | `components/shared/seo-form-fields/seo-fields.tsx` | `components/shared/seo-form-fields/index.ts` |
| 42 | `lib/seo/utils/performance.ts` | — |
| 43 | `app/(dashboard)/articles/actions/gallery-actions.ts` | — |
| 44 | `app/(dashboard)/articles/actions/get-writing-articles.ts` | `app/(dashboard)/articles/components/review-articles-dialog.tsx` |
| 45 | `app/(dashboard)/articles/actions/jsonld-actions.ts` | — |
| 46 | `app/(dashboard)/articles/actions/request-changes-action.ts` | — |
| 47 | `app/(dashboard)/articles/components/article-form-action-bar.tsx` | — |
| 48 | `app/(dashboard)/articles/components/article-form-navigation.tsx` | — |
| 49 | `app/(dashboard)/articles/components/article-form-preview-sidebar.tsx` | — |
| 50 | `app/(dashboard)/articles/components/article-form-progress.tsx` | — |
| 51 | `app/(dashboard)/articles/components/article-form-sections.tsx` | — |
| 52 | `app/(dashboard)/articles/components/article-form-sidebar.tsx` | — |
| 53 | `app/(dashboard)/articles/components/article-form-stepper.tsx` | — |
| 54 | `app/(dashboard)/articles/components/article-form-store.ts` | `app/(dashboard)/articles/components/article-form-sidebar.tsx` |
| 55 | `app/(dashboard)/articles/components/article-multi-select.tsx` | — |
| 56 | `app/(dashboard)/articles/components/articles-header-wrapper.tsx` | `app/(dashboard)/articles/components/articles-page-client.tsx` |
| 57 | `app/(dashboard)/articles/components/articles-header.tsx` | — |
| 58 | `app/(dashboard)/articles/components/articles-page-client.tsx` | — |
| 59 | `app/(dashboard)/articles/components/delete-article-button.tsx` | — |
| 60 | `app/(dashboard)/articles/components/export-button.tsx` | — |
| 61 | `app/(dashboard)/articles/components/jsonld-preview.tsx` | — |
| 62 | `app/(dashboard)/articles/components/review-articles-dialog.tsx` | — |
| 63 | `app/(dashboard)/articles/components/save-article-button.tsx` | — |
| 64 | `app/(dashboard)/articles/components/section-status-indicator.tsx` | `app/(dashboard)/articles/components/article-form-sections.tsx` |
| 65 | `app/(dashboard)/articles/components/sticky-save-button.tsx` | — |
| 66 | `app/(dashboard)/articles/components/tag-input.tsx` | — |
| 67 | `app/(dashboard)/articles/components/test-data-button.tsx` | — |
| 68 | `app/(dashboard)/articles/components/use-article-form-auto-fill.ts` | — |
| 69 | `app/(dashboard)/articles/helpers/article-validation.ts` | — |
| 70 | `app/(dashboard)/articles/helpers/client-site-links.ts` | — |
| 71 | `app/(dashboard)/articles/helpers/content-html-checks.ts` | — |
| 72 | `app/(dashboard)/articles/helpers/field-display-helpers.ts` | `app/(dashboard)/articles/components/steps/step-review-card.tsx` |
| 73 | `app/(dashboard)/articles/helpers/generate-test-data.ts` | `app/(dashboard)/articles/components/test-data-button.tsx` |
| 74 | `app/(dashboard)/articles/helpers/section-status.ts` | `app/(dashboard)/articles/components/article-form-progress.tsx`، `app/(dashboard)/articles/components/article-form-sections.tsx`، `app/(dashboard)/articles/components/sticky-save-button.tsx` |
| 75 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer.ts` | `app/(dashboard)/articles/components/sections/in-page-seo-checklist.tsx`، `app/(dashboard)/articles/components/sections/off-page-seo-guidance.tsx` |
| 76 | `app/(dashboard)/categories/components/export-button.tsx` | — |
| 77 | `app/(dashboard)/clients/components/clients-header-wrapper.tsx` | `app/(dashboard)/clients/components/clients-page-client.tsx` |
| 78 | `app/(dashboard)/clients/components/clients-header.tsx` | `app/(dashboard)/clients/components/clients-header-wrapper.tsx` |
| 79 | `app/(dashboard)/clients/components/clients-page-client.tsx` | `app/(dashboard)/clients/components/clients-tabs.tsx` |
| 80 | `app/(dashboard)/clients/components/clients-stats.tsx` | — |
| 81 | `app/(dashboard)/clients/components/clients-tabs.tsx` | — |
| 82 | `app/(dashboard)/components/sections/article-workflow-board.tsx` | — |
| 83 | `app/(dashboard)/components/sections/gsc-section-skeleton.tsx` | — |
| 84 | `app/(dashboard)/components/sections/gsc-section.tsx` | — |
| 85 | `app/(dashboard)/database/components/compact-stats-header.tsx` | — |
| 86 | `app/(dashboard)/database/components/database-overview.tsx` | — |
| 87 | `app/(dashboard)/industries/components/export-button.tsx` | — |
| 88 | `app/(dashboard)/media/actions/mirror-to-bunny.ts` | — |
| 89 | `app/(dashboard)/media/components/media-guidelines.tsx` | — |
| 90 | `app/(dashboard)/media/helpers/media-seo-config.ts` | — |
| 91 | `app/(dashboard)/search-console/actions/indexnow-actions.ts` | `app/(dashboard)/search-console/components/submit-indexnow-button.tsx` |
| 92 | `app/(dashboard)/search-console/components/data-sources-note.tsx` | — |
| 93 | `app/(dashboard)/search-console/components/submit-indexnow-button.tsx` | — |
| 94 | `app/(dashboard)/search-console/components/tech-health-dialog.tsx` | `app/(dashboard)/search-console/components/tech-health-stat.tsx` |
| 95 | `app/(dashboard)/search-console/components/tech-health-stat.tsx` | — |
| 96 | `app/(dashboard)/tags/components/export-button.tsx` | — |
| 97 | `app/(dashboard)/articles/actions/jsonld-actions/batch-regenerate-articles-jsonld.ts` | `app/(dashboard)/articles/actions/jsonld-actions/index.ts` |
| 98 | `app/(dashboard)/articles/actions/jsonld-actions/get-article-jsonld.ts` | `app/(dashboard)/articles/actions/jsonld-actions/index.ts`، `app/(dashboard)/articles/components/sections/seo-validation-section.tsx` |
| 99 | `app/(dashboard)/articles/actions/jsonld-actions/get-jsonld-statistics.ts` | `app/(dashboard)/articles/actions/jsonld-actions/index.ts` |
| 100 | `app/(dashboard)/articles/actions/jsonld-actions/index.ts` | — |
| 101 | `app/(dashboard)/articles/actions/jsonld-actions/regenerate-article-jsonld.ts` | `app/(dashboard)/articles/actions/jsonld-actions/index.ts` |
| 102 | `app/(dashboard)/articles/components/sections/article-review-summary.tsx` | — |
| 103 | `app/(dashboard)/articles/components/sections/citations-section.tsx` | `app/(dashboard)/articles/components/steps/citations-step.tsx` |
| 104 | `app/(dashboard)/articles/components/sections/in-page-seo-checklist.tsx` | — |
| 105 | `app/(dashboard)/articles/components/sections/meta-section.tsx` | — |
| 106 | `app/(dashboard)/articles/components/sections/off-page-seo-guidance.tsx` | — |
| 107 | `app/(dashboard)/articles/components/sections/semantic-keywords-section.tsx` | `app/(dashboard)/articles/components/steps/semantic-keywords-step.tsx` |
| 108 | `app/(dashboard)/articles/components/sections/seo-best-practices-reference.tsx` | — |
| 109 | `app/(dashboard)/articles/components/sections/seo-section.tsx` | `app/(dashboard)/articles/components/article-form-sections.tsx` |
| 110 | `app/(dashboard)/articles/components/sections/seo-validation-section.tsx` | `app/(dashboard)/articles/components/article-form-sections.tsx` |
| 111 | `app/(dashboard)/articles/components/sections/social-section.tsx` | — |
| 112 | `app/(dashboard)/articles/components/sections/step-by-step-review.tsx` | — |
| 113 | `app/(dashboard)/articles/components/sections/technical-section.tsx` | — |
| 114 | `app/(dashboard)/articles/components/sections/technical-seo-guidance.tsx` | `app/(dashboard)/articles/components/sections/technical-section.tsx` |
| 115 | `app/(dashboard)/articles/components/steps/citations-step.tsx` | — |
| 116 | `app/(dashboard)/articles/components/steps/meta-tags-step.tsx` | — |
| 117 | `app/(dashboard)/articles/components/steps/metatag-preview-step.tsx` | — |
| 118 | `app/(dashboard)/articles/components/steps/semantic-keywords-step.tsx` | — |
| 119 | `app/(dashboard)/articles/components/steps/step-review-card.tsx` | `app/(dashboard)/articles/components/sections/step-by-step-review.tsx` |
| 120 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-content-quality.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 121 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-images.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 122 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-meta-tags.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 123 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-mobile.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 124 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/index.ts` |
| 125 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-structured-data.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 126 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-technical.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 127 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/calculate-category-score.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 128 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/generate-off-page-guidance.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts` |
| 129 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/index.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer.ts` |
| 130 | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/types.ts` | `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-content-quality.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-images.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-meta-tags.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-mobile.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-seo-guidance.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-structured-data.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-technical.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/calculate-category-score.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/generate-off-page-guidance.ts`، `app/(dashboard)/articles/helpers/seo-guidance-analyzer/index.ts` |
| 131 | `app/(dashboard)/clients/actions/clients-actions/jsonld-actions.ts` | — |
| 132 | `app/(dashboard)/clients/components/form-sections/seo-section.tsx` | — |
| 133 | `app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-storage.ts` | `app/(dashboard)/clients/actions/clients-actions/jsonld-actions.ts` |
| 134 | `app/(dashboard)/clients/helpers/client-seo-config/create-organization-seo-config.ts` | `app/(dashboard)/clients/helpers/client-seo-config/index.ts` |
| 135 | `app/(dashboard)/clients/helpers/client-seo-config/create-validate-seo-title-and-og.ts` | `app/(dashboard)/clients/helpers/client-seo-config/validators-basic.ts` |
| 136 | `app/(dashboard)/clients/helpers/client-seo-config/generate-organization-structured-data.ts` | `app/(dashboard)/clients/helpers/client-seo-config/create-organization-seo-config.ts` |
| 137 | `app/(dashboard)/clients/helpers/client-seo-config/index.ts` | — |
| 138 | `app/(dashboard)/clients/helpers/client-seo-config/validators-basic.ts` | `app/(dashboard)/clients/helpers/client-seo-config/create-organization-seo-config.ts` |
| 139 | `app/(dashboard)/modonty/setting/helpers/jsonld-normalize.ts` | — |
| 140 | `app/(dashboard)/users/[id]/components/delete-user-button.tsx` | — |
| 141 | `app/(dashboard)/articles/actions/articles-actions/queries/get-test-data-sources.ts` | `app/(dashboard)/articles/components/test-data-button.tsx` |
| 142 | `app/(dashboard)/media/components/upload-zone/hooks/use-cloudinary-upload.retired.ts` | — |
| 143 | `app/(dashboard)/media/components/upload-zone/utils/error-handler.ts` | — |
| 144 | `app/(public)/playbook/design/brand/helpers/tone.ts` | — |

التصديرات غير المستعملة (377 تصدير · 396 نوع في 314 ملف) تُحذف داخل ملفاتها بعد تأكيد grep لكل اسم؛ القائمة الكاملة في ناتج knip المرفق بالـPR.

### ١.٣ البند ٣ — المكرّر

28 مجموعة دالة بجسم متطابق حرفياً (بعد توحيد المسافات) في أكثر من ملف. **الدمج فقط حين تتطابق التواقيع والأنواع أيضاً**؛ أي فرق = لا دمج (يُذكر في التقرير).

1. `app/(dashboard)/articles/[id]/technical/page.tsx:15 tone` · `app/(dashboard)/clients/[id]/seo-technical/page.tsx:54 tone` · `app/(dashboard)/clients/[id]/technical/page.tsx:34 tone` · `components/shared/seo-doctor/reference-seo-technical.tsx:17 tone`
2. `app/(dashboard)/articles/[id]/technical/page.tsx:22 reportErrorMessages` · `app/(dashboard)/clients/[id]/technical/page.tsx:41 reportErrorMessages`
3. `app/(dashboard)/articles/[id]/technical/page.tsx:65 prettyJson` · `app/(dashboard)/authors/components/author-seo-technical.tsx:8 prettyJson` · `app/(dashboard)/clients/[id]/seo-technical/page.tsx:60 prettyJson` · `app/(dashboard)/clients/[id]/technical/page.tsx:76 prettyJson` · `components/shared/seo-doctor/reference-seo-technical.tsx:23 prettyJson`
4. `app/(dashboard)/articles/[id]/technical/page.tsx:360 ScoreBar` · `app/(dashboard)/clients/[id]/seo-technical/page.tsx:236 ScoreBar` · `app/(dashboard)/clients/[id]/technical/page.tsx:343 ScoreBar`
5. `app/(dashboard)/articles/[id]/technical/page.tsx:377 ScorePill` · `app/(dashboard)/clients/[id]/seo-technical/page.tsx:253 ScorePill` · `app/(dashboard)/clients/[id]/technical/page.tsx:365 ScorePill`
6. `app/(dashboard)/articles/actions/articles-actions/article-slug-otp.ts:24 sendTelegramMessage` · `app/(dashboard)/clients/actions/clients-actions/slug-change-otp.ts:22 sendTelegramMessage`
7. `app/(dashboard)/articles/actions/export-actions.ts:7 escapeCsvValue` · `app/(dashboard)/authors/actions/export-actions.ts:6 escapeCsvValue` · `app/(dashboard)/categories/actions/export-actions.ts:7 escapeCsvValue` · `app/(dashboard)/clients/actions/export-actions.ts:9 escapeCsvValue` · `app/(dashboard)/industries/actions/export-actions.ts:7 escapeCsvValue` · `app/(dashboard)/tags/actions/export-actions.ts:7 escapeCsvValue`
8. `app/(dashboard)/articles/actions/jsonld-actions/get-jsonld-statistics.ts:5 getJsonLdStatistics` · `lib/seo/jsonld-storage.ts:368 getJsonLdStats`
9. `app/(dashboard)/articles/clients-guide/components/clients-guide-table.tsx:290 setParam` · `app/(dashboard)/clients/components/clients-board.tsx:96 setParam` · `app/(dashboard)/tasks/assign/components/sent-tasks-table.tsx:305 setParam`
10. `app/(dashboard)/articles/segment/[key]/components/article-segment-table.tsx:84 toggle` · `app/(dashboard)/clients/segment/[key]/components/segment-table.tsx:112 toggle`
11. `app/(dashboard)/bing-webmaster/actions/bing-actions.ts:7 requireAuth` · `app/(dashboard)/search-console/actions/indexnow-actions.ts:14 requireAuth` · `app/(dashboard)/search-console/actions/pipeline-actions.ts:40 requireAuth` · `app/(dashboard)/search-console/actions/robots-actions.ts:15 requireAuth` · `app/(dashboard)/search-console/actions/seo-actions.ts:19 requireAuth` · `app/(dashboard)/search-console/actions/sitemap-actions.ts:16 requireAuth`
12. `app/(dashboard)/client-galleries/[clientId]/components/client-gallery-grid.tsx:84 imgFormat` · `app/(dashboard)/media/maintenance/components/optimize-images-section.tsx:15 fmt`
13. `app/(dashboard)/clients/[id]/components/client-articles.tsx:126 getSortIcon` · `app/(dashboard)/industries/[id]/components/industry-clients.tsx:109 getSortIcon` · `app/(dashboard)/tags/[id]/components/tag-articles.tsx:123 getSortIcon`
14. `app/(dashboard)/clients/components/client-table.tsx:290 handleSort` · `app/(dashboard)/industries/[id]/components/industry-clients.tsx:94 handleSort` · `app/(dashboard)/tags/[id]/components/tag-articles.tsx:108 handleSort` · `components/admin/data-table.tsx:125 handleSort`
15. `app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-validator.ts:181 validateClientWithAjv` · `lib/seo/jsonld-validator.ts:362 validateWithAjv`
16. `app/(dashboard)/database/actions/cloudinary-orphans.ts:144 sweepCloudinaryOrphans` · `app/(dashboard)/seo/actions/jsonld-integrity.ts:111 regenerateAllStaleJsonLd` · `app/(dashboard)/seo/actions/sitemap-freshness.ts:80 refreshAllSitemaps`
17. `app/(dashboard)/database/components/auto-maintenance-panel.tsx:339 StatusIcon` · `app/(dashboard)/seo/components/seo-auto-maintenance.tsx:262 StatusIcon`
18. `app/(dashboard)/database/components/backup-restore-card.tsx:39 handleBackup` · `app/(dashboard)/database/components/database-overview.tsx:70 handleBackup`
19. `app/(dashboard)/database/components/backup-restore-card.tsx:52 handleRestore` · `app/(dashboard)/database/components/database-overview.tsx:83 handleRestore`
20. `app/(dashboard)/export-data/actions/export-analytics.ts:6 escapeCsv` · `app/(dashboard)/export-data/actions/export-extra.ts:5 esc`
21. `app/(dashboard)/media/actions/generate-image-seo-ai.ts:26 toPlainText` · `lib/seo-images/draft-image-seo-batch.ts:45 toPlainText`
22. `app/(dashboard)/media/components/upload-zone/hooks/use-upload-zone.ts:154 handleDragLeave` · `components/shared/deferred-image-upload.tsx:172 handleDragLeave`
23. `app/(dashboard)/media/segment/[key]/components/media-segment-table.tsx:66 toggle` · `app/(dashboard)/reference/segment/[key]/components/reference-table.tsx:54 toggle`
24. `app/(dashboard)/modonty/setting/helpers/build-articles-page-jsonld.ts:24 ensureAbsoluteUrl` · `app/(dashboard)/modonty/setting/helpers/build-categories-page-jsonld.ts:11 ensureAbsoluteUrl` · `app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts:12 ensureAbsoluteUrl` · `app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts:72 ensureAbsoluteUrl` · `app/(dashboard)/modonty/setting/helpers/build-meta-from-page.ts:10 ensureAbsoluteUrl` · `app/(dashboard)/modonty/setting/helpers/build-taxonomy-page-jsonld.ts:15 ensureAbsoluteUrl` · `app/(dashboard)/modonty/setting/helpers/build-trending-page-jsonld.ts:14 ensureAbsoluteUrl` · `app/(dashboard)/modonty/setting/helpers/generate-modonty-page-jsonld.ts:54 ensureAbsoluteUrl`
25. `app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts:20 parseLanguageCodes` · `app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts:107 parseLanguageCodes`
26. `app/(dashboard)/reels/archived/page.tsx:11 ArchivedReelsPage` · `app/(dashboard)/reels/rejected/page.tsx:10 RejectedReelsPage`
27. `app/api/articles/[id]/validate/route.ts:128 mapCategory` · `app/api/articles/slug/[slug]/validate/route.ts:88 mapCategory` · `lib/seo/page-validator.ts:261 mapCategory`
28. `lib/seo/batch-regenerate-article-seo.ts:29 batchRegenerateArticleSeo` · `lib/seo/jsonld-storage.ts:299 batchRegenerateJsonLd`

### ١.٤ البند ٤ — الملفات > ٣٠٠ سطر

155 ملف. تُقسَّم بنقل الكود كما هو إلى ملفات أصغر بجانبها (مكوّنات فرعية · helpers) بلا تغيير.

| أسطر | الملف |
|---|---|
| 1554 | `app/(dashboard)/settings/reference-data/components/reference-data-client.tsx` |
| 1309 | `app/(dashboard)/settings/actions/settings-actions.ts` |
| 1120 | `app/(dashboard)/settings/actions/seed-integration-test.ts` |
| 1085 | `app/(dashboard)/articles/pipeline/[id]/pipeline-runner.tsx` |
| 1077 | `lib/seo/knowledge-graph-generator.ts` |
| 1063 | `app/(dashboard)/clients/helpers/client-seo-config/validators-advanced.ts` |
| 988 | `app/(dashboard)/articles/components/steps/metatag-preview-step.tsx` (ميت — يُحذف في البند ٢) |
| 966 | `app/(dashboard)/clients/helpers/client-field-mapping.ts` |
| 909 | `app/(public)/playbook/helpers/job-descriptions-data.ts` |
| 901 | `app/(dashboard)/articles/components/rich-text-editor.tsx` |
| 898 | `app/(dashboard)/clients/actions/clients-actions/update-client-grouped.ts` |
| 893 | `app/(dashboard)/sales-leads/components/lead-form.tsx` |
| 858 | `app/(dashboard)/articles/components/article-form-context.tsx` |
| 822 | `components/admin/sidebar.tsx` |
| 813 | `lib/seo/article-validator-db.ts` |
| 784 | `app/(dashboard)/bunny-migration/actions/cloudinary-to-bunny.ts` |
| 733 | `app/(public)/playbook/marketing/plan/page.tsx` |
| 726 | `lib/seo/jsonld-validator.ts` |
| 699 | `app/(dashboard)/settings/reference-data/actions/reference-data-actions.ts` |
| 698 | `app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx` |
| 694 | `app/(dashboard)/actions/dashboard-actions.ts` |
| 684 | `app/(dashboard)/users/components/user-form.tsx` |
| 681 | `lib/seo/article-validator.ts` |
| 677 | `app/(dashboard)/orders/[id]/page.tsx` |
| 652 | `app/(dashboard)/clients/components/client-table.tsx` |
| 649 | `app/(dashboard)/database/actions/run-all-maintenance.ts` |
| 649 | `app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo.ts` |
| 645 | `app/(dashboard)/clients/components/client-seo-form.tsx` |
| 613 | `app/(public)/playbook/tech/search-preview/page.tsx` |
| 604 | `lib/tasks/task-actions.ts` |
| 599 | `app/(public)/playbook/segments/page.tsx` |
| 594 | `components/shared/media-library/media-grid.tsx` |
| 592 | `app/(dashboard)/database/components/db-tools-section.tsx` |
| 590 | `app/(dashboard)/sales-leads/components/leads-table.tsx` |
| 562 | `app/(dashboard)/orders/new/components/manual-order-form.tsx` |
| 557 | `app/(dashboard)/clients/segment/segments.ts` |
| 555 | `app/(dashboard)/media/components/media-guidelines.tsx` (ميت — يُحذف في البند ٢) |
| 549 | `app/(dashboard)/media/components/upload-zone/hooks/use-upload-zone.ts` |
| 548 | `app/(dashboard)/clients/[id]/components/client-tabs.tsx` |
| 541 | `lib/seo/page-seo-analyzer.ts` |
| 536 | `app/(dashboard)/seo/components/cascade-status-panel.tsx` |
| 536 | `components/admin/sync-local-button.tsx` |
| 520 | `app/(dashboard)/contact-messages/[id]/components/contact-message-view.tsx` |
| 517 | `app/(dashboard)/campaigns/components/campaign-form.tsx` |
| 515 | `app/(dashboard)/articles/components/jsonld-preview.tsx` (ميت — يُحذف في البند ٢) |
| 508 | `lib/seo/pre-publish-audit.ts` |
| 507 | `app/(dashboard)/clients/[id]/components/tabs/media-social-tab.tsx` |
| 498 | `app/(dashboard)/media/[id]/edit/edit-media-form.tsx` |
| 494 | `app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts` |
| 493 | `app/(dashboard)/analytics/components/full-activity-client.tsx` |
| 491 | `app/(dashboard)/changelog/changelog-client.tsx` |
| 486 | `app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx` |
| 474 | `app/(dashboard)/sales-leads/actions.ts` |
| 474 | `lib/health/article-health.ts` |
| 473 | `app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts` |
| 466 | `components/shared/seo-doctor/validators.ts` (ميت — يُحذف في البند ٢) |
| 463 | `app/(dashboard)/articles/components/ai-article-dialog.tsx` |
| 461 | `lib/seo/listing-page-seo-generator.ts` |
| 455 | `app/(dashboard)/database/actions/intake-seed-definition.ts` |
| 454 | `app/(dashboard)/articles/components/article-selection-table.tsx` |
| 454 | `app/(dashboard)/campaigns/leads/components/leads-table.tsx` |
| 454 | `app/(dashboard)/clients/[id]/technical/page.tsx` |
| 451 | `app/(dashboard)/articles/components/sections/basic-section.tsx` |
| 450 | `app/(dashboard)/clients/components/clients-board.tsx` |
| 449 | `app/(dashboard)/articles/[id]/technical/page.tsx` |
| 449 | `app/(dashboard)/contact-messages/components/contact-messages-table.tsx` |
| 441 | `app/(dashboard)/orders/page.tsx` |
| 440 | `app/(dashboard)/clients/components/edit-workspace/client-edit-workspace.tsx` |
| 440 | `app/(dashboard)/orders/components/orders-table.tsx` |
| 436 | `app/(dashboard)/categories/components/category-merge-dialog.tsx` |
| 436 | `app/(dashboard)/tags/components/tag-merge-dialog.tsx` |
| 433 | `app/(dashboard)/industries/components/industry-merge-dialog.tsx` |
| 432 | `app/(dashboard)/commercial-plans/actions.ts` |
| 422 | `app/(dashboard)/components/sections/gsc-section.tsx` (ميت — يُحذف في البند ٢) |
| 415 | `app/(dashboard)/clients/helpers/client-seo-config/validators-basic.ts` (ميت — يُحذف في البند ٢) |
| 414 | `app/(dashboard)/analytics/actions/get-ga4-activity.ts` |
| 413 | `app/(dashboard)/campaigns/reports/[brand]/page.tsx` |
| 410 | `app/(dashboard)/tags/actions/tags-actions.ts` |
| 409 | `app/(dashboard)/briefs/[clientId]/page.tsx` |
| 409 | `lib/seo/jsonld-storage.ts` |
| 408 | `app/(dashboard)/intake/components/intake-manager.tsx` |
| 401 | `app/(dashboard)/clients/actions/clients-actions/get-clients-stats.ts` |
| 401 | `app/(dashboard)/clients/sales-report/actions/get-sales-report.ts` |
| 398 | `app/(dashboard)/articles/clients-guide/components/clients-guide-table.tsx` |
| 397 | `app/(dashboard)/orders/[id]/edit/components/order-edit-form.tsx` |
| 397 | `components/shared/media-library/media-page-client.tsx` |
| 396 | `app/(dashboard)/articles/components/articles-board.tsx` |
| 396 | `app/(dashboard)/tasks/assign/components/sent-tasks-table.tsx` |
| 396 | `app/api/dev/sync-local-from-prod/route.ts` |
| 394 | `app/(dashboard)/modonty/setting/components/page-form.tsx` |
| 391 | `app/(dashboard)/components/sections/today-list.tsx` |
| 388 | `app/(dashboard)/articles/actions/articles-actions/mutations/create-article.ts` |
| 386 | `app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-validator.ts` |
| 385 | `app/(dashboard)/clients/helpers/client-form-schema.ts` |
| 384 | `app/(dashboard)/articles/components/article-form-stepper.tsx` (ميت — يُحذف في البند ٢) |
| 381 | `app/(dashboard)/clients/components/form-sections/client-site-section.tsx` |
| 379 | `app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts` |
| 379 | `lib/types/form-types.ts` |
| 376 | `components/shared/media-picker-dialog.tsx` |
| 375 | `app/(dashboard)/seo-health/components/page-validator.tsx` |
| 374 | `app/(dashboard)/components/sections/clients-pipeline.tsx` |
| 371 | `components/shared/media-upload/upload-media-dialog.tsx` |
| 370 | `app/(dashboard)/articles/sources/components/sources-table.tsx` |
| 368 | `app/(dashboard)/seo/actions/canonical-url-sanitizer.ts` |
| 366 | `app/(dashboard)/analytics/leads/bookings/page.tsx` |
| 363 | `app/(dashboard)/modonty/setting/helpers/build-meta-from-page.ts` |
| 363 | `app/(dashboard)/search-console/page.tsx` |
| 362 | `app/(dashboard)/database/components/auto-maintenance-panel.tsx` |
| 362 | `components/shared/jsonld-validation-dialog.tsx` (ميت — يُحذف في البند ٢) |
| 357 | `app/(dashboard)/commission-statement/page.tsx` |
| 356 | `lib/seo/metadata-generator.ts` |
| 354 | `lib/seo/auto-fix.ts` |
| 353 | `app/(dashboard)/seo-images/helpers/load-groups.ts` |
| 352 | `app/(dashboard)/articles/actions/gallery-actions.ts` (ميت — يُحذف في البند ٢) |
| 352 | `app/(dashboard)/seo-health/page.tsx` |
| 351 | `app/(dashboard)/articles/components/sections/seo-validation-section.tsx` (ميت — يُحذف في البند ٢) |
| 350 | `components/tasks/task-dialog.tsx` |
| 349 | `app/(dashboard)/bunny-migration/components/cloudinary-migration-card.tsx` |
| 349 | `app/api/cron/backup/route.ts` |
| 349 | `lib/seo/search-console-api.ts` |
| 348 | `components/admin/wipe-orders-button.tsx` |
| 345 | `lib/seo/entity-disambiguator.ts` |
| 340 | `components/shared/media-upload/image-editor-modal.tsx` |
| 340 | `lib/media/media-specs.ts` |
| 340 | `lib/seo/page-validator.ts` |
| 338 | `components/admin/data-table.tsx` |
| 337 | `app/(public)/playbook/page.tsx` |
| 334 | `app/(dashboard)/reels/components/reels-approval-list.tsx` |
| 334 | `lib/gsc/coverage.ts` |
| 333 | `app/(dashboard)/analytics/actions/get-visitor-actions.ts` |
| 333 | `app/(dashboard)/search-console/components/sitemap-urls-dialog.tsx` |
| 330 | `app/(dashboard)/media/components/upload-zone/index.tsx` |
| 330 | `components/shared/thumbnail-image-view.tsx` |
| 329 | `app/(dashboard)/articles/components/article-form-store.ts` (ميت — يُحذف في البند ٢) |
| 329 | `app/(dashboard)/clients/[id]/components/client-analytics.tsx` |
| 329 | `app/(dashboard)/clients/components/client-form.tsx` |
| 328 | `lib/seo/weekly-report-generator.ts` |
| 326 | `app/(dashboard)/media/actions/save-image-seo.ts` |
| 323 | `app/(dashboard)/seo-images/components/seo-groups-table.tsx` |
| 322 | `app/(dashboard)/articles/workflow/[transition]/page.tsx` |
| 322 | `lib/messages/ar.ts` |
| 322 | `lib/messages/en.ts` (ميت — يُحذف في البند ٢) |
| 318 | `app/(dashboard)/articles/[id]/page.tsx` |
| 318 | `app/(dashboard)/database/components/database-overview.tsx` (ميت — يُحذف في البند ٢) |
| 318 | `app/(dashboard)/modonty/setting/helpers/modonty-jsonld-validator.ts` |
| 317 | `app/(dashboard)/campaigns/reports/meta-live-report.ts` |
| 313 | `components/shared/media-picker.tsx` |
| 311 | `app/(dashboard)/tasks/components/task-board.tsx` |
| 309 | `app/(dashboard)/articles/health/components/health-runner.tsx` |
| 307 | `app/(dashboard)/articles/components/sections/seo-best-practices-reference.tsx` (ميت — يُحذف في البند ٢) |
| 307 | `app/(dashboard)/users/actions/users-actions.ts` |
| 306 | `app/(dashboard)/clients/helpers/client-seo-config/create-organization-seo-config.ts` (ميت — يُحذف في البند ٢) |
| 304 | `app/(dashboard)/actions/listing-pages-seo-audit.ts` |
| 304 | `app/(dashboard)/orders/new/actions/create-manual-order.ts` |
| 303 | `app/(dashboard)/bunny-migration/actions/link-core-media.ts` |

### ١.٥ البند ٦ — الـDOM

أعمق شجرات JSX (أقصى عمق تداخل وسوم داخل الملف):

| العمق | الملف |
|---|---|
| 54 | `app/(dashboard)/clients/components/client-seo-form.tsx` |
| 54 | `app/(dashboard)/settings/reference-data/components/reference-data-client.tsx` |
| 33 | `app/(dashboard)/articles/components/steps/metatag-preview-step.tsx` (ميت) |
| 33 | `app/(dashboard)/settings/business/components/business-info-form.tsx` |
| 25 | `app/(dashboard)/articles/components/article-form-context.tsx` |
| 21 | `app/(dashboard)/articles/components/sections/basic-section.tsx` |
| 20 | `app/(dashboard)/sales-leads/components/lead-form.tsx` |
| 20 | `components/admin/data-table.tsx` |
| 19 | `app/(dashboard)/settings/_shared/listing-page-form.tsx` |
| 18 | `app/(dashboard)/campaigns/components/campaign-form.tsx` |
| 18 | `app/(dashboard)/modonty/pages/[slug]/components/social-links-form.tsx` |
| 18 | `app/(dashboard)/sales-leads/components/leads-table.tsx` |
| 17 | `app/(dashboard)/clients/components/client-form.tsx` |
| 17 | `app/(dashboard)/clients/components/client-table.tsx` |
| 17 | `app/(dashboard)/clients/components/edit-workspace/client-edit-workspace.tsx` |
| 17 | `app/(dashboard)/media/[id]/edit/edit-media-form.tsx` |
| 17 | `app/(dashboard)/orders/components/orders-table.tsx` |
| 17 | `app/(dashboard)/settings/advertising-platforms/advertising-platforms-form.tsx` |
| 17 | `app/(dashboard)/settings/modonty/components/modonty-form.tsx` |
| 17 | `app/(dashboard)/users/components/user-form.tsx` |
| 17 | `components/admin/wipe-orders-button.tsx` |
| 17 | `components/shared/seo-doctor/seo-doctor.tsx` |
| 17 | `components/ui/dropdown-menu.tsx` |
| 16 | `app/(dashboard)/articles/components/article-selection-table.tsx` |
| 16 | `app/(dashboard)/articles/sources/components/sources-table.tsx` |

أغلفة `<div>` بلا أي خاصية تلفّ عنصراً واحداً (مرشّحة للإزالة المباشرة):

- `app/(dashboard)/seo-images/components/image-seo-dialog.tsx` أسطر 186، 215
- `app/(dashboard)/articles/[id]/page.tsx` أسطر 63
- `app/(dashboard)/categories/[id]/components/category-view.tsx` أسطر 72
- `app/(dashboard)/changelog/changelog-client.tsx` أسطر 402
- `app/(dashboard)/clients/[id]/page.tsx` أسطر 231
- `app/(dashboard)/clients/components/edit-workspace/client-edit-workspace.tsx` أسطر 397
- `app/(dashboard)/industries/[id]/components/industry-view.tsx` أسطر 64
- `app/(dashboard)/media/[id]/edit/edit-media-form.tsx` أسطر 394
- `app/(dashboard)/tags/[id]/components/tag-view.tsx` أسطر 73
- `app/(dashboard)/users/components/user-form.tsx` أسطر 226

أغلفة بـclass واحدة بلا أثر (مثل `space-y-*` حول عنصر وحيد) تُقاس ملفاً ملفاً أثناء التنفيذ؛ كل ملف يُلمس هنا يُذكر في الـPR للفحص البصري.

### ١.٦ البند ٧ — مخالفات `folder-structure.md`

**أ) ملفات داخل مسار تستوردها مسارات شقيقة (100 ملف).** القاعدة: مسارٌ لا يستورد من شقيقه أبداً؛ ما يستعمله مساران ← `admin/lib/` أو `admin/components/shared/`. العمود «إغلاق» = عدد ملفات المسار التي يعتمد عليها الملف تعدّياً (يجب أن تنتقل معه وإلا صار `lib/` يستورد من مسار — ممنوع أيضاً).

| إغلاق | أسطر | الملف | مساره | المسارات المستورِدة |
|---|---|---|---|---|
| 0 | 65 | `app/(auth)/helpers/send-reset-email.ts` | helpers | forgot-password |
| 0 | 557 | `app/(dashboard)/clients/segment/segments.ts` | clients | actions، components، orders |
| 0 | 118 | `app/(dashboard)/articles/segment/segments.ts` | articles | actions |
| 0 | 156 | `app/(dashboard)/articles/[id]/helpers/article-view-types.ts` | articles | categories |
| 0 | 40 | `app/(dashboard)/articles/helpers/status-utils.ts` | articles | client-articles، clients، tags |
| 0 | 40 | `app/(dashboard)/media/actions/get-media-by-id.ts` | media | articles، clients |
| 0 | 151 | `app/(dashboard)/articles/helpers/word-count.ts` | articles | database |
| 0 | 42 | `app/(dashboard)/actions/article-status-counts.ts` | actions | articles |
| 0 | 176 | `app/(dashboard)/search-console/actions/removal-tracking-actions.ts` | search-console | articles |
| 0 | 245 | `app/(dashboard)/search-console/actions/pipeline-actions.ts` | search-console | articles |
| 0 | 241 | `app/(dashboard)/search-console/components/stage-details-dialog.tsx` | search-console | articles |
| 0 | 120 | `app/(dashboard)/audit-log/actions/audit-log-actions.ts` | audit-log | users |
| 0 | 108 | `app/(dashboard)/audit-log/lib/audit-labels.ts` | audit-log | users |
| 0 | 307 | `app/(dashboard)/users/actions/users-actions.ts` | users | audit-log، clients، orders |
| 0 | 73 | `app/(dashboard)/authors/actions/authors-actions/get-modonty-author.ts` | authors | seo، settings |
| 0 | 273 | `app/(dashboard)/intake/actions/intake-admin-actions.ts` | intake | briefs، clients |
| 0 | 245 | `app/(dashboard)/clients/[id]/components/intake-brief.tsx` | clients | briefs |
| 0 | 100 | `app/(dashboard)/media/actions/migrate-media-to-bunny.ts` | media | bunny-migration |
| 0 | 90 | `app/(dashboard)/categories/actions/categories-actions/delete-category.ts` | categories | settings |
| 0 | 246 | `app/(dashboard)/tags/actions/merge-tag-actions.ts` | tags | categories |
| 0 | 10 | `app/(dashboard)/orders/helpers/format-order-date.ts` | orders | clients |
| 0 | 73 | `app/(dashboard)/clients/actions/clients-actions/delete-client.ts` | clients | settings |
| 0 | 58 | `app/(dashboard)/clients/actions/clients-actions/update-client-mobile-hero.ts` | clients | media |
| 0 | 111 | `app/(dashboard)/settings/defaults/actions/defaults-actions.ts` | settings | clients |
| 0 | 432 | `app/(dashboard)/commercial-plans/actions.ts` | commercial-plans | commercial-features |
| 0 | 130 | `app/(dashboard)/helpers/get-modonty-google-summary.ts` | helpers | components |
| 0 | 60 | `app/(dashboard)/actions/errors-to-fix.ts` | actions | components |
| 0 | 136 | `app/(dashboard)/actions/reference-seo-counts.ts` | actions | components، reference |
| 0 | 46 | `app/(dashboard)/database/actions/orphan-cleaner.ts` | database | maintenance |
| 0 | 30 | `app/(dashboard)/database/actions/session-cleaner.ts` | database | maintenance |
| 0 | 27 | `app/(dashboard)/database/actions/stale-versions.ts` | database | maintenance |
| 0 | 112 | `app/(dashboard)/database/actions/index-health.ts` | database | maintenance |
| 0 | 248 | `app/(dashboard)/database/actions/orphan-scan.ts` | database | api/dev |
| 0 | 30 | `app/(dashboard)/database/actions/slug-integrity.ts` | database | maintenance |
| 0 | 52 | `app/(dashboard)/database/actions/broken-references.ts` | database | maintenance |
| 0 | 31 | `app/(dashboard)/database/actions/duplicate-slugs.ts` | database | maintenance |
| 0 | 77 | `app/(dashboard)/authors/actions/export-actions.ts` | authors | export-data |
| 0 | 58 | `app/(dashboard)/industries/actions/industries-actions/delete-industry.ts` | industries | settings |
| 0 | 61 | `app/(dashboard)/database/components/health-summary.tsx` | database | maintenance |
| 0 | 194 | `app/(dashboard)/actions/media-counts.ts` | actions | media |
| 0 | 282 | `app/(dashboard)/modonty/faq/actions/faq-actions.ts` | modonty | settings |
| 0 | 24 | `app/(dashboard)/settings/_shared/section.tsx` | settings | modonty |
| 0 | 61 | `app/(dashboard)/settings/_shared/field.tsx` | settings | modonty |
| 0 | 147 | `app/(dashboard)/modonty/setting/helpers/page-config.ts` | modonty | seo |
| 0 | 252 | `app/api/dev/rebuild-orders/plan.ts` | api/dev | orders-migration |
| 0 | 104 | `app/(dashboard)/media/actions/generate-image-seo-ai.ts` | media | seo-images |
| 0 | 10 | `app/(dashboard)/articles/components/article-row-actions.tsx` | articles | tags |
| 1 | 68 | `app/(dashboard)/articles/actions/articles-actions/mutations/delete-article.ts` | articles | settings |
| 1 | 53 | `app/(dashboard)/search-console/components/auto-fix-schema-button.tsx` | search-console | articles |
| 1 | 193 | `app/(dashboard)/search-console/components/seo-row-action.tsx` | search-console | articles |
| 1 | 73 | `app/(dashboard)/clients/components/edit-workspace/open-client-console-button.tsx` | clients | briefs |
| 1 | 57 | `app/(dashboard)/clients/actions/clients-actions/generate-client-seo.ts` | clients | bunny-migration، client-galleries، database، industries، media، seo |
| 1 | 99 | `app/(dashboard)/categories/actions/categories-actions/create-category.ts` | categories | settings |
| 1 | 158 | `app/(dashboard)/categories/actions/categories-actions/update-category.ts` | categories | settings |
| 1 | 699 | `app/(dashboard)/settings/reference-data/actions/reference-data-actions.ts` | settings | clients |
| 1 | 4 | `app/(dashboard)/analytics/actions/analytics-actions.ts` | analytics | clients |
| 1 | 16 | `app/(dashboard)/inspect/helpers/open-inspect.ts` | inspect | clients |
| 1 | 694 | `app/(dashboard)/actions/dashboard-actions.ts` | actions | components |
| 1 | 80 | `app/(dashboard)/industries/actions/industries-actions/create-industry.ts` | industries | settings |
| 1 | 83 | `app/(dashboard)/orders-migration/helpers/plan-rebuild.ts` | orders-migration | migrations |
| 1 | 44 | `app/(dashboard)/settings/_shared/status-badge.tsx` | settings | modonty |
| 2 | 174 | `app/(dashboard)/media/actions/optimize-image.ts` | media | articles، clients، modonty |
| 2 | 69 | `app/(dashboard)/search-console/components/view-schema-validation-button.tsx` | search-console | articles |
| 2 | 123 | `app/(dashboard)/audit-log/components/audit-log-table.tsx` | audit-log | users |
| 2 | 246 | `app/(dashboard)/articles/components/article-table.tsx` | articles | categories |
| 2 | 255 | `app/(dashboard)/orders-migration/components/rebuild-orders-panel.tsx` | orders-migration | migrations |
| 2 | 326 | `app/(dashboard)/media/actions/save-image-seo.ts` | media | seo-images |
| 2 | 48 | `app/(public)/components/doc-layout.tsx` | components | playbook |
| 3 | 147 | `app/(dashboard)/components/seo-health-card.tsx` | components | actions |
| 3 | 146 | `app/(dashboard)/database/actions/legalform-sanitizer.ts` | database | maintenance |
| 3 | 229 | `app/(dashboard)/database/actions/canonical-sanitizer.ts` | database | maintenance، seo |
| 3 | 144 | `app/(dashboard)/industries/actions/industries-actions/update-industry.ts` | industries | settings |
| 5 | 290 | `app/(dashboard)/clients/actions/clients-actions/create-client.ts` | clients | settings |
| 6 | 1309 | `app/(dashboard)/settings/actions/settings-actions.ts` | settings | articles، authors، clients، modonty، seo، seo-images |
| 6 | 169 | `app/(dashboard)/authors/helpers/build-modonty-author-seo.ts` | authors | seo |
| 6 | 58 | `app/(dashboard)/seo/actions/author-seo-repair.ts` | seo | bunny-migration |
| 6 | 145 | `app/(dashboard)/seo/actions/cascade-all-seo.ts` | seo | settings |
| 7 | 41 | `app/(dashboard)/settings/helpers/get-article-defaults-from-settings.ts` | settings | articles، modonty |
| 7 | 353 | `app/(dashboard)/seo-images/helpers/load-groups.ts` | seo-images | articles، media |
| 7 | 4 | `app/(dashboard)/media/actions/media-actions.ts` | media | clients |
| 8 | 31 | `app/(dashboard)/media/actions/get-seo-image-row.ts` | media | articles |
| 9 | 473 | `app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts` | articles | settings |
| 10 | 280 | `app/(dashboard)/seo-images/components/image-seo-dialog.tsx` | seo-images | articles |
| 11 | 207 | `app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts` | modonty | actions، bunny-migration |
| 11 | 3 | `app/(dashboard)/authors/actions/authors-actions.ts` | authors | articles |
| 11 | 3 | `app/(dashboard)/industries/actions/industries-actions.ts` | industries | clients |
| 11 | 592 | `app/(dashboard)/database/components/db-tools-section.tsx` | database | maintenance |
| 12 | 304 | `app/(dashboard)/actions/listing-pages-seo-audit.ts` | actions | components |
| 12 | 110 | `app/(dashboard)/industries/actions/export-actions.ts` | industries | export-data |
| 20 | 388 | `app/(dashboard)/articles/actions/articles-actions/mutations/create-article.ts` | articles | settings |
| 28 | 2 | `app/(dashboard)/clients/actions/clients-actions.ts` | clients | media |
| 28 | 362 | `app/(dashboard)/database/components/auto-maintenance-panel.tsx` | database | maintenance |
| 29 | 114 | `app/(dashboard)/clients/components/client-logo-modal.tsx` | clients | articles |
| 29 | 178 | `app/(dashboard)/clients/actions/export-actions.ts` | clients | export-data |
| 37 | 2 | `app/(dashboard)/articles/actions/articles-actions.ts` | articles | categories، tags |
| 38 | 149 | `app/(dashboard)/articles/actions/export-actions.ts` | articles | export-data |
| 39 | 410 | `app/(dashboard)/tags/actions/tags-actions.ts` | tags | articles، settings |
| 39 | 901 | `app/(dashboard)/articles/components/rich-text-editor.tsx` | articles | modonty |
| 40 | 126 | `app/(dashboard)/tags/actions/export-actions.ts` | tags | export-data |
| 47 | 119 | `app/(dashboard)/categories/actions/export-actions.ts` | categories | export-data |

**ب) ملفات جذرية يستعملها مسار واحد فقط (55 ملف)** ← تنتقل داخل مجلّد ذلك المسار. (`components/ui/*` بدائيات shadcn تبقى في مكانها — مجلّد الأداة لا مجلّد مسار.)

| الملف | المسار الوحيد |
|---|---|
| `app/components/providers/providers.tsx` | app-root |
| `components/admin/db-badge.tsx` | (dashboard)-root |
| `components/admin/essential-seo-dialog.tsx` | (dashboard)-root |
| `components/admin/header.tsx` | (dashboard)-root |
| `components/admin/sidebar.tsx` | (dashboard)-root |
| `components/admin/task-progress.tsx` | bunny-migration |
| `components/admin/three-column-workspace.tsx` | clients |
| `components/gtm/GTMContainer.tsx` | app-root |
| `components/icons/whatsapp-icon.tsx` | components |
| `components/shared/media-library/media-filters.tsx` | media |
| `components/shared/media-library/media-stats.tsx` | media |
| `components/shared/media-picker.tsx` | clients |
| `components/shared/order-internal-note.tsx` | orders |
| `components/shared/thumbnail-image-view.tsx` | articles |
| `components/tasks/task-dialog.tsx` | tasks |
| `components/ui/toaster.tsx` | app-root |
| `lib/analytics/book-funnel.ts` | analytics |
| `lib/atlas/billing-alert.ts` | api/cron |
| `lib/bing-webmaster/client.ts` | bing-webmaster |
| `lib/clients/payment-state/index.ts` | clients |
| `lib/console-access.ts` | clients |
| `lib/contact-requests/contact-request-statuses.ts` | contact-requests |
| `lib/contact-requests/count-new-contact-requests.ts` | (dashboard)-root |
| `lib/default-client-password.ts` | clients |
| `lib/email/templates/article-pending.ts` | emails |
| `lib/email/templates/article-published.ts` | emails |
| `lib/gsc/cached.ts` | search-console |
| `lib/gsc/coverage.ts` | search-console |
| `lib/gsc/parse-sitemap.ts` | search-console |
| `lib/health/article-health.ts` | articles |
| `lib/invoices/add-months.ts` | orders |
| `lib/invoices/find-blocking-unpaid-invoice.ts` | orders |
| `lib/invoices/next-invoice-number.ts` | orders |
| `lib/invoices/send-invoice-action.ts` | orders |
| `lib/media/reencode-to-webp.ts` | media |
| `lib/media/sync-entity-image-urls.ts` | media |
| `lib/openai-article-generator.ts` | articles |
| `lib/orders/activate-from-order.ts` | clients |
| `lib/orders/is-migrated-order.ts` | orders |
| `lib/orders/link-order-to-client.ts` | orders |
| `lib/orders/renewals-due.ts` | components |
| `lib/orders/start-service-clock.ts` | articles |
| `lib/payments/refund-tamara-order.ts` | orders |
| `lib/pricing/get-featured-plan-price.ts` | playbook |
| `lib/sanitize-html.ts` | articles |
| `lib/seo/article-validator-db.ts` | articles |
| `lib/seo/build-list-author-node.ts` | modonty |
| `lib/seo/crux-history.ts` | kpi |
| `lib/seo/page-validator.ts` | api/seo |
| `lib/seo/repair-entity-name-drift.ts` | database |
| `lib/seo/strip-client-name-from-seo-title.ts` | seo |
| `lib/seo-images/draft-image-seo-batch.ts` | seo-images |
| `lib/seo-images/get-draft-targets.ts` | seo-images |
| `lib/seo-images/rename-image-batch.ts` | seo-images |
| `lib/utils/image-seo.ts` | modonty |

**ج) تسمية:** `app/(dashboard)/settings/_shared/` (القاعدة: لا شرطة سفلية) · مجلّدات `lib/` داخل مسارات: `users/lib` · `articles/workflow/lib` · `audit-log/lib` · `settings/reference-data/lib` · `media/components/upload-zone/utils` (القاعدة: `helpers/`).

**د) ما ينتمي لـ`shared/` (لا يُنقل، يُكتب في التقرير):** يُحدَّد أثناء التنفيذ — أي دالة يتبيّن أن لها نسخة في `modonty/` أو `console/`.

### ١.٧ البند ٨ — أفضل الممارسات (قياس أوّلي)

| المؤشّر | العدد | المعالجة |
|---|---|---|
| `any` صريح | 47 | يُستبدل فقط حيث النوع الصحيح واضح ولا يغيّر السلوك؛ الباقي تقرير |
| `as X` | 774 | تقرير (تغيير الأنواع قد يُخفي أخطاء حقيقية) |
| ملفات `useEffect` | 75 | مراجعة react-best-practices؛ ما يغيّر توقيت الرندر = تقرير فقط |
| `"use client"` | 489 | لا يُزال أثناء التنظيف (تغيير حدود السيرفر/العميل = سلوك)؛ المرشّحون في التقرير |
| استيرادات/متغيّرات غير مستعملة | 201 | تُحذف (البند ٥) |
| `catch {}` فارغ | 2 | لا يُلمس ولا يُستحدث مثله |

## ٢. الخطة — أقسام مرتّبة من الأقلّ خطراً للأعلى، commit لكل قسم

بعد كل commit: `pnpm install` · `pnpm --filter ./admin exec tsc --noEmit` · `pnpm --filter ./admin build` — صفر أخطاء وإلا يُرجَع.

| القسم | المحتوى | الطريقة |
|---|---|---|
| S0 | هذه الخطة (توثيق فقط) | لا كود |
| S1 | البند ٢ — حذف الكود الميت: الملفات الـ144 ثم التصديرات غير المستعملة | حذف بدليلين؛ tsc يكشف أي استيراد مكسور |
| S2 | البند ٣ — دمج المكرّر المتطابق (escapeCsvValue ×6 · requireAuth ×6 · ensureAbsoluteUrl ×8 · prettyJson ×5 · tone ×4 · ScoreBar/ScorePill ×3 · getSortIcon ×3 · mapCategory ×3 · parseLanguageCodes ×2 · …) | نسخة واحدة في lib/ أو components/shared/ والباقي يستوردها |
| S3 | البند ٧-ب — نقل الملفات الجذرية ذات المسار الوحيد إلى مسارها (55) | git mv + تحديث imports |
| S4 | البند ٧-أ — ترقية الملفات المستوردة من مسارات شقيقة إلى lib/ أو components/shared/ مع إغلاقها (الإغلاق الصغير أوّلاً)؛ الإغلاقات الكبيرة (barrels: articles-actions · tags-actions · clients-actions · export-actions · rich-text-editor) تُقيَّم ملفاً ملفاً وما لا يُنقل بأمان يُكتب في التقرير | git mv + تحديث imports؛ tsc |
| S5 | البند ٧-ج — إزالة `_shared` → `shared`، `lib/` داخل المسارات → `helpers/` | إعادة تسمية مجلّدات + imports |
| S6 | المسارات الصغيرة والمنخفضة الخطر (البنود ١ · ٤ · ٥ · ٦ · ٨): (auth) · (public)/playbook · analytics · audit-log · authors · bing-webmaster · briefs · bunny · bunny-migration · changelog · chatbot-questions · client-articles · client-galleries · commercial-* · commission-statement · contact-* · daily-tasks · emails · export-data · feedback · inbox · inspect · intake · kpi · maintenance · members · migrations · orders-migration · pay-preview · payment-failures · reels · reference · referrals · sales-commissions · seo-health · subscribers · system-errors · tasks · users | subagents بالتوازي، كل مجموعة commit |
| S7 | المسارات المتوسّطة: categories · tags · industries · campaigns · sales-leads · search-console · seo · seo-images · media · database · modonty · orders · dashboard home (components/actions/helpers) | subagents بالتوازي |
| S8 | `lib/` و `components/` الجذرية (البنود ٤ · ٥ · ٨): lib/seo (knowledge-graph-generator 1076 · article-validator-db 812 · jsonld-validator 725 · …) · components/admin (sidebar 821 · sync-local-button 535) · components/shared | subagent |
| S9 | settings (56 ملفاً · reference-data-client 1553 · settings-actions 1308 · seed-integration-test 1119) | أعلى خطراً — آخراً |
| S10 | clients (150 ملفاً · 25k سطر) | أعلى خطراً |
| S11 | articles (232 ملفاً · 29k سطر · pipeline-runner 1084 · metatag-preview-step 987 · rich-text-editor 900 · article-form-context 857) | الأعلى خطراً — الأخير |

## ٣. ما يُكتب في التقرير ولا يُنفَّذ

- أي دمج لدوال متشابهة غير متطابقة حرفياً.
- إزالة `"use client"` أو إضافة `useMemo`/`useCallback`/`React.memo` (تغيير توقيت الرندر).
- أي تغيير في `select`/ترتيب/كاش/نصوص/روابط/SEO.
- ما ينتمي لـ`shared/` (نسخ مكرّرة عبر التطبيقات).
- الأخطاء الحقيقية المكتشفة أثناء القراءة — تُسجَّل بملف:سطر ولا تُصلَح.
