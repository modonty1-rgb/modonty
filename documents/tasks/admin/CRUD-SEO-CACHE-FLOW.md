# CRUD → SEO Cache Flow

> مرجع لكل عملية CRUD — ايش يصير للـ SEO Cache بعد كل خطوة
> آخر تحديث: 2026-04-04

---

## القاعدة العامة

كل عملية CRUD لازم تمر بـ 5 خطوات بالترتيب:

```
DB Operation → Admin Refresh → Modonty Refresh → Individual SEO → Listing Page SEO
```

| الخطوة | الوظيفة | الكود |
|--------|---------|-------|
| 1. DB Operation | حفظ/تعديل/حذف في الداتابيس | `db.entity.create/update/delete()` |
| 2. Admin Refresh | تحديث صفحة الأدمن | `revalidatePath("/entity")` |
| 3. Modonty Refresh | تحديث الموقع العام | `await revalidateModontyTag("entity")` |
| 4. Individual SEO | توليد Meta Tags + JSON-LD للعنصر | `generateAndSave[Entity]Seo(id)` |
| 5. Listing Page SEO | تحديث كاش صفحة القائمة العامة | `regenerate[Entity]ListingCache()` |

---

## Flow حسب نوع العملية

### Create (إضافة)

```
المستخدم يضغط "إنشاء"
       ↓
1. db.entity.create()                      ← العنصر يتحفظ في DB
       ↓
2. revalidatePath("/entity")               ← صفحة الأدمن تتحدث
       ↓
3. revalidateModontyTag("entity")          ← الموقع العام يعيد تحميل البيانات
       ↓
4. generateAndSave[Entity]Seo(id)          ← يولّد SEO Cache للعنصر الجديد
   ├── يقرأ Settings (siteName, ogLocale, twitterCard...)
   ├── يبني metadata (title, description, OG, twitter)
   ├── يبني JSON-LD (CollectionPage + BreadcrumbList + DefinedTerm)
   └── يحفظ في DB: nextjsMetadata + jsonLdStructuredData
       ↓
5. regenerate[Entity]ListingCache()        ← يحدّث كاش صفحة القائمة العامة
```

### Update (تعديل)

```
المستخدم يضغط "تحديث"
       ↓
1. db.entity.update()                      ← البيانات تتحدث في DB
       ↓
2. revalidatePath("/entity")               ← صفحة الأدمن تتحدث
       ↓
3. revalidateModontyTag("entity")          ← الموقع العام يعيد تحميل البيانات
       ↓
4. generateAndSave[Entity]Seo(id)          ← يعيد توليد SEO Cache بالبيانات الجديدة
       ↓
5. regenerate[Entity]ListingCache()        ← يحدّث كاش صفحة القائمة العامة
```

### Delete (حذف)

```
المستخدم يضغط "حذف" + يأكّد
       ↓
0. فحص: هل العنصر مرتبط بعناصر أخرى؟
   ├── نعم → يرفض الحذف + رسالة خطأ
   └── لا → يكمل ↓
       ↓
1. حذف الصورة من Cloudinary (إن وجدت)
       ↓
2. db.entity.delete()                      ← العنصر يتحذف من DB
       ↓
3. revalidatePath("/entity")               ← صفحة الأدمن تتحدث
       ↓
4. revalidateModontyTag("entity")          ← الموقع العام يعيد تحميل (العنصر يختفي)
       ↓
5. regenerate[Entity]ListingCache()        ← يحدّث كاش القائمة بدون العنصر المحذوف
       ↓
   ⊘ generateAndSave[Entity]Seo — ما يحتاج (العنصر محذوف)
```

---

## ملخص بصري

```
                    ┌──────────────┬──────────────┬──────────────┐
                    │   Create     │   Update     │   Delete     │
┌───────────────────┼──────────────┼──────────────┼──────────────┤
│ DB Operation      │  create()    │  update()    │  delete()    │
│ Admin Refresh     │  ✅          │  ✅          │  ✅          │
│ Modonty Refresh   │  ✅          │  ✅          │  ✅          │
│ Individual SEO    │  ✅ توليد    │  ✅ إعادة    │  — محذوف     │
│ Listing Page SEO  │  ✅ تحديث    │  ✅ تحديث    │  ✅ تحديث    │
└───────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## الكود المطلوب في كل action

### Create / Update pattern:

```typescript
revalidatePath("/[entity]");
await revalidateModontyTag("[entity]");
try {
  const { generateAndSave[Entity]Seo } = await import("@/lib/seo/[entity]-seo-generator");
  await generateAndSave[Entity]Seo(entity.id);
} catch (e) { console.error("[Entity] SEO gen failed:", e); }
try {
  const { regenerate[Entity]ListingCache } = await import("@/lib/seo/listing-page-seo-generator");
  await regenerate[Entity]ListingCache();
} catch (e) { console.error("[Entity] listing cache failed:", e); }
```

### Delete pattern:

```typescript
revalidatePath("/[entity]");
await revalidateModontyTag("[entity]");
try {
  const { regenerate[Entity]ListingCache } = await import("@/lib/seo/listing-page-seo-generator");
  await regenerate[Entity]ListingCache();
} catch {}
```

---

## قواعد مهمة

1. **الخطوتين 4 و 5 لازم يكونون في try-catch مستقلين** — لو SEO gen فشل، الـ listing cache لازم يتولّد برضو
2. **Delete ما يحتاج individual SEO** — العنصر محذوف أصلاً
3. **Bulk Delete يحتاج listing cache** — حتى لو ما في individual SEO
4. **كل القيم تجي من Settings** — ما في hardcoded "Modonty" أو "ar_SA"

---

## Entities وملفاتها

| Entity | SEO Generator | Listing Cache Function |
|--------|--------------|----------------------|
| Categories | `category-seo-generator.ts` → `generateAndSaveCategorySeo` | `regenerateCategoriesListingCache` |
| Tags | `tag-seo-generator.ts` → `generateAndSaveTagSeo` | `regenerateTagsListingCache` |
| Industries | `industry-seo-generator.ts` → `generateAndSaveIndustrySeo` | `regenerateIndustriesListingCache` |
| Clients | `generate-client-seo.ts` → `generateClientSEO` | `regenerateClientsListingCache` |
| Articles | `metadata-storage.ts` + `jsonld-storage.ts` | `regenerateArticlesListingCache` |
