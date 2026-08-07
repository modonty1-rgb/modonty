---
name: gallery-justified-rows
description: |
  THE gallery layout standard for the Modonty monorepo. Every grid of images —
  media picker, media library, client gallery, article gallery, reels grid,
  seo-images, any future one — renders as JUSTIFIED ROWS: each row gets a
  computed uniform height so its images exactly fill the container width, at
  their true aspect ratio. Zero cropping, zero gaps, reading order preserved.
  Use whenever building or editing ANY grid/list of images, or when a review
  mentions cropped thumbnails, squashed logos, or gaps between images.
  Triggers also on Arabic: "معرض" · "جاليري" · "شبكة صور" · "الصور مقصوصة" ·
  "فراغات بين الصور" · "الصور مربعة". Decided by Khalid 2026-08-07 after a
  side-by-side comparison of four layouts on real production images.
---

# معرض الصور — صفوف مضبوطة (Justified Rows)

## القاعدة

**أي شبكة صور في المشروع تُعرض بصفوف مضبوطة.** لا `aspect-square`، ولا قصّ،
ولا ارتفاع ثابت مفروض على صور مختلفة النسب.

## لماذا — الأدلة التي بُني عليها القرار

قياس على مكتبة الإنتاج (٧ أغسطس ٢٠٢٦، ٢٢٠ صفاً):

```
عريضة (1.15–2.2)   165
طولية (< 0.9)       39
مربّعة              10
شديدة العرض (≥2.2)   6   ← أغلفة العملاء 2400×400 (نسبة 6:1)
```

المكتبة **ليست مربّعة**، فعرضها في صناديق مربّعة يقصّ الأغلبية.
الغلاف 6:1 داخل مربّع **يضيع منه ٨٣٪**.

قُورنت أربع طرق على نفس الصور الحقيقية:

| المعيار | مربّع + قصّ | ميسونري | نسبة طبيعية في شبكة | **صفوف مضبوطة** |
|---|---|---|---|---|
| بلا قصّ | ❌ | ✅ | ✅ | ✅ |
| بلا فراغات | ✅ | ✅ | ❌ كبيرة | ✅ |
| ترتيب «الأحدث أولاً» واضح | ✅ | ❌ عمودي | ✅ | ✅ |
| RTL بلا ضبط | ✅ | ⚠️ | ✅ | ✅ |

- **الميسونري مرفوض** رغم جماله: يقرأ عموداً عموداً، فالصورة المرفوعة للتوّ
  تنزل وسط عمود آخر. في نافذة اختيار، ترتيب المسح أهمّ من التراصّ.
- **النسبة الطبيعية داخل شبكة مرفوضة**: الصفّ يأخذ ارتفاع أطول صورة فيه،
  فيترك فراغاً تحت القصيرة.

## الخوارزمية

1. لكل صورة: `ratio = width / height` (الأبعاد **مخزَّنة في `Media`** — لا
   تُقاس في المتصفّح، فلا وميض ولا إعادة تخطيط).
2. امشِ على الصور بالترتيب، واجمع `ratio` حتى يتجاوز
   `المجموع × الارتفاع_المستهدف + الفواصل` عرضَ الحاوية → أغلق الصفّ.
3. لكل صفّ: `h = (عرض_الحاوية − الفواصل) ÷ مجموع_النسب`، وعرض كل صورة
   `= h × ratio`. المجموع = العرض بالضبط.
4. حوّل العروض إلى نِسَب مئوية حتى يبقى الصفّ مضبوطاً عند تغيّر حجم الشاشة.

**الصفّ الأخير:** لا تمدّه ليملأ العرض — يبقى بالارتفاع المستهدف ويُحاذى
للبداية. مدّه يضخّم آخر صورة بشكل شاذّ.

## الكود المرجعي

```ts
export interface Tile { width: number; height: number }

/** Pack tiles into rows that each fill `containerWidth` exactly. Pure + server-safe. */
export function justifyRows<T extends Tile>(
  tiles: T[],
  containerWidth: number,
  targetHeight = 190,
  gap = 12,
): Array<{ items: Array<{ tile: T; widthPct: number }>; height: number; isLast: boolean }> {
  const ratio = (t: Tile) => (t.width > 0 && t.height > 0 ? t.width / t.height : 4 / 3);
  const rows: T[][] = [];
  let row: T[] = [];
  let sum = 0;

  for (const t of tiles) {
    row.push(t);
    sum += ratio(t);
    if (sum * targetHeight + gap * (row.length - 1) >= containerWidth) {
      rows.push(row);
      row = [];
      sum = 0;
    }
  }
  if (row.length) rows.push(row);

  return rows.map((items, i) => {
    const isLast = i === rows.length - 1;
    const sumR = items.reduce((a, t) => a + ratio(t), 0);
    const avail = containerWidth - gap * (items.length - 1);
    // Last row keeps the target height instead of stretching one image across the width.
    const h = isLast && sumR * targetHeight + gap * (items.length - 1) < containerWidth
      ? targetHeight
      : avail / sumR;
    return {
      height: h,
      isLast,
      items: items.map((tile) => ({ tile, widthPct: (h * ratio(tile)) / containerWidth * 100 })),
    };
  });
}
```

```tsx
{rows.map((row, i) => (
  <div key={i} className="flex gap-3 mb-3">
    {row.items.map(({ tile, widthPct }) => (
      <div key={tile.id} style={{ width: `${widthPct}%` }} className="shrink-0">
        <div style={{ aspectRatio: `${tile.width}/${tile.height}` }} className="overflow-hidden rounded-lg bg-muted">
          <OptimizedImage media={tile} sizes="card" fill className="object-cover" />
        </div>
      </div>
    ))}
  </div>
))}
```

## قيود مُلزِمة

- **`aspectRatio` على الحاوية لا `height` ثابت** — فتبقى الصورة مضبوطة عند
  أي عرض شاشة.
- **`object-cover` مقبول هنا** لأن الحاوية على نسبة الصورة نفسها، فلا قصّ فعلي.
- **أبعاد ناقصة (`width`/`height` = null):** استعمل `4/3` احتياطاً — ولا تُسقط
  الصورة. وسجّلها لتُعبَّأ لاحقاً (بند `IMGDIM`).
- **حدّ للنسب الشاذّة:** اقصر `ratio` بين `0.4` و`4` قبل التوزيع، وإلا صورة
  واحدة نسبتها ١٠ تلتهم الصفّ كلّه.
- **الجوال:** تحت `640px` انتقل إلى عمودين ثابتين — الصفوف المضبوطة تعطي صوراً
  دقيقة جداً على شاشة ضيّقة.
- **الحساب على السيرفر** ما دامت الأبعاد معروفة. لا `useEffect` ولا قياس DOM.

## أين يُطبَّق

| المكان | الحالة |
|---|---|
| `admin/components/shared/media-picker-dialog.tsx` | أول تطبيق — كان `aspect-square` |
| `admin/app/(dashboard)/media/components/media-grid.tsx` | يليه |
| `admin/app/(dashboard)/seo-images/` | يليه |
| `admin/app/(dashboard)/client-galleries/` | يليه |
| `modonty` معرض العميل · معرض المقال | يليه |
| أي شبكة صور جديدة | **إلزامي من أول سطر** |

## المرجع البصري

`documents/tasks/media-picker-layout-compare.html` — أربع طرق على نفس الصور
الحقيقية. يُفتح عند أي نقاش حول تخطيط معرض بدل إعادة الجدل من الصفر.
