import { baseTemplate, ctaButton, divider, heading, paragraph, warningBox, EMAIL_BRAND_AR } from "../index";
import type { EmailContent } from "../index";

export interface EmailVerificationParams {
  userName: string;
  verifyUrl: string;
}

export async function emailVerificationEmail({ userName, verifyUrl }: EmailVerificationParams): Promise<EmailContent> {
  const content = `
    ${heading(`فعّل حسابك في ${EMAIL_BRAND_AR}`)}
    ${paragraph(`أهلاً ${userName}،`)}
    ${paragraph(`شكراً لتسجيلك في ${EMAIL_BRAND_AR}! باقي خطوة وحدة: اضغط الزر تحت وفعّل بريدك.`)}
    ${ctaButton("تفعيل الحساب", verifyUrl)}
    ${divider()}
    ${warningBox("⏰ هذا الرابط يشتغل ٢٤ ساعة فقط.")}
    ${paragraph(`لو ما كنت أنت اللي سجّل في ${EMAIL_BRAND_AR}، تجاهل هذا الإيميل.`)}
    <p style="margin:0;font-size:12px;color:#666;word-break:break-all;direction:ltr;text-align:left;">${verifyUrl}</p>
  `;

  return {
    subject: `فعّل حسابك في ${EMAIL_BRAND_AR}`,
    html: await baseTemplate(content, `فعّل بريدك للوصول لحسابك في ${EMAIL_BRAND_AR}`),
    text: `أهلاً ${userName}،\n\nشكراً لتسجيلك في ${EMAIL_BRAND_AR}!\n\nفعّل حسابك من هذا الرابط:\n${verifyUrl}\n\nالرابط يشتغل ٢٤ ساعة فقط.\n\n— فريق ${EMAIL_BRAND_AR}`,
  };
}
