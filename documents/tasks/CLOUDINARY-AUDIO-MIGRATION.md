# Cloudinary Audio Migration — خطة العمل

**Last Updated:** 2026-05-16 (fix: env vars في `.env.shared` مش `.env.local` — credentials مشتركة بين الـ ٣ apps)
**Status:** 📋 PLANNING — لم يبدأ التنفيذ بعد
**Scope:** ترحيل ملفات الصوت من `modonty/public/help/audio/` إلى Cloudinary
**Decision:** مفصول عن push صفحة Story الحالي — phase مستقل

---

## 🎯 الهدف

نقل كل الصوتيات من مجلد `public` المحلي إلى Cloudinary CDN، مع ربط أوتوماتيكي عبر `manifest.json` بدون أي تدخل يدوي.

---

## ✅ القرار: ليش Cloudinary

١. **حجم المستودع** — ٢٤+ مقطع MP3 يتضخّم بسرعة داخل git
٢. **توفير bandwidth** — لا يحسب على حصة Vercel
٣. **سرعة في السعودية** — CDN edge في الشرق الأوسط
٤. **متناسق مع الموجود** — اللوقو + الصور كلها على Cloudinary
٥. **ما يأثر على First Paint** — الصوت يحمّل on-demand

**النقطة الوحيدة ضد:** محتاج upload workflow. شغل مرة واحدة وبعدين تلقائي.

---

## 🏗️ المعمارية

### حلقة الوصل = manifest.json

كل قسم داخل manifest يحتوي على `media.url`. نخلي الـ URL يجي من Cloudinary بدل المسار المحلي.

**قبل:**
```json
{
  "id": "21",
  "media": { "type": "audio", "url": "/help/audio/general-pitch/21-team.mp3" }
}
```

**بعد:**
```json
{
  "id": "21",
  "media": { "type": "audio", "url": "https://res.cloudinary.com/dfegnpgwx/video/upload/modonty/audio/general-pitch/21-team.mp3" }
}
```

### نمط التسمية في Cloudinary

```
modonty/audio/{category}/{section-id}-{slug}.mp3
```

أمثلة:
- `modonty/audio/general-pitch/01-intro.mp3`
- `modonty/audio/general-pitch/21-team.mp3`
- `modonty/audio/sales-pitch/05-objection.mp3`

**القاعدة:** الرقم في اسم الملف يطابق رقم القسم في manifest. ما يحتاج تخمين أو lookup tables.

### نقطة تقنية مهمة: resource_type

Cloudinary يخزّن الصوت تحت `resource_type: 'video'` (مش `audio`). لازم نمرر هذي القيمة وقت الرفع.

```js
cloudinary.uploader.upload(filePath, {
  resource_type: 'video',  // not 'image' or 'audio'
  folder: 'modonty/audio/general-pitch',
  public_id: '21-team',
});
```

### حل مشكلة الـ cache

نستخدم **رابط بدون رقم نسخة** (unversioned URL) + `invalidate: true` عند الرفع. هذا يخلي:
- الـ manifest ثابت — ما يتغيّر إلا لما نضيف قسم جديد
- إعادة التوليد ما تحتاج commit جديد للـ manifest
- CDN cache ينمسح أوتوماتيكي بعد ٥-١٠ دقايق

---

## 🔐 متغيرات البيئة

نضيف في **`.env.shared`** (مش `.env.local`) — الـ credentials مشتركة بين modonty + console + admin (نفس Cloudinary account للصور والصوت):

```bash
CLOUDINARY_CLOUD_NAME=dfegnpgwx
CLOUDINARY_API_KEY=<from-cloudinary-dashboard>
CLOUDINARY_API_SECRET=<from-cloudinary-dashboard>
```

**ليش shared:**
- نفس الـ account يخدم الصور (موجودة من قبل) + الصوت (هذا التنفيذ)
- ٣ apps يستهلكون نفس CDN → تكرار في `.env.local` × ٣ = تناقض محتمل وقت rotation
- لو غيّرنا API key، نغيّره مرة واحدة

**Vercel (للإنتاج):**
نفس الـ ٣ vars تنضاف في Vercel dashboard لكل app (modonty + console + admin). Vercel ما يدعم shared env files، فالتكرار في Vercel UI لازم — لكن من نفس Cloudinary account.

