/**
 * مرجع الطلب عند المزوّد، مبنيّاً من `CheckoutOrder.id`.
 *
 * N-Genius يقبل حروفاً وأرقاماً وشرطات، بحدّ ٤٠ خانة — و`ObjectId` يسع فيها، فيصير
 * المرجع قابلاً للعودة: ما يرجع من المزوّد يدلّ على صفّ الطلب عندنا مباشرةً بلا جدول وسيط.
 *
 * ⚠ لم يُنقل معه `toMinorUnits` الذي عند جبر: هو يخزّن الريالات ويضرب ×١٠٠ عند الإرسال،
 * ونحن نخزّن الهللات أصلاً (`CheckoutOrder.totalMinor`). تمرير مبلغنا فيه يضربه ×١٠٠
 * مرّةً ثانية — فاتورة بمئة ضعفها، وهو عطلٌ لا يظهر إلا على بطاقة مشترٍ حقيقي.
 */
export function buildMerchantOrderReference(orderId: string): string {
  const clean = orderId.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);
  if (!clean) throw new Error("Empty merchantOrderReference after sanitization");
  return clean;
}
