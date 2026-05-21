# /story Page Master TODO

**Last Updated:** 2026-05-16 (✅ GEMINI plan FINAL — 16 capabilities · all 8 new ones now have "سيناريو من مدوني" cards (problem→solution→benefit→example) matching the chat-style explanations)
**Files in scope:** `modonty/scripts/voice/general-pitch/script.md` (المصدر) · `modonty/app/story/*` · `modonty/public/help/audio/general-pitch/*`
**Page:** `modonty.com/story` — 5-min audio pitch

> **الحالة:** Phase 1-9 خلصت ١٠٠٪. ٣ بنود استراتيجية معلّقة لقرارك. **بند جديد عاجل:** استبدال "بزنس" بـ "مشروعك / نشاط" (تحت).

---

## 🚨 NEW — Business → مشروعك / نشاط Conversion

**القاعدة الموثّقة:**
| السياق | البديل |
|---|---|
| مخاطبة مباشرة لصاحب الشركة (بزنسك / بِزْنِسَكَ) | **"مشروعك"** |
| صاحب الشركة كصفة (صاحب بزنس) | **"صاحب مشروع"** |
| سياق تصنيف/شمولي (كل بزنس عربي / البزنسات) | **"نشاط / الأنشطة"** |

### Phase 0 — قرارات قبل البدء
- [x] **قرار-١** القاعدة "مشروعك للمخاطبة / نشاط للتصنيف" نهائية ✅
- [x] **Tashkeel test (2026-05-16)** — Hazem ينطق "مشروعك" + "نشاط" + "الأنشطة" صح بدون تشكيل (٤/٤ صح) ✅
- [x] **قرار-٢** ✅ شيل "+١٢٠ بزنس عربي" بالكامل · السطر الجديد: "اللي بدأناه لخدمة شركتنا، صار اليوم منظومة تخدم كل نشاط عربي"
- [x] **قرار-٣** ✅ حُذف ملف `console/app/help/voice-script/video-brief-kling.md` بالكامل (مش ظاهر للجمهور، ما نحتاجه)

### Phase 1 — تعديل ملفات السكريبت ✅ خلصت (2026-05-16)
- [x] `modonty/scripts/voice/general-pitch/script.md` — ٢٢ موضع اتعدّلوا · صفر "بزنس" متبقّي
  - مشروعك (مخاطبة): سطور 12, 24, 102, 138, 164, 246, 290×2, 306, 381, 423, 436
  - نشاط/الأنشطة (تصنيف): سطور 66, 68, 72, 194, 395, 399, 411, 464
  - بطاقة عملك (سطر 339) · بروفايل جوجل التجاري (سطر 375) · صاحب مشروع (سطر 4 metadata)
  - حذف صريح: "+١٢٠" من سطر 72
- [ ] `console/app/help/console/voice-script/script.md` سطر 119 — "بزنسك" *(console pitch — خارج هذي الجلسة)*
- [ ] `console/app/help/console/voice-script/script-plain.md` سطر 147 — "بزنسك" *(console pitch — خارج هذي الجلسة)*

### Phase 2 — تعديل كود modonty
- [ ] `modonty/app/story/SalesPitchPage.tsx:1185` — inline text فيه "بزنسك"
- [ ] `modonty/app/story/page.tsx` — ٣ مواضع metadata/SEO:
  - [ ] سطر 11 — description
  - [ ] سطر 22 — OG description
  - [ ] سطر 117 — twitter description

### Phase 3 — تعديل الـ manifest ✅ خلصت (2026-05-16)
- [x] `modonty/public/help/audio/general-pitch/manifest.json` — كل "بزنس" استُبدلت في text + labels + highlights · JSON valid · 19 sections + 5 categories محفوظة · media URLs (mp3/wav paths) لم تُلمَس

### Phase 4 — Tashkeel workflow (حسب memory)
- [ ] تحديث `script-plain.md` بالنص النهائي بدون تشكيل
- [ ] إرسال للجهة الخارجية للتشكيل (per `project_voice_script_workflow`)
- [ ] استلام `script.md` مشكّل
- [ ] verify التشكيل على الأقسام المعدّلة

### Phase 5 — Re-generate الـ Audio ✅ خلصت (2026-05-16)
- [x] **١٣ سكشن متجدد بـ Gemini Kore:** 02, 03, 04, 06, 07, 08, 12, 13, 14, 15, 16, 17, 18
- [x] ~٤٥MB صوت · ~٩ دقائق محتوى · صفر أخطاء
- [x] الـ MP3 الأقدم استُبدلت بـ WAV (Kore output)
- [ ] **بانتظار live test من خالد على كل السكشنات**
- [ ] **قرار: نرجع لـ Hazem/Layla (ElevenLabs) لاحقاً ولا نستمر بـ Kore الموحّد؟**