**ملاحظة:** `dfegnpgwx` هو نفس cloud name المستخدم للصور (راجع `_constants.ts:MODONTY_LOGO_URL`).

---

## 📋 الـ Phases

### Phase 1 — Setup (~٣٠ دقيقة)

- [ ] التحقق من cloudinary npm package موجود في `console/package.json` — إذا لا، `pnpm add cloudinary`
- [ ] إضافة env vars الثلاثة لـ **`.env.shared`** (مش `.env.local`)
- [ ] التأكد إن السكريبتات تحت `console/scripts/` تقرأ من `.env.shared` (إذا ما تقرأ، نضيف dotenv config يقرأ من المسار المشترك)
- [ ] كتابة test script بسيط `console/scripts/test-cloudinary-connection.mjs` يتحقق من الاتصال
- [ ] تشغيل التست → لازم يطبع cloud_name + رسالة نجاح

**Exit criteria:** test script يطبع `✅ Connected to Cloudinary as dfegnpgwx`

---

### Phase 2 — Migration Script (~ساعة)

كتابة سكريبت ترحيل لمرة واحدة `console/scripts/migrate-audio-to-cloudinary.mjs`:

**خطواته:**
1. يقرأ `modonty/public/help/audio/general-pitch/manifest.json`
2. لكل قسم له `media.type === "audio"`:
   - يقرأ ملف MP3 من المسار المحلي
   - يرفعه على Cloudinary بـ `public_id = ${id}-${slug}`
   - يستخرج `secure_url` بدون version
   - يحدّث manifest بالـ URL الجديد
3. يحفظ manifest المحدّث

**ميزات أمان:**
- `--dry-run` flag — يطبع بدون رفع
- `--section=21` flag — يرحّل قسم واحد فقط
- Logs مفصّلة (نجح/فشل/تخطّى)
- يحفظ نسخة backup من manifest الأصلي بـ `.bak`

**Exit criteria:** dry-run يطبع الخطة الكاملة بدون أخطاء.

---

### Phase 3 — Generation Script Integration (~ساعة)

تحديث سكريبتات التوليد الموجودة:
- `console/scripts/generate-general-pitch-audio.mjs`
- `console/scripts/generate-section.mjs`
- `console/scripts/generate-audio-kore.mjs`
- `console/scripts/generate-sales-pitch-audio.mjs`

**النمط الجديد لكل سكريبت:**
```
١. يولّد MP3 من ElevenLabs/Gemini → يحفظه مؤقتاً في /tmp
٢. يرفعه على Cloudinary (نفس logic من Phase 2)
٣. يحدّث manifest.json بالـ URL الجديد
٤. يحذف الملف المؤقت
```

**كل سكريبت يستورد helper مشترك:**
- `console/scripts/lib/cloudinary-upload.mjs` — function `uploadAudioToCloudinary(filePath, sectionId, slug, category)`

**Exit criteria:** توليد قسم جديد ينتهي بـ URL Cloudinary في manifest، صفر ملفات MP3 في `public/`.

---

### Phase 4 — Live Testing (~٣٠ دقيقة)

- [ ] رحّل قسم واحد (مثلاً ٠١-intro) عبر migration script
- [ ] حدّث manifest.json يدوياً لهذا القسم فقط
- [ ] شغّل `/story` محلياً → اضغط play على القسم ٠١
- [ ] تحقّق:
  - الصوت يشتغل من Cloudinary URL (راقب Network tab)
  - السرعة معقولة من السعودية (إذا متاح VPN/test)
  - لا يوجد CORS errors
  - الـ playback controls شغّالة عادي

**Exit criteria:** قسم واحد يعمل ١٠٠٪ من Cloudinary على localhost + لا regression في الـ UX.

---

### Phase 5 — Bulk Migration + Cleanup (~٣٠ دقيقة)

- [ ] شغّل migration script على كل الأقسام (`--all`)
- [ ] تحقّق من تحديث الـ manifest بالكامل
- [ ] احذف مجلد `modonty/public/help/audio/general-pitch/` (الـ MP3s فقط، احتفظ بـ manifest.json داخل مسار جديد لو لازم)
- [ ] `git status` → تأكّد الـ MP3s انحذفت لكن manifest باقي
- [ ] شغّل `/story` محلياً → اختبر ٥ أقسام عشوائية
- [ ] `pnpm tsc --noEmit` على modonty + console → صفر errors

