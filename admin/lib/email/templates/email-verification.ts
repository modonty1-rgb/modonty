import { baseTemplate, ctaButton, divider, heading, paragraph, warningBox } from "./base";

export interface EmailVerificationParams {
  userName: string;
  verifyUrl: string;
}

export function emailVerificationEmail({ userName, verifyUrl }: EmailVerificationParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading("تفعيل حسابك في مودونتي")}
    ${paragraph(`أهلاً ${userName}،`)}
    ${paragraph("شكراً لتسجيلك في مودونتي! خطوة واحدة فقط تفصلك عن الوصول الكامل — اضغط على الزر أدناه لتفعيل بريدك الإلكتروني.")}
    ${ctaButton("تفعيل الحساب", verifyUrl)}
    ${divider()}
    ${warningBox("⏰ هذا الرابط صالح لمدة 24 ساعة فقط.")}
    ${paragraph("إذا لم تقم بإنشاء حساب في مودونتي، تجاهل هذا الإيميل.")}
    <p style="margin:0;font-size:12px;color:#666;word-break:break-all;direction:ltr;text-align:left;">${verifyUrl}</p>
  `;

  return {
    subject: "فعّل حسابك في مودونتي",
    html: baseTemplate(content, "فعّل بريدك الإلكتروني للوصول لحسابك في مودونتي"),
    text: `أهلاً ${userName}،\n\nشكراً لتسجيلك في مودونتي!\n\nفعّل حسابك عبر هذا الرابط:\n${verifyUrl}\n\nهذا الرابط صالح لـ 24 ساعة.\n\n— فريق مودونتي`,
  };
}
