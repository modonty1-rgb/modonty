# جبر SEO Integration — modonty Sales Funnel
> Last Updated: 2026-04-11
> Status: ✅ المرحلة الأولى مكتملة بالكامل — LOW tasks نُقلت لـ MASTER-TODO

---

## الفكرة الرئيسية

modonty.com = واجهة المنتج + إثبات القيمة (B2C للقارئ)
jbrseo.com = بوابة الاشتراك + البيع (B2B للعميل)

القمع: زائر يقرأ على modonty → يرى قيمة المنصة → يريد ينشر → يُوجَّه لـ jbrseo.com

---

## ملاحظات

- جميع الروابط الخارجية تفتح في `target="_blank" rel="noopener noreferrer"`
- الـ CTAs لا تطغى على تجربة القارئ — modonty أولاً B2C
- لا تغيير في الـ DB schema — فقط UI + links
- موقع الاشتراك: `https://www.jbrseo.com`
- LOW tasks (JBRSEO-7, JBRSEO-8) → منقولة لـ MASTER-TODO

---

## ✅ Done — كل المهام منجزة (2026-04-11 · v1.24.0)

- [x] **JBRSEO-1** — Header: "عملاء بلا إعلانات ↗" ديسكتوب outline + موبايل solid
  - `modonty/components/navigatore/DesktopUserAreaClient.tsx`
  - `modonty/components/navigatore/TopNav.tsx`

- [x] **JBRSEO-2** — `/clients` CTA gradient panel في نهاية الصفحة
  - `modonty/app/clients/page.tsx`

- [x] **JBRSEO-3** — ClientsHero إعادة تصميم بعمودين B2C + B2B + نصوص SEO قوية
  - `modonty/app/clients/components/clients-hero.tsx`

- [x] **JBRSEO-4** — Footer: "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗"
  - `modonty/components/layout/Footer.tsx`

- [x] **JBRSEO-5** — صفحة العميل: "أعجبك ما رأيت؟ نشاطك يستحق نفس الحضور"
  - `modonty/app/clients/[slug]/page.tsx`

- [x] **JBRSEO-6** — نهاية كل مقال: "تريد محتوى مثل هذا يجذب عملاء؟"
  - `modonty/app/articles/[slug]/components/article-footer.tsx`