**Exit criteria:** صفحة Story تشتغل كاملة من Cloudinary، صفر MP3s في git، tsc نظيف.

---

### Phase 6 — Push (~١٠ دقايق)

**Pre-push checklist:**
- [ ] Backup عبر `bash scripts/backup.sh`
- [ ] Version bump: `modonty/package.json` (مثلاً 1.45.0 → 1.46.0)
- [ ] Changelog entry جديد: "audio v1.46.0: ترحيل الصوتيات لـ Cloudinary CDN"
- [ ] تحديث SESSION-LOG.md
- [ ] Git commit مع رسالة واضحة
- [ ] `git push` بعد تأكيد المستخدم الصريح

**Commit message suggestion:**
```
modonty v1.46.0: migrate /story audio to Cloudinary CDN

- All 24+ MP3s moved to Cloudinary (folder: modonty/audio/general-pitch/)
- manifest.json updated with secure URLs (unversioned + invalidate)
- Generation scripts now auto-upload + update manifest
- public/help/audio/ folder removed (no more binary bloat in git)
- ~24MB removed from repo
```

---

## 🔙 Rollback Plan

لو شي خرب في الإنتاج بعد push:

**Option A — Git revert (الأسرع):**
```bash
git revert <commit-sha>
git push
```
الـ MP3s الأصلية ترجع من git history، الـ manifest يرجع للمسارات المحلية.

**Option B — Manifest swap:**
- نحتفظ بنسخة `manifest.local.json.bak` كـ fallback
- لو Cloudinary وقع: نبدّل manifest يدوياً
- خيار بطيء لكن أكثر مرونة من revert كامل

**القرار:** Option A هو الافتراضي. backup يحمينا من أي حاجة كبيرة.

---

## ❓ Open Questions

١. **هل نحذف الـ MP3s من Cloudinary بعد طول؟**
   - لا. الـ free tier ٢٥GB، عندنا أقل من ١GB صوت.
   - حتى لو غيّرنا content، الـ public_id ثابت فالرفع الجديد يستبدل القديم تلقائياً.

٢. **ماذا عن sales-pitch audio و Kore audio؟**
   - نفس النمط، نفس السكريبت. لكن نبدأ بـ general-pitch أولاً (الأكثر استخداماً في Story).

٣. **هل نحتاج CDN في منطقة معينة؟**
   - لا. Cloudinary auto-routes للأقرب. nodes في دبي + الرياض موجودة.

---

## 📚 Reference Links

- Cloudinary Node SDK: https://cloudinary.com/documentation/node_integration
- Audio upload params: https://cloudinary.com/documentation/audio_video_upload_params
- Unversioned URL pattern: https://cloudinary.com/documentation/upload_images#unique_filename
- Cache invalidation: https://cloudinary.com/documentation/invalidate_cached_media_assets_on_the_cdn

---

## 🔗 Related Files

- `modonty/app/story/SalesPitchPage.tsx` — مستهلك الـ manifest
- `modonty/public/help/audio/general-pitch/manifest.json` — مصدر الحقيقة الحالي
- `modonty/app/story/_constants.ts` — `MODONTY_LOGO_URL` (نفس Cloudinary account)
- `console/scripts/generate-*.mjs` — سكريبتات التوليد الموجودة

---

## 📝 ملاحظة عن التوقيت

هذي الخطة **مفصولة عن push صفحة Story الحالي** (v1.45.0). نبدأ التنفيذ:
- ✅ بعد ما push الحالي يخلص ويستقر في الإنتاج
- ✅ بعد تأكيد من خالد على الخطة هذي
- ✅ بعد ما نتأكد عندنا cloudinary API credentials جاهزة

**ترتيب الـ pushes:**
1. **Push #1 (وشيك):** modonty v1.45.0 — تحسينات Story page (مرحلة ٩، Trust Strip، Dialog modal)
2. **Push #2 (لاحق):** modonty v1.46.0 — ترحيل الصوت لـ Cloudinary
