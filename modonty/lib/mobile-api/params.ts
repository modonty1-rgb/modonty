import { fail } from "./http";

/** معرّف مونجو: ٢٤ خانة سداسية عشرية. */
const OBJECT_ID = /^[0-9a-f]{24}$/i;

export function isObjectId(value: string): boolean {
  return OBJECT_ID.test(value);
}

/**
 * حارس معرّفات المسار — بريزما على مونجو **يرمي** على معرّف مكسور بدل «لا شيء»، فكانت
 * النقطة تردّ 500. والمعرّف المكسور من جهة العميل عنصرٌ غير موجود → 404 برسالة النقطة.
 * (نفس `console/lib/mobile-api/params.ts`.)
 */
export function rejectMalformedIds(ids: readonly string[], notFoundMessage: string) {
  return ids.every(isObjectId) ? null : fail("NOT_FOUND", notFoundMessage);
}

/** الـslug كما يصل في المسار (قد يكون مرمَّزاً). `null` = ترميز مكسور أو طول غير معقول. */
export function decodeSlug(raw: string): string | null {
  try {
    const slug = decodeURIComponent(raw).trim();
    return slug.length > 0 && slug.length <= 200 ? slug : null;
  } catch {
    return null;
  }
}
