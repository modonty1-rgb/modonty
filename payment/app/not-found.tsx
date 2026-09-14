import Link from "next/link";

/**
 * صفحة «غير موجود» لمسار البيع وحده.
 *
 * لماذا وُجدت (خالد ١٤ سبتمبر ٢٠٢٦: «صفحة الدفع المفروض تكون خارج الأوثنتيكيشن»):
 * `app/not-found.tsx` — الصفحة العامّة — تركّب `SiteShell` بنفسها، وNext يجهّزها مع كل
 * مسار. فكان جرس الإشعارات وشارته يُنفَّذان أثناء تهيئة `/[market]`، وهي خارج مجموعة
 * `(site)` تماماً. ونتج عن ذلك عطلان مقيسان:
 *
 *   ١ ضجيج مصادقة: `auth()` يرمي على كوكي تالف — ٦ أخطاء لكل طلب على صفحة بيعٍ
 *     لغير المسجَّلين، تغرق فيها أخطاء الدفع الحقيقية يوم تقع.
 *   ٢ توقّف التهيئة: «Route "/pay/[market]": encountered the unstable value
 *     `crypto.getRandomValues()` while prerendering» — أثرُه
 *     `GlobalNotFound → TopNav → MobileNotificationBadge`.
 *
 * والتوثيق يجعل `not-found` مقطعيّاً (Next 16 · `not-found.mdx`)، فوجودها هنا يمنع
 * الصفحة العامّة من دخول شجرة مسار البيع أصلاً — علاجٌ عند الجذر لا كتمٌ للعرَض.
 *
 * وشكلها يتبع مسار البيع: بلا ترويسة موقع ولا تذييل ولا قائمة — شاشةٌ واحدة ومخرج واحد.
 */
export default function PayNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center" dir="rtl">
      <h1 className="text-2xl font-black text-foreground sm:text-3xl">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        الرابط الذي فتحته لا يشير إلى باقة أو طلب. اختر باقتك من صفحة الأسعار.
      </p>
      <Link
        href="/sa"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-foreground px-6 text-[15px] font-bold text-background no-underline transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        عرض الباقات
      </Link>
    </main>
  );
}