### Phase 6 — Live test + Push
- [ ] تشغيل `/story` محلياً → استماع الأقسام المعدّلة بالكامل
- [ ] tsc clean (modonty + console)
- [ ] backup + version bump + changelog
- [ ] commit + push بإذنك الصريح

**ملاحظة:** بس ~٥ MP3s من الـ ٨ المولّدة محتاجة re-generation — مش "كل الـ voices من أول". الأقسام اللي ما فيها بزنس تبقى كما هي.

---

## 🚨 PHASE 8 — Pending (awaiting your input)

- [ ] **8.3 — Founder Offer button = conversion (مش navigation)** (CRO strategic)
  - الحالي: الزرّ الأمبر «🎁 عرض المؤسسين / 🚀 خطوتك الأولى» يلعب سكشن صوتي 20
  - المشكلة: المستخدم جاهز للـ action لكن يحصل على content
  - الـ Fix المقترح: split — primary يفتح WhatsApp prefill «أبغى أثبت كمؤسس مبكر» · secondary chevron للسكشن
  - **يحتاج قرار منك**

- [ ] **8.4 — Pricing CTA + jbrseo external domain trust break** (CRO strategic)
  - الحالي: الـ link يفتح jbrseo.com (domain مختلف) — visual demotion + disclaimer ما حلّ الـ trust gap
  - خيار قوي: inline pricing strip على modonty.com (٣ tier cards مختصرة + «more on jbrseo»)
  - خيار طويل المدى: host الباقات على modonty.com/pricing
  - **يحتاج قرار منك**

- [ ] **8.7 — قياس contrast على text-foreground/45-/55** (A11y 1.4.3)
  - يحتاج Lighthouse + DevTools color picker — قد تكون أقل من 4.5:1
  - لو فشلت: ارفع opacity إلى /65 أو غيّر اللون
  - **يحتاج تشغيلك للـ Lighthouse — مش fix كود**

---

## 🔄 PHASE 9 — Deferred (architectural, not urgent)

- [ ] **9.12** SalesPitchPage parent ليس memo'd — re-renders كل audio tick رغم memo على children (يحتاج refactor دقيق لـ state hoist، high risk بدون مكسب فعلي بعد الـ throttle)
- [ ] **9.13** ٣٧ عينة من `text-[Npx]` arbitrary — يستحق typography tokens system (design system work، scope كبير)

---

## 🔗 Phases منفصلة (روابط)

- 📦 **Cloudinary Audio Migration** — ترحيل الصوت من `public/` لـ Cloudinary CDN → [CLOUDINARY-AUDIO-MIGRATION.md](./CLOUDINARY-AUDIO-MIGRATION.md) — phase مستقل بعد push v1.45.0

---

## ✅ Done Archive (compressed)

> التفاصيل الكاملة في git history + SESSION-LOG.md.

- **2026-05-16** — Phase 9 (Trust Strip refactor + lucide icons + LEGAL_ENTITY constant + _utils/arabic.ts + 11 micro-fixes)
- **2026-05-16** — Transcript = Dialog modal (Radix portal pattern — حل نهائي بعد 3 محاولات فاشلة inline)
- **2026-05-16** — Phase 8 tactical (focus-visible rings + ARIA APG patterns + sr-only headings + onTimeUpdate throttle + useMemo nav + role=switch autoplay + 15 micro-fixes)
- **2026-05-16** — Phase 7 (splitIntoPhrases shared util + ChevronDown details polish + Partners footer rewrite + TeamCarousel keyboard pause + 8 micro-fixes)
- **2026-05-16** — Phase 6 (auto-advance "stay here" button + Packages CTA trust line + TestimonialPlayer 💬 emoji + AnimatePresence cleanup + Partners orphan fix + 8 micro-fixes)
- **2026-05-16** — Phase 5 (dynamic import + StorySkeleton + React.memo on widgets + Founder hook integrated in Footer CTA + visual demotion per Nielsen Norman)
- **2026-05-16** — Phase 4 (Collapsible categories + Team Carousel 13 members + Testimonial Player 2 variants + Partners Showcase 5 real + Maya Ahmed DiceBear)
- **2026-05-16** — Phase 1-3 (Wave 1-3 batch + Trust Strip + Vision 2030 + JSON-LD + Founder hook + CEO/Sales contact split)

---

## 🗓 Tracking

- **Created:** 2026-05-16
- **Cleanup:** 2026-05-16 — Done archive compressed; New "Business → مشروعك" task added with full inventory
- **Status:** 39 items shipped · 3 strategic decisions pending · 1 new naming refactor (~25 occurrences)
- **Next checkpoint:** قرار خالد على الـ ٣ بنود في Phase 0 لبدء Business → مشروعك
