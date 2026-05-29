import { baseTemplate, ctaButton, heading, paragraph, divider, warningBox } from "./base";

export interface ClientWelcomeEmailParams {
  clientName: string;
  email: string;
  password: string;
  consoleUrl: string;
}

export function clientWelcomeEmail({
  clientName,
  email,
  password,
  consoleUrl,
}: ClientWelcomeEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading(`مرحباً بك في مُدَوَّنَتِي، ${clientName}! 🎉`)}
    ${paragraph("تم إنشاء حسابك بنجاح. لوحة تحكّمك جاهزة — تقدر تدخل عليها وتكمّل بيانات شركتك من الآن.")}
    ${divider()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;border-radius:6px;padding:16px;margin-bottom:20px;">
      <tr>
        <td style="padding:8px 12px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#0E065A;">🔑 بيانات الدخول</p>
          <p style="margin:0 0 6px;font-size:13px;color:#333;">الرابط: <a href="${consoleUrl}" style="color:#3030FF;">${consoleUrl}</a></p>
          <p style="margin:0 0 6px;font-size:13px;color:#333;">اسم المستخدم: <strong>${email}</strong></p>
          <p style="margin:0;font-size:13px;color:#333;">كلمة المرور المؤقتة: <strong>${password}</strong> (نفس بريدك)</p>
        </td>
      </tr>
    </table>
    ${paragraph("<strong>الخطوات الأولى (مهمة):</strong>")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <strong style="font-size:14px;color:#0E065A;">1️⃣ سجّل دخول</strong>
          <p style="margin:4px 0 0;font-size:13px;color:#666;">من الرابط أعلاه باستخدام بريدك ككلمة مرور</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <strong style="font-size:14px;color:#0E065A;">2️⃣ أكمل بيانات شركتك</strong>
          <p style="margin:4px 0 0;font-size:13px;color:#666;">العنوان، الشعار، ومعلومات نشاطك</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <strong style="font-size:14px;color:#0E065A;">3️⃣ غيّر كلمة المرور</strong>
          <p style="margin:4px 0 0;font-size:13px;color:#666;">من "بيانات شركتك" اختر كلمة مرور قوية</p>
        </td>
      </tr>
    </table>
    ${warningBox("⏱️ بعد ما تكمّل بياناتك، فريقنا حيتواصل معاك لتفعيل حسابك بشكل كامل.")}
    ${paragraph("📱 بعد ما تسجّل دخول وتتأكّد إن إيميلك وكلمة المرور شغّالة، أرسل لنا رسالة «تم الدخول» على واتساب <a href=\"https://wa.me/966560299034\" style=\"color:#3030FF;text-decoration:none;\">00966560299034</a> — ومدير حسابك حيتواصل معك مباشرة لإكمال التفعيل.")}
    ${ctaButton("ادخل لوحة التحكّم", consoleUrl)}
    ${paragraph("لو احتجت أي مساعدة، تواصل معنا في أي وقت.")}
  `;

  return {
    subject: `مرحباً بك في مُدَوَّنَتِي، ${clientName}!`,
    html: baseTemplate(content, "حسابك جاهز — ابدأ بإكمال بيانات شركتك"),
    text: `مرحباً ${clientName}،

تم إنشاء حسابك في مُدَوَّنَتِي بنجاح.

بيانات الدخول:
- الرابط: ${consoleUrl}
- اسم المستخدم: ${email}
- كلمة المرور المؤقتة: ${password} (نفس بريدك)

الخطوات الأولى:
1. سجّل دخول من الرابط أعلاه
2. أكمل بيانات شركتك (العنوان، الشعار، معلومات نشاطك)
3. غيّر كلمة المرور لشيء قوي

بعد اكتمال بياناتك، فريقنا حيتواصل معاك لتفعيل حسابك.

📱 بعد ما تسجّل دخول وتتأكّد إن إيميلك وكلمة المرور شغّالة، أرسل لنا رسالة «تم الدخول» على واتساب 00966560299034 — ومدير حسابك حيتواصل معك مباشرة لإكمال التفعيل.

— فريق مُدَوَّنَتِي`,
  };
}
