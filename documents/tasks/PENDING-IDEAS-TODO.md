# 💭 Pending Ideas — Brainstorm & Future Features

**Last Updated:** 2026-05-21 (6 active ideas + 5 done · auto-maintenance now 10 steps · Cloudinary Orphans + Sitemap Freshness + Soft-Deleted Comments shipped this session)
**Purpose:** ملف يجمع كل الأفكار المُلتقطة عبر shortcut **"reminder"** قبل ما تتحوّل لخطط تفصيلية.

> **القاعدة:** كل فكرة هنا = `[ ]` فارغ، عنوان قصير + وصف موجز + تاريخ الإضافة.
> لما الفكرة تنضج وتصير جاهزة للتنفيذ → تنتقل لملف TODO مستقل أو لـ MASTER-TODO.

---

## 💡 أفكار قيد التفكير

### ~~Reconcile getMediaStats.unused vs getMedia({used:false}).total~~ ✅ DONE 2026-05-21 (Session 104e)

- [x] **fixed** — created `admin/lib/media/usage-where.ts` exposing `MEDIA_USED_WHERE` + `MEDIA_UNUSED_WHERE` (OR of featuredArticles + logoClients + heroImageClients). Wired in both `get-media.ts` filter and `get-media-stats.ts` counts. Also dropped `clientId: { not: null }` from stats and added `scope: { not: "PLATFORM" }` filter (matches `/media` list default scope). Result: banner "6 unused" now matches filter result "6 results" 1:1. Live verified.

### ~~Canonical URL Sanitizer~~ ✅ DONE 2026-05-21 (Session 104e)

- [x] **Built and wired** — `admin/.../database/actions/canonical-url-sanitizer.ts` + UI card in db-tools-section + Step 6 in run-all-maintenance.ts. Detects stale canonicals (bad hosts + mismatched expected) and regenerates via `new URL(/articles/${slug}, settings.siteUrl).href`. Auto-Maintenance is now 7 steps and closes the Session 104b gap end-to-end.

### 🔧 Auto-Maintenance Candidates (proposed in Session 104e — ranked by value)

Following the project rule [`project_auto_maintenance_rule.md`](../../../../.claude/projects/c--Users-w2nad-Desktop-dreamToApp-MODONTY/memory/project_auto_maintenance_rule.md): all new maintenance must be wired into Run-All on `/database`, not standalone cards.

