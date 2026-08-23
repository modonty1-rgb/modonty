import { baseTemplate, ctaButton, divider, heading, paragraph, warningBox, EMAIL_BRAND_AR } from "../index";
import type { EmailContent } from "../index";

export interface PasswordResetEmailParams {
  userName: string;
  resetUrl: string;
}

export async function passwordResetEmail({ userName, resetUrl }: PasswordResetEmailParams): Promise<EmailContent> {
  const content = `
    ${heading("تغيير كلمة المرور")}
    ${paragraph(`مرحباً ${userName}،`)}
    ${paragraph(`وصلنا طلب تغيير كلمة المرور لحسابك في ${EMAIL_BRAND_AR}. اضغط الزر تحت واختر كلمة مرور جديدة.`)}
    ${ctaButton("تغيير كلمة المرور", resetUrl)}
    ${divider()}
    ${warningBox("⏰ هذا الرابط يشتغل ساعة وحدة فقط. لو ما طلبت تغيير كلمة المرور، تجاهل هذا الإيميل — حسابك بأمان.")}
    ${paragraph("أو انسخ هذا الرابط في المتصفح:")}
    <p style="margin:0;font-size:12px;color:#666;word-break:break-all;direction:ltr;text-align:left;">${resetUrl}</p>
  `;

  return {
    subject: `تغيير كلمة المرور — ${EMAIL_BRAND_AR}`,
    html: await baseTemplate(content, `طلب تغيير كلمة المرور لحسابك في ${EMAIL_BRAND_AR}`),
    text: `مرحباً ${userName}،\n\nوصلنا طلب تغيير كلمة المرور.\n\nافتح هذا الرابط:\n${resetUrl}\n\nالرابط يشتغل ساعة وحدة فقط.\n\nلو ما طلبت ذلك، تجاهل هذا الإيميل.\n\n— فريق ${EMAIL_BRAND_AR}`,
  };
}
