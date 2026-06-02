import { baseTemplate, ctaButton, divider, heading, paragraph, warningBox } from "./base";
import { BRAND_AR } from "@/lib/brand";

export interface PasswordResetEmailParams {
  userName: string;
  resetUrl: string;
}

export function passwordResetEmail({ userName, resetUrl }: PasswordResetEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading("إعادة تعيين كلمة المرور")}
    ${paragraph(`مرحباً ${userName}،`)}
    ${paragraph(`تلقّينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في ${BRAND_AR}. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة.`)}
    ${ctaButton("إعادة تعيين كلمة المرور", resetUrl)}
    ${divider()}
    ${warningBox("⏰ هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا الإيميل — حسابك بأمان.")}
    ${paragraph(`أو انسخ هذا الرابط في المتصفح:`)}
    <p style="margin:0;font-size:12px;color:#666;word-break:break-all;direction:ltr;text-align:left;">${resetUrl}</p>
  `;

  return {
    subject: `إعادة تعيين كلمة المرور — ${BRAND_AR}`,
    html: baseTemplate(content, `طلب إعادة تعيين كلمة المرور لحسابك في ${BRAND_AR}`),
    text: `مرحباً ${userName}،\n\nتلقّينا طلباً لإعادة تعيين كلمة المرور.\n\nاضغط على هذا الرابط:\n${resetUrl}\n\nهذا الرابط صالح لساعة واحدة فقط.\n\nإذا لم تطلب ذلك، تجاهل هذا الإيميل.\n\n— فريق ${BRAND_AR}`,
  };
}
