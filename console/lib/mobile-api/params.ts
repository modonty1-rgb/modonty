import { fail } from "./http";

/** معرّف مونجو: ٢٤ خانة سداسية عشرية. */
const OBJECT_ID = /^[0-9a-f]{24}$/i;

export function isObjectId(value: string): boolean {
  return OBJECT_ID.test(value);
}

/**
 * حارس معرّفات المسار — نداء واحد في كل نقطة تأخذ معرّفاً من الرابط.
 *
 * بريزما على مونجو **يرمي** على معرّف بصيغة غير صالحة (مثل `abc`) بدل أن يرجع «لا شيء»،
 * فكانت النقطة تردّ 500 بلا رسالة. والمعرّف المكسور، من جهة العميل، عنصرٌ غير موجود —
 * فيرجع 404 بنفس رسالة «غير موجود» الخاصّة بكل نقطة.
 *
 * يُرجع ردّ الخطأ، أو `null` لو كل المعرّفات سليمة.
 */
export function rejectMalformedIds(ids: readonly string[], notFoundMessage = "ما لقينا المطلوب.") {
  return ids.every(isObjectId) ? null : fail("NOT_FOUND", notFoundMessage);
}
