"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientWelcomeEmail } from "@/lib/email/templates/client-welcome";
import { sendEmailWithRetry } from "@/lib/email/resend-client";
import bcrypt from "bcryptjs";

const CONSOLE_URL = process.env.CONSOLE_URL || "https://console.modonty.com";

/**
 * **يولّد الكلمةَ ويخزّنها ويرسلها — في عمليّةٍ واحدة.**
 *
 * كان يرسل `DEFAULT_CLIENT_PASSWORD` الثابتة (`"admin123"`) بينما `update-client-grouped.ts:576`
 * يخزّن هشَّ ما كتبه الموظّف — فالعميلُ يتسلّم مفتاحاً لا يفتح. مقيسٌ حيّاً ١٩ سبتمبر ٢٠٢٦:
 * المخزَّنُ هشُّ كلمةٍ من ١٤ حرفاً، والمرسَلُ `admin123`.
 *
 * ولماذا انكسر: التفعيلُ كان يكتب تلك الثابتةَ مهشوشةً عند الإنشاء فكان الإيميلُ صادقاً.
 * وفي نفس اليوم صار التفعيلُ يفتح الملفَّ **بلا كلمة مرور** (خالد: «خلّيه فاضي، هنعملها في
 * التعديل») — فانقطعت الصلةُ ولم يُحدَّث الإيميل معها.
 *
 * والعلاجُ توليدٌ هنا لا قراءةٌ من القاعدة: المخزَّنُ **هشٌّ لا يُفكّ**، فلا سبيلَ لإرسال
 * الكلمة القائمة. وإرسالُ بيانات الدخول يعني تسليمَ دخولٍ جديد — فيُستبدل ما كان.
 *
 * ⚠ لذلك هو فعلٌ لا يُرجَع: كلُّ ضغطةٍ تُبطل كلمةَ العميل السابقة.
 */
export async function sendClientWelcome(clientId: string, plainPassword: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true },
    });
    if (!client || !client.email) {
      return { success: false, error: "العميل غير موجود أو لا يملك بريداً إلكترونياً." };
    }

    /**
     * الكلمةُ تأتي من صفحة المعاينة لا تُولَّد هنا (خالد ١٩ سبتمبر ٢٠٢٦: «أبغى أشوفها»).
     * ولو وُلِّدت هنا لأرسلنا غيرَ ما عُرض — وهو نفسُ عطب `admin123` الذي أصلحناه.
     */
    const plain = (plainPassword ?? "").trim();
    if (plain.length < 8) {
      return { success: false, error: "كلمةُ المرور غير صالحة — افتح صفحة الترحيب من جديد." };
    }

    // يُخزَّن **قبل** الإرسال: لو فشل البريد بقيت الكلمةُ صالحةً ويُعاد الإرسال. والعكس
    // يُرسل كلمةً لا وجودَ لها في القاعدة.
    await db.client.update({ where: { id: client.id }, data: { password: await bcrypt.hash(plain, 10) } });

    const email = await clientWelcomeEmail({
      clientName: client.name,
      email: client.email,
      password: plain,
      consoleUrl: CONSOLE_URL,
    });

    await sendEmailWithRetry({
      from: process.env.RESEND_FROM || "",
      to: client.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      // Tags surface in Resend webhooks so we can track delivered/opened per client.
      tags: [
        { name: "emailType", value: "client-welcome" },
        { name: "clientId", value: client.id },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: "فشل إرسال إيميل الترحيب. حاول مرة أخرى." };
  }
}
