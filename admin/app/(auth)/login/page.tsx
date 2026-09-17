import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoginForm } from "./components/login-form";

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let session;
  try {
    session = await auth();
  } catch (error: any) {
    // Only log unexpected errors, not JWT session errors (expected on login page)
    if (error?.code !== "JWTSessionError") {
      console.error("Auth error in login page:", error);
    }
    // Continue to show login form on error
    session = null;
  }

  /**
   * القاعدةُ هي المرجع، لا التذكرةُ وحدها — وإلّا دارت الصفحةُ في حلقةٍ لا تنتهي.
   *
   * التذكرة (JWT) صالحةٌ ذاتيّاً ولا تسأل القاعدة، بينما `proxy.ts` يسألها: فلو حُذف
   * صفُّ الموظّف أو أُوقف وهو داخلٌ بعد، صار لنفس السؤال جوابان — فتقول هذه الصفحة
   * «داخلٌ» وتحوّل إلى `/`، ويقول البروكسي «ليس داخلاً» ويرجّع إلى `/login`، بلا توقّف.
   * ولا يصل صاحبُه إلى نموذج الدخول ليدخل بحسابٍ آخر.
   *
   * ظهر يوم ١٧ سبتمبر ٢٠٢٦ بعد مزامنةٍ استبدلت جدول `staff`، والسجلّ الخام كان:
   *   GET /login 200 → GET /api/auth/session ×2 → GET /login 200 → ... كلّ نصف ثانية
   *
   * وهو ليس عارضَ تطويرٍ: **إيقافُ أيّ موظّفٍ في الإنتاج يفعل الشيء نفسه بمتصفّحه.**
   * فيُسأل الصفُّ هنا بنفس شرط `proxy.ts:45-49` — مصدرٌ واحدٌ للجواب.
   */
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (userId) {
    const staffRow = await db.staff
      .findUnique({ where: { id: userId }, select: { isActive: true } })
      .catch(() => null);
    if (staffRow && staffRow.isActive !== false) {
      redirect("/");
    }
    // تذكرةٌ يتيمة: صفُّها محذوفٌ أو موقوف. يُعرض النموذج بدل التحويل، وستُستبدل
    // التذكرةُ عند أوّل دخولٍ ناجح.
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