- [x] **🥇 Cloudinary Orphan Sweep** ✅ DONE 2026-05-21 — built `cloudinary-orphans.ts` with hard-coded MODONTY_PREFIXES safety scope (`modonty/`, `general/`, `clients/`, `admins/` only — other projects' files untouchable). Min-age 1h guard against in-flight uploads. Live test cleaned 84 real orphan files in one run.
- [ ] **🥈 Analytics & Article Views Decay** — `Analytics` and `ArticleView` tables grow unbounded with every visit. Delete rows older than 365 days. **Value: prevents DB bloat.** Complexity: trivial (`deleteMany` with `createdAt: { lt: cutoff }`).
- [ ] **🥉 Notifications Cleanup** — delete read notifications (`readAt != null`) older than 30 days. Complexity: trivial.
- [ ] **4️⃣ articleBodyText Cache Reconciliation** — for `status=PUBLISHED && articleBodyText IS NULL/empty`, regenerate via existing `extractPlainText(content)` helper. **Value: improves JSON-LD `articleBody` field for Google rich results.**
- [x] **5️⃣ Soft-Deleted Comments Hard Delete (30d)** ✅ DONE 2026-05-21 — built `soft-deleted-comments.ts` + wired as Step 10 in auto-maintenance. Deletes both `Comment.status=DELETED` + `ClientComment.status=DELETED` rows older than 30 days. 30d window matches Disqus/WordPress/Facebook/Twitter industry standard.
- [x] ~~**Chatbot Messages Decay**~~ ❌ EXCLUDED 2026-05-21 — Khalid: "نخليها لأنه ممكن بعد كذا نعمل تحليل بيانات ونشوف الناس بتسأل عليه." chatbot_messages stay forever for future analytics on user questions. NOT a candidate for auto-maintenance.
- [ ] **7️⃣ Unsubscribed Newsletter Subscribers Cleanup** — `NewsSubscriber.unsubscribedAt > 6 months` → hard delete (GDPR-friendly). Frees the email for clean re-subscribe later.
- [ ] **8️⃣ Conversion + CampaignTracking Decay** — like Analytics — old rows beyond 365 days. Trivial.
- [ ] **9️⃣ Article Counter Reconciliation** — if Article has cached counters (e.g. viewsCount/likesCount/favoritesCount), reconcile against actual ArticleView/ArticleLike/ArticleFavorite counts.
- [ ] **🔟 Orphan Tags/Categories Detection** — taxonomy entries with zero articles. NOT auto-fixable (needs human decision) — likely belongs on `/tags` + `/categories` admin pages instead of auto-maintenance.
- [x] **7️⃣ Sitemap Freshness Ping** ✅ DONE 2026-05-21 — built `sitemap-freshness.ts` with 24h staleness threshold via GSC `lastSubmitted` timestamp. Re-submits via existing `submitSitemap()`. Live test re-submitted both `/sitemap.xml` and `/image-sitemap.xml` to GSC.

**Sources consulted:** MongoDB Atlas best practices (TTL + time-series cleanup), Cloudinary Admin API docs (list resources), Google Search Central (sitemap freshness + Article rich result requirements), Next.js cache revalidation patterns.

**Top-3 recommendation:** start with Cloudinary Orphans + Views Decay + articleBodyText Reconciliation — saves money + prevents bloat + improves SEO. Awaiting Khalid's pick.

### Reviews System on modonty.com

- [ ] **نظام مراجعات لمنصة مودونتي نفسها** — Added: 2026-05-21
  - **الفكرة:** العملاء يدخلون ويكتبون reviews لصفحة المشروع / صفحة مودونتي الرئيسية
  - **المطلوب التفكير فيه:**
    - أين تُعرض المراجعات؟ صفحة منفصلة `/reviews` أم section في الرئيسية؟
    - من يستطيع الكتابة — العملاء فقط (مسجَّلين عبر console) أم أي زائر؟
    - شكل الـ UI: cards · slider · grid · timeline؟
    - نظام تقييم: نجوم ١-٥؟ أم emoji reactions؟
    - عرض اسم العميل + شعاره + قطاعه + رأيه + التاريخ؟
    - SEO: JSON-LD `Review` + `AggregateRating` لكسب نجوم في نتائج جوجل
    - الفلترة + الترتيب (الأحدث · الأعلى تقييم · حسب القطاع)
    - الاعتدال (moderation): pre-approval قبل النشر؟
  - **القيمة:** Social proof قوي جداً — الزوار الجدد يثقون بآراء عملاء حقيقيين أكثر من الإعلان

### QR Code على صفحة العميل

- [ ] **QR Code خاص بصفحة العميل** — Added: 2026-05-21
  - **الفكرة:** كل عميل عنده QR Code يخص صفحته على مودونتي، يقدر:
    - يشاركه مباشرة (نسخ صورة / واتساب / تويتر)
    - يحمّله كـ PNG من صفحته في الكونسول
  - **التقاطع:** يتقاطع مع [SHORT-LINK-SYSTEM-TODO.md](SHORT-LINK-SYSTEM-TODO.md) Phase 3 — الـ QR الذي يُولَّد للرابط القصير الخاص بصفحة العميل. يبقى عرضه + زر التحميل في الكونسول.
  - **المطلوب التفكير فيه:**
    - أين يظهر الـ QR في الكونسول — Sidebar widget · ضمن "بيانات شركتك" · صفحة مستقلة؟
    - تصميم الـ QR: شعار مودونتي في الوسط؟ ألوان البراند؟
    - مقاسات التحميل: 512×512 للويب · 1024×1024 للطباعة · SVG قابل للتكبير اللانهائي
    - استخدامات: بطاقات العمل · البروشورات · الفواتير · واجهة المحل
  - **القيمة:** ربط فوري بين العالم المادي (بطاقة عمل) والعالم الرقمي (صفحة مودونتي)

### Admin Broadcaster — نشر رابط العميل في كل قنواتنا الاجتماعية بضغطة

- [ ] **زر نشر موحَّد في الأدمن — يبعت رابط العميل لكل قنوات مودونتي الاجتماعية** — Added: 2026-05-21
  - **الفكرة (بكلام خالد):** نضيف في الأدمن إضافة رابط نقدر نرسله للعميل في كل منصات التواصل الاجتماعية تبعت كل مشاريعنا
  - **المطلوب التفكير فيه:**
    - **القنوات المستهدَفة (لكل مشاريعنا):**
      - واتساب (قناة مودونتي + قنوات المشاريع الفرعية)
      - تلجرام (قناة مودونتي + قنوات المشاريع الفرعية)
      - تويتر / X (حسابات متعدّدة)
      - لينكدإن (صفحة الشركة + الحساب الشخصي للمؤسس)
      - فيسبوك (page)
      - إنستجرام (Stories + Posts)
      - تيك توك (لو موجودة)
      - ثريدز / بلوسكاي (اختياري)
    - **نقطة البدء:** الأدمن في صفحة العميل/المقال/الحدث → زر "📣 نشر في كل القنوات"
    - **شكل التحرير قبل النشر:**
      - نص افتراضي مولَّد من العنوان + الوصف
      - تخصيص لكل قناة (تويتر قصير · لينكدإن طويل · انستجرام بصور)
      - الرابط القصير من Short Link System (لكل قناة UTM source مختلف للقياس)
      - رفع صور جاهزة بصيغ مختلفة (1:1 لانستجرام · 16:9 لتويتر · 4:5 لفيسبوك)
    - **التكامل التقني:**
      - واتساب: WhatsApp Business API + Cloud API
      - تلجرام: Bot API (موجود — see TELEGRAM-TODO)
      - تويتر: API v2 (مدفوع — مستوى Basic ١٠٠$ شهرياً)
      - لينكدإن: Marketing Developer Platform
      - فيسبوك/انستجرام: Meta Graph API (مجاني لكن مراجعة معقّدة)
    - **الحوكمة:**
      - منع النشر المتكرر (debounce ٢٤ ساعة لنفس الرابط)
      - مراجعة قبل الإرسال (preview صفّ كل القنوات قبل ضغطة "أرسل الكل")
      - تسجيل في DB: مَن نشر · متى · إلى أي قنوات · ضغطات النتيجة
    - **القياس:**
      - لوحة "أداء الحملات" — رابط واحد عبر ٦ قنوات → كم ضغطة من كل قناة
      - أعلى قناة تحوّلاً لكل نوع محتوى (مقال · عميل · حدث)
    - **التحدّيات:**
      - APIs مدفوعة (تويتر بالخصوص)
      - حدود يومية في الإرسال (Rate Limits)
      - مراجعة Meta + LinkedIn قد تأخذ أسابيع
      - الحاجة لرفع الصور بأحجام مختلفة (يصلح Cloudinary transformations)
  - **القيمة:**
    - **توفير وقت ضخم:** الأدمن ينشر مرة واحدة بدل ١٠ مرات
    - **توحيد الرسالة:** نفس المحتوى عبر كل القنوات
    - **قياس دقيق:** الرابط القصير + UTM = نعرف أي قناة الأفضل لكل نوع محتوى
    - **قيمة بيعية:** يصير ميزة لبيع باقات أعلى — "ننشر لك في ٨ قنوات بضغطة"

### إعادة تصميم صفحة العميل في الـ Admin + ربطها بالكونسول

- [ ] **صفحة العميل في الأدمن تحتاج تجديد كامل + ربط Admin ↔ Console** — Added: 2026-05-21
  - **الفكرة:** البيانات اللي يضيفها العميل في الكونسول (وخصوصاً **الاستبيان / Intake**) لازم تظهر في صفحة العميل في الأدمن. الأدمن حالياً ما يشوف ماذا أدخل العميل من جهته.
  - **المطلوب التفكير فيه:**
    - **Tabs/Sections في صفحة العميل بالأدمن:**
      - Identity (موجود) — الاسم/الإيميل/العنوان
      - Subscription (موجود) — الباقة/الحالة/المدّة
      - **Intake (جديد)** — كل ما أدخله العميل في الكونسول (Voice · Audience · Story · Customers · Strategy · Competition · YMYL) بصيغة "للقراءة فقط"
      - **Engagement (جديد)** — مشاهدات/تعليقات/أسئلة/تقييمات
      - **Activity (جديد)** — متى آخر دخول؟ كم مرة فتح الكونسول؟ كم رابط شارك؟
    - **مصدر البيانات:**
      - الـ Intake محفوظ في `client.intake` JSON (مرَّ من Phase 2 الجلسة الماضية)
      - الأدمن يقرأ نفس المصدر — لا ازدواجية، لا تكرار
    - **شكل العرض:**
      - Sidebar مع روابط أقسام (مثل صفحة المقالات الجديدة)
      - أو Tabs أفقية في رأس الصفحة
      - أو Accordion للقراءة المُجمَّعة
    - **مزامنة فورية:** التعديل في الكونسول → يظهر في الأدمن فوراً (بدون reload يدوي) عبر revalidatePath
    - **إعادة تصميم بصري:** الصفحة الحالية مكدّسة الحقول، تحتاج تنظيم منطقي + تباعد + ألوان قطاعية
    - **زر "افتح صفحة العميل في الكونسول"** — يفتح live preview كما يراها العميل
    - **سجل التغييرات (Audit Log):** من عدّل ماذا ومتى (الأدمن أم العميل)؟
    - **حقول جديدة قد تُضاف لاحقاً:** الخدمات (من الفكرة ٣) · QR (من الفكرة ٢) · المراجعات الواردة (من الفكرة ١)
  - **القيمة:** الأدمن يصير عنده "صورة كاملة ٣٦٠ درجة" عن كل عميل · يستطيع تقديم خدمة أعلى لأنه يعرف ماذا يفكر العميل · يقلّل الاتصالات الجانبية بين الفريق والعميل لجمع المعلومات

### تحسين قسم "شركاء النجاح" في الصفحة الرئيسية

- [ ] **قسم "شركاء النجاح" — الشعارات صغيرة ومش واضحة** — Added: 2026-05-21
  - **الملاحظة من خالد:** الشعارات الحالية في القسم صغيرة، الزائر ما يقدر يميّز العلامات التجارية بسهولة
  - **المطلوب التفكير فيه:**
    - تكبير حجم الشعارات (مثلاً ١٢٠×٦٠ بدل ٨٠×٤٠) أم زيادة المساحة لكل شعار؟
    - خلفية موحّدة لكل شعار (white card · soft gradient · grey neutral) تضمن وضوح حتى للشعارات الملوّنة
    - التحوّم (hover): تكبير + إظهار اسم الشركة + رابط للصفحة
    - عرض carousel (متحرّك تلقائياً) أم grid ثابت؟
    - مودات بصرية: lazy load · skeleton placeholder · WebP بحجم منخفض
    - Responsive: ٢ شعار على الموبايل · ٤ على التابلت · ٦ على الديسكتوب
    - Marquee infinite scroll مع تباطؤ عند التحوّم
    - عنوان القسم احترافي أكثر (مثلاً "شركات تثق بمودونتي" بدل "شركاء النجاح")
    - CTA بسيط أسفل القسم "كن جزءاً من المنظومة"
  - **القيمة:** Social proof من أهم عوامل التحويل — لو الزائر ما يقدر يميّز الشعار، يضيع الإفادة كلها

### جديد مودونتي (What's New)

- [ ] **صفحة/قسم "جديد مودونتي" مدعومة من القنوات الاجتماعية** — Added: 2026-05-21
  - **الفكرة:** عندنا قناة واتساب جاهزة، وحنعمل قناة تلجرام. كل ما ننزل تحديث/خبر/إعلان في القنوات، يظهر تلقائياً في "جديد مودونتي" على الموقع
  - **المطلوب التفكير فيه:**
    - مصدر البيانات: webhook من Telegram Channel + WhatsApp Business API؟ أم نسخ يدوي من admin؟
    - UI: شريط متحرّك (ticker) في أعلى الصفحة الرئيسية؟ صفحة `/news` مستقلة؟ Sidebar widget؟ Modal تنبيه؟
    - الشكل البصري: timeline · feed · cards مكدّسة · stories style (مثل Instagram)؟
    - badge أحمر "جديد" يدور حتى يقرأ الزائر
    - عرض الصور/الفيديوهات المرفقة في الإعلانات
    - دمج روابط القنوات في الـ footer + CTA "تابعنا"
    - SEO: JSON-LD `NewsArticle` أو `BlogPosting` للأخبار المهمة
    - الإشعارات للعملاء المسجَّلين (browser push + Telegram bot)
    - الأرشيف: عرض كل الإعلانات السابقة بتاريخها
  - **القيمة:** يخلق شعور "المنصة حيّة وتتطور" + يحفّز الزيارات المتكررة + يبني مجتمعاً نشطاً

### قسم خدمات العميل

- [ ] **قسم "الخدمات" في صفحة العميل** — Added: 2026-05-21
  - **الفكرة:** قسم منظَّم في صفحة العميل يعرض الخدمات اللي يقدمها، بصورة احترافية ومرتّبة
  - **المطلوب التفكير فيه:**
    - بنية البيانات: خدمة = `{name, description, icon?, price?, image?, ctaUrl?}`
    - في schema: نموذج `ClientService` جديد مع علاقة `Client.services[]`
    - الـ UI: cards grid مع أيقونات · accordion · tabs؟
    - عرض الأسعار: مرئية أم "اتصل للاستفسار"؟
    - زر CTA لكل خدمة (واتساب · اتصال · طلب)
    - إدارة الخدمات في الكونسول: إضافة · تعديل · ترتيب · حذف
    - SEO: JSON-LD `Service` schema + `OfferCatalog` للعميل
  - **القيمة:** صفحة العميل تتحوّل من "ملف تعريف" إلى "متجر خدمات" حقيقي

---

---

## 🔬 جلسات Audit مؤجَّلة

### JSON-LD Output Audit — مرشّحات للتنظيف (موثَّقة بـ grep يدوي)

- [ ] **`Client.keywords` (String[]) — حذف كامل (~٣٣ موقع في ١٧ ملف)** — Added: 2026-05-21 (Updated 2026-05-21 with full inventory)

  ### السياق
  - **النية الأصلية:** الـ hint يقول "كلمات مفتاحية للكتّاب — مفصولة بفاصلة" + schema comment يقول "Keywords for classification"
  - **الواقع:** الكتّاب لا يرونها · الـ classification غير مُنفَّذ · فقط تظهر في Organization JSON-LD (Google لا يستخدمها للترتيب)
  - **البديل المعاصر:** `ClientKeyword` model في الكونسول (غني + intent + priority + reason + client-controlled)
  - **النمط:** نفس seoKeywords لكن أكبر بـ ٧٠٪
  - **الأدلة الأربعة:** Google docs · Ahrefs 2025 (1885 صفحة) · SearchViu empirical · zero AI extraction → صفر فائدة قابلة للقياس

  ### الجرد الكامل (~٣٣ موقع)

  **١. Prisma Schema (١):**
  - `dataLayer/prisma/schema/schema.prisma:360` — `keywords String[] // Keywords for classification`

  **٢. JSON-LD Generators (٨):**
  - `admin/lib/seo/knowledge-graph-generator.ts:471`
  - `admin/lib/seo/structured-data.ts:128`
  - `admin/lib/seo/generate-complete-organization-jsonld.ts:424-425`
  - `admin/lib/seo/generate-complete-organization-jsonld.ts:438-440` ⚠️ يُستخدم لتوليد `knowsAbout` schema (fallback لـ industry.name + contentPriorities موثَّق)
  - `admin/.../clients/helpers/client-seo-config/generate-organization-structured-data.ts:38-39`
  - `admin/.../modonty/setting/helpers/build-clients-page-jsonld.ts:61, 264-267`
  - `admin/.../modonty/setting/actions/generate-home-and-list-page-seo.ts:193`
  - `modonty/lib/seo/index.ts:366`

  **٣. UI Displays (٣):**
  - `admin/.../clients/[id]/components/tabs/basic-info-tab.tsx:64 (type), 183-185 (display)`
  - `admin/.../clients/[id]/components/tabs/additional-tab.tsx:9 (type), 44-46 (display)`
  - `admin/.../clients/[id]/components/client-tabs.tsx:52 (type)`

  **٤. Admin Form Input (٤):**
  - `admin/.../clients/components/form-sections/seo-section.tsx:72, 88, 121, 392-408` — FormTextarea + validation logic
  - `admin/.../clients/components/form-sections/business-section.tsx:79` ⚠️ مجرد hint borrow لحقل `contentPriorities`، يحتاج replacement hint
  - `admin/.../clients/components/client-form.tsx:86, 96`

  **٥. Validation Schemas (٢):**
  - `admin/.../clients/actions/clients-actions/client-server-schema.ts:75`
  - `admin/.../clients/helpers/client-form-schema.ts:279`

  **٦. Server Mutations (٣):**
  - `admin/.../update-client-grouped.ts:609 (select), 627 (write)`
  - `admin/.../create-client.ts:120`
  - `admin/.../generate-client-seo.ts:101`

  **٧. Helpers + Mapping + Config (٩):**
  - `admin/.../clients/helpers/client-field-mapper.ts:78`
  - `admin/.../clients/helpers/build-client-seo-data.ts:44, 135`
  - `admin/.../clients/helpers/map-initial-data-to-form-data.ts:27, 126`
  - `admin/.../clients/helpers/hooks/use-client-form.ts:128`
  - `admin/.../clients/helpers/client-form-config.ts:142`
  - `admin/.../clients/helpers/generate-client-test-data.ts:97`
  - `admin/.../clients/helpers/client-seo-config/client-jsonld-storage.ts:48, 125`
  - `admin/.../clients/helpers/client-seo-config/create-organization-seo-config.ts:129`
  - `admin/.../clients/helpers/client-field-mapping.ts:679-795` ⚠️ ملف توثيق رسمي للحقل

  **٨. i18n Labels (٣):**
  - `admin/lib/messages/ar.ts:272` — `keywords: 'كلمات مفتاحية للكتّاب — مفصولة بفاصلة'`
  - `admin/lib/messages/en.ts:272` — `keywords: 'Keywords for writers — comma-separated'`
  - `admin/lib/messages/types.ts:225` — type entry

  **٩. Console: صفر** — يستخدم `ClientKeyword` model بدلاً منه

  ### تنبيهات قبل التنفيذ
  - **⚠️ `knowsAbout` schema** يستخدم `client.keywords` كـ fallback. عند الحذف: fallback لـ `industry.name + contentPriorities` (موثَّق في field-mapping.ts:791)
  - **⚠️ `business-section.tsx:79`** يستعير hint من i18n keywords (لكن للحقل `contentPriorities`)، يحتاج replacement hint قبل حذف i18n entry
  - **⚠️ `client-field-mapping.ts`** ملف توثيق ضخم يحتاج تحديث

  ### حجم العمل
  - **١٧ ملف · ~٣٣ موقع**
  - يأخذ ~٢ ساعة بحذر
  - نفس pipeline seoKeywords (٨ phases مع TSC checkpoints)
  - **لا يربط بسير عمل عاجل** — يمكن تأجيله بدون ضرر

  ### القرار
  بانتظار جلسة مخصّصة "على رواقة" حسب طلب خالد 2026-05-21

- [ ] **استراتيجي: ربط `ClientKeyword` بسير الكتابة في admin** — Added: 2026-05-21
  - **الوضع الحالي:** `ClientKeyword` ميزة حيّة في الكونسول (العميل يدخل keyword + intent + priority + reason)
  - **المشكلة:** admin article editor لا يعرضها للكاتب → بيانات تُجمَع بدون استخدام
  - **الفعل المقترح:** عرض ClientKeyword في article editor كـ "guidance card" — يساعد الكاتب يعرف ماذا يريد العميل
  - **القيمة:** يحوّل feature معطّلة جزئياً إلى ميزة فعلية + يربط console ↔ admin
  - **الأولوية:** متوسطة — ميزة منتج، ليس bug

- [ ] **`wordCount` على Article — مُستخدَم في modonty UI** — Verified: 2026-05-21
  - **الواقع:** `modonty/app/articles/[slug]/page.tsx:395` يمرّر `wordCount` كـ prop لمكوّن. **يُعرض للزائر.**
  - **القرار:** لا يجب حذفه. الفكرة الأولى كانت غلط (كان متوقَّع dead).
  - **الإجراء:** خرج من قائمة التنظيف.

- [ ] **Article JSON-LD: `keywords` من tag names** — Added: 2026-05-21
  - **الموقع:** `admin/.../knowledge-graph-generator.ts:258` يضيف `node.keywords = article.tags.map(t => t.tag.name).join(", ")`
  - **الفعل:** حذف الـ emission من JSON-LD فقط. الـ tags نفسها تبقى (لها قيمة في UI + related articles)
  - **الأولوية:** منخفضة

- [ ] **`isAccessibleForFree: true` hardcoded** — Added: 2026-05-21
  - **الموقع:** `knowledge-graph-generator.ts:231`
  - **القيمة:** الـ `true` = default ضمني لـ Google، يمكن حذفه
  - **الأولوية:** منخفضة (cosmetic)

- [ ] **`wordCount` على Article node** — يحتاج تأكيد ما يستخدمه أحد قبل الحذف

- [ ] **date duplication WebPage/Article** — `datePublished` + `dateModified` يُكتبان مرتين

### Dead Code Audit الشامل (مع verify-each-claim)

- [ ] **جرد كامل لكل dead/orphan code عبر admin + modonty + console** — Added: 2026-05-21
  - **السياق:** بعد حذف `seoKeywords` بنجاح، خالد طلب جرد لحقول/مكوّنات مشابهة (dead data)
  - **المحاولة الأولى:** Explore agent أعطى ٠/٣ نتائج صحيحة (ادعى أن ogArticle* + gbp* + readingTimeMinutes ميتة — كلها مُستخدَمة فعلياً في metadata-generator + JSON-LD + modonty UI)
  - **النهج المطلوب:** **يدوي بدون agent**:
    1. لكل Prisma field، grep في 3 apps + lib/seo + cron + scripts + UI displays
    2. تأكيد "لا توجد قراءة" بـ ٣ أنماط grep مختلفة قبل تصنيفه dead
    3. للـ orphan components: grep على اسم الـ export ثم على اسم الملف
    4. صفر agent — كل فحص بـ grep مباشر
  - **القيمة:** UI أنظف · DB أصغر · أداء أعلى · أقل cognitive load
  - **متى:** بعد ما نستقر على الـ push الحالي (seoKeywords + canonical)
  - **القاعدة:** "إذا فيه شك واحد، احتفظ بالحقل" — لا حذف بدون يقين ١٠٠٪

---

## 🧹 خطط تنظيف جاهزة للتنفيذ (Cleanup Plans Ready)

### حذف حقل `seoKeywords` من المقالات

- [ ] **حذف `seoKeywords` — صفر فائدة قابلة للقياس** — Ready: 2026-05-21
  - **التحقّق الكامل** (4 مصادر مستقلة):
    - Google docs: ليس مطلوباً ولا موصى به لـ Article rich results
    - Ahrefs 2025 study (1885 صفحة): لا يرفع AI citations
    - SearchViu 2025 empirical test: AI engines (ChatGPT/Claude/Gemini/Perplexity/Google AI) لا تستخرج من JSON-LD أثناء الاسترجاع
    - modonty's grep: 0 references — البيانات ميتة من البداية
  - **النطاق:** 17 موقعاً مكتشفاً (16 ملف admin + 1 dataLayer schema · صفر console/modonty)
  - **مرتّبة على 6 مراحل** (~40 دقيقة عمل): Prisma → Orphan delete → Server actions → UI → Verify → Optional DB cleanup
  - **الملفات المتأثرة:** 2 ملف للحذف الكامل (orphan) + 13 ملف للتعديل
  - **`semanticKeywords` يبقى ١٠٠٪** — حقل مختلف، يولّد `mentions[]` في JSON-LD، فعّال
  - **المخاطر:** صفر — proven by full scan
  - **بانتظار:** موافقة خالد على بدء التنفيذ

---

## ✅ Done / Promoted to Full TODO

> لما الفكرة تنضج وتنتقل لملف TODO تفصيلي، تنتقل سطورها هنا مع رابط الملف الجديد + تاريخ الترقية.

> (فارغ بعد — لم ترقَّ أي فكرة بعد)
