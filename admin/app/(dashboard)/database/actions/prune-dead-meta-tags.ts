"use server";

import { db } from "@modonty/shared/lib/db";

/**
 * حذف عمود `Modonty.metaTags` الميت من صفحات مدونتي الثابتة.
 *
 * ما الذي كان: كل صفحة ثابتة تحمل بلوبين للميتاداتا لا واحداً —
 *   · `nextjsMetadata` هو الذي تخدم منه مدونتي فعلاً
 *     (`modonty/lib/seo/build-metadata-from-page-row.ts:72` — «The stored blob is the source of truth»)
 *   · `metaTags` شكلٌ آخر (`organizationSeo` · `ogLocaleAlternate` · `canonical` مسطّح)
 *     ولا يقرؤه أحد في مدونتي — صفر مطابقة في التطبيق كلّه.
 *
 * ولماذا كان ضارّاً حتى ٣١ أغسطس ٢٠٢٦: شاشة فحص السيو في الأدمن كانت تمرّره
 * مكان الأوّل (`listing-pages-seo-audit.ts:155`)، فتقيس ما لا يراه الزائر —
 * الفرق المقيس على الإنتاج ٥ إلى ١٣ نقطة على الإحدى عشرة صفحة كلّها.
 * أُصلح ذلك في `642e639`، فصار العمود ميتاً بلا قارئ.
 *
 * الحارس هنا مقصود: لا نحذف إلا من صفٍّ يملك `nextjsMetadata` فعلاً. الصفّ الذي
 * لا يملكه قد يكون مصدره الوحيد هو `metaTags`، وحذفه يترك الصفحة بلا ميتاداتا
 * مخزّنة — وهو أسوأ من عمودٍ زائد.
 */
export async function pruneDeadMetaTags(): Promise<{
  scanned: number;
  cleared: number;
  skipped: number;
  skippedSlugs: string[];
}> {
  const rows = await db.modonty.findMany({
    select: { id: true, slug: true, metaTags: true, nextjsMetadata: true },
    take: 200,
  });

  const withDead = rows.filter((r) => r.metaTags !== null && r.metaTags !== undefined);
  const safe = withDead.filter(
    (r) => r.nextjsMetadata !== null && r.nextjsMetadata !== undefined,
  );
  const unsafe = withDead.filter(
    (r) => r.nextjsMetadata === null || r.nextjsMetadata === undefined,
  );

  let cleared = 0;
  for (const row of safe) {
    // ── لماذا `$runCommandRaw` لا `{ unset: true }` (مقيس على الإنتاج ٣١ أغسطس) ──
    // `{ unset: true }` هو الصيغة الصحيحة لحقلٍ عاديّ في موصّل مونجو. لكن `metaTags`
    // نوعه `Json?`، وحقلُ JSON يقبل **أي كائن قيمةً** — فمرّرته برِزما بياناتٍ لا أمراً،
    // وصار المخزَّن حرفياً `{"unset":true}` بدل أن يُحذف الحقل. الأثر مقيس: الطول نزل
    // من ٣٦٬١٤٤ حرفاً إلى ١٤، والحقل باقٍ في ١١/١١ صفحة.
    //
    // فالحذف يُطلب من مونجو مباشرةً. و`$unset` عمليّة ذرّية آمنة على حقل لا قارئ له.
    await db.$runCommandRaw({
      update: "modonty",
      updates: [{ q: { _id: { $oid: row.id } }, u: { $unset: { metaTags: "" } } }],
    });
    cleared += 1;
  }

  return {
    scanned: rows.length,
    cleared,
    skipped: unsafe.length,
    skippedSlugs: unsafe.map((r) => r.slug),
  };
}
