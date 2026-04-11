# جبر SEO Integration — modonty Sales Funnel
> Last Updated: 2026-04-11
> Goal: توجيه الزوار من modonty.com → jbrseo.com للاشتراك في الخدمة

---

## الفكرة الرئيسية

modonty.com = واجهة المنتج + إثبات القيمة (B2C للقارئ)
jbrseo.com = بوابة الاشتراك + البيع (B2B للعميل)

القمع المستهدف:
زائر يقرأ محتوى على modonty → يرى قيمة المنصة → يريد ينشر هو الآخر → يُوجَّه لـ jbrseo.com

---

## المهام

### 🔴 HIGH — نقاط التحويل الرئيسية

- [x] **JBRSEO-1** — Header: زر "عملاء بلا إعلانات ↗" في الهيدر
  - ديسكتوب: outline بلون primary في `DesktopUserAreaClient.tsx`
  - موبايل: pill بخلفية primary solid في `TopNav.tsx`
  - يفتح `https://www.jbrseo.com` في tab جديد

- [x] **JBRSEO-2** — صفحة `/clients`: CTA panel gradient في نهاية الصفحة
  - عنوان: "هل تريد عملاء من جوجل — بدون إعلانات؟"
  - زر أبيض: "عملاء بلا إعلانات ↗" → jbrseo.com
  - الملف: `modonty/app/clients/page.tsx`

- [x] **JBRSEO-3** — ClientsHero: CTA داخل الهيرو مباشرة
  - "هل تريد نشاطك التجاري هنا؟" + زر "عملاء بلا إعلانات ↗"
  - يغطي هدف صفحة /join — الهيرو هو نقطة التحويل المثالية
  - الملف: `modonty/app/clients/components/clients-hero.tsx`

---

### 🟡 MEDIUM — نقاط التحويل الثانوية

- [x] **JBRSEO-4** — Footer: "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗"
  - الملف: `modonty/components/layout/Footer.tsx`

- [x] **JBRSEO-5** — صفحة العميل `/clients/[slug]`: CTA panel "أعجبك ما رأيت؟"
  - الملف: `modonty/app/clients/[slug]/page.tsx`

- [x] **JBRSEO-6** — نهاية كل مقال: "تريد محتوى مثل هذا يجذب عملاء لنشاطك من جوجل؟ عملاء بلا إعلانات ↗"
  - الملف: `modonty/app/articles/[slug]/components/article-footer.tsx`

---

### 🟢 LOW — تحسينات مستقبلية

- [ ] **JBRSEO-7** — صفحة `/about`: إضافة قسم "للشركات والأعمال"
  - شرح أن modonty منصة مفتوحة للنشر عبر jbrseo.com

- [ ] **JBRSEO-8** — Analytics: تتبع النقرات على CTAs لـ jbrseo.com
  - إضافة `data-track` أو event على كل CTA لقياس التحويل

---

## ترتيب التنفيذ المقترح

1. JBRSEO-1 (Header) — الأعلى ظهوراً، كل صفحة
2. JBRSEO-2 (Clients page) — الأقرب للمشتري المحتمل
3. JBRSEO-4 (Footer) — سريع، يظهر في كل صفحة
4. JBRSEO-3 (صفحة /join) — يحتاج محتوى + تصميم
5. JBRSEO-5 (صفحة العميل) — بعد /join جاهزة
6. JBRSEO-6 (نهاية المقال) — بعد المراجعة

---

## ملاحظات

- جميع الروابط الخارجية تفتح في `target="_blank" rel="noopener noreferrer"`
- الـ CTAs يجب أن لا تطغى على تجربة القارئ — modonty أولاً B2C
- لا تغيير في الـ DB schema — فقط UI + links
- موقع الاشتراك: `https://jbrseo.com`

---

## Done

- [x] **JBRSEO-1** — Header CTA "عملاء بلا إعلانات ↗" — ديسكتوب outline + موبايل solid primary → jbrseo.com (2026-04-11)
- [x] **JBRSEO-2** — `/clients` CTA panel gradient — "هل تريد عملاء من جوجل؟" + زر أبيض → jbrseo.com (2026-04-11)
- [x] **JBRSEO-3** — ClientsHero إعادة تصميم بعمودين B2C + B2B + نصوص SEO قوية (2026-04-11)
- [x] **JBRSEO-4** — Footer CTA "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗" (2026-04-11)
- [x] **JBRSEO-5** — Client page CTA "أعجبك ما رأيت؟" في نهاية كل صفحة عميل (2026-04-11)
- [x] **JBRSEO-6** — Article footer CTA "تريد محتوى مثل هذا يجذب عملاء؟" (2026-04-11)
