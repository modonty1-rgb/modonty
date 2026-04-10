# MODONTY Public Site — Launch TODO
> Last Updated: 2026-04-10
> Goal: modonty.com جاهزة 100% للعميل النهائي

---

## 🔴 حرج — يؤثر على كل زائر الآن

---

## 🟠 عالي



---

## 🟡 متوسط



---

---


---

## ✅ مكتمل

- [x] **BR1-4 — Brand Compliance كامل** → فحص 432 ملف، 66 violation في 24 ملف — كلها محوّلة لـ `text-primary` / `bg-primary/10` / `text-accent` / `text-destructive`

- [x] **A6 — شريط تقدم القراءة** → كان مفعّلاً بالفعل في `page.tsx`
- [x] **G2 — Footer quick links** → أضفت: الرئيسية / الرائجة / العملاء / عن مودونتي
- [x] **Loading pages** → أنشأت 11 ملف: about, contact, legal (يغطي 4 sub-pages), login, authors/[slug], notifications, favorites, liked, disliked, comments, following

- [x] **G1 — JWTSessionError في الـ Console** → `AUTH_SECRET` جديد في `.env.local` + NEXTAUTH_URL صُحّح لـ `localhost:3001` | ⚠️ Vercel يحتاج تحديث يدوي (MASTER-TODO)

- [x] **HP2 — لا يوجد تعريف للمنصة للزائر الجديد** → strip "مرحباً بك في مودونتي" فوق الـ feed
- [x] **HP3 — قسم "جديد مودونتي" يظهر فارغاً** → `if (articles.length === 0) return null`
- [x] **HP4 — بطاقات المقالات غير متناسقة** → placeholder `bg-muted` + `IconArticle` لو لا توجد صورة
- [x] **G3 — النشرة بدون رسالة تأكيد** → error state + "جاري الاشتراك..." في `newsletter-cta.tsx`

- [x] **HP1 — /articles كانت تعطي 404** → redirect 308 إلى `/`
- [x] **Domain redirect 307 → 308** → تم من Vercel Dashboard
- [x] **A1 — نص المقال في المنتصف** → `text-right` + `direction: rtl`
- [x] **صورة المقال — فراغ فوق وتحت** → `object-cover` — متطابق مع guidelines 16:9
- [x] **M1 — البريدكرم على الموبايل سطرين** → `overflow-hidden` على الـ `ol` — عنوان مقطوع بـ `truncate` على 390px ✅
- [x] **A2 — أقسام مخفية** → التعليقات + مقالات ذات صلة + المزيد من Modonty/العميل كلها مفتوحة. الأسئلة الشائعة مطوية.
- [x] **A3 — ترتيب الـ Sidebar الأيمن خاطئ** → الترتيب الصح: Author card → TOC → Newsletter
- [x] **A4 — الـ Sidebars تختفي وتترك مساحة فارغة** → `sticky top-[3.5rem] self-start h-[calc(100vh-4rem)]` على كلا الـ sidebars — نفس نمط الرئيسية
- [x] **A5 — زر "اسأل العميل" نص ثابت** → ديناميكي `اسأل {clientName} مباشرةً` + لون amber ذهبي في الوضعين
