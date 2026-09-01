"use server";

import { db } from "@modonty/shared/lib/db";

/**
 * تعريب هوية الكاتب المفرد «مدونتي» — الاسم والعنوان والوصف.
 *
 * ── ما الذي قِيس (٣١ أغسطس ٢٠٢٦، على قاعدة الإنتاج) ──────────────────────
 *     slug            : modonty
 *     name            : "Modonty"
 *     seoTitle        : "Modonty - Author Profile"
 *     seoDescription  : "Learn more about Modonty, the author behind all content on Modonty.com"
 *     nextjsMetadata.title : "Modonty - Author Profile"
 *
 * وصفحة `/authors/modonty` **مفهرسة وفي خريطة الموقع**، فهذا ما يقرؤه جوجل ويعرضه
 * للباحث العربي: عنوانٌ إنجليزيّ على منصّة محتواها عربيّ بالكامل.
 *
 * وهو باقٍ من نفس العائلة التي عولجت اليوم في اسم الموقع: الاسم اللاتيني `Modonty`
 * حُذف من البيانات المنظَّمة (٧ مقالات · صفر مطابقة)، وبقي هنا لأن صفّ الكاتب لم
 * يدخل تلك الكاسكيد.
 *
 * **بيانات لا كود:** صفر مطابقة لـ«Author Profile» في المستودع كلّه — النصّ مخزَّن
 * في الصفّ لا مكتوب في مولّد.
 *
 * الحارس: لا نلمس صفّاً عُرِّب سلفاً، ولا نكتب فوق عنوانٍ عربيّ كتبه إنسان.
 * والبلوب المخزَّن يُمسح ليُعاد توليده — تركُه يُبقي القديم يصل جوجل.
 */

const AUTHOR_SLUG = "modonty";
const AR_NAME = "مدونتي";
const AR_TITLE = "مدونتي — الكاتب";
const AR_DESCRIPTION =
  "صفحة الكاتب «مدونتي»: كل المقالات المنشورة على المنصّة، مرتّبة بالأحدث.";

const hasArabic = (s: unknown) => typeof s === "string" && /[؀-ۿ]/.test(s);

export async function arabizeAuthorSeo(): Promise<{
  scanned: number;
  updated: number;
  skipped: number;
  fields: string[];
}> {
  const row = await db.author.findUnique({
    where: { slug: AUTHOR_SLUG },
    select: { id: true, name: true, seoTitle: true, seoDescription: true, nextjsMetadata: true },
  });
  if (!row) return { scanned: 0, updated: 0, skipped: 0, fields: [] };

  const patch: Record<string, unknown> = {};
  const fields: string[] = [];

  if (!hasArabic(row.name)) {
    patch.name = AR_NAME;
    fields.push("name");
  }
  if (!hasArabic(row.seoTitle)) {
    patch.seoTitle = AR_TITLE;
    fields.push("seoTitle");
  }
  if (!hasArabic(row.seoDescription)) {
    patch.seoDescription = AR_DESCRIPTION;
    fields.push("seoDescription");
  }

  if (fields.length === 0) {
    return { scanned: 1, updated: 0, skipped: 1, fields: [] };
  }

  // البلوب يحمل نسخته الخاصّة من العنوان، فتصحيح العمود وحده يترك جوجل يقرأ القديم.
  // مسحه يجعل `build-metadata-from-page-row` يبنيه من الأعمدة عند أوّل طلب.
  patch.nextjsMetadata = null;

  await db.author.update({ where: { id: row.id }, data: patch });

  return { scanned: 1, updated: 1, skipped: 0, fields };
}
