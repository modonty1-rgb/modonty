import { baseTemplate, ctaButton, heading, paragraph, divider } from "./base";
import { BRAND_AR, SITE_URL } from "@/lib/brand";

export interface WelcomeEmailParams {
  userName: string;
}

export function welcomeEmail({ userName }: WelcomeEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading(`أهلاً بك في ${BRAND_AR}، ${userName}! 🎉`)}
    ${paragraph(`حسابك جاهز. أنت الآن جزء من مجتمع ${BRAND_AR} — منصة المحتوى الطبي والصحي الموثوق في السعودية والخليج.`)}
    ${divider()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:20px;">📖</span>
          <strong style="font-size:14px;color:#0E065A;margin-right:8px;">اقرأ المقالات</strong>
          <p style="margin:4px 0 0;font-size:13px;color:#666;">محتوى طبي موثوق من متخصصين معتمدين</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:20px;">💬</span>
          <strong style="font-size:14px;color:#0E065A;margin-right:8px;">اسأل الخبراء</strong>
          <p style="margin:4px 0 0;font-size:13px;color:#666;">أسئلتك تصل مباشرة للمتخصصين</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="font-size:20px;">🔔</span>
          <strong style="font-size:14px;color:#0E065A;margin-right:8px;">تابع الجديد</strong>
          <p style="margin:4px 0 0;font-size:13px;color:#666;">أحدث المقالات والنصائح الصحية</p>
        </td>
      </tr>
    </table>
    ${ctaButton("ابدأ الاستكشاف", SITE_URL)}
  `;

  return {
    subject: `أهلاً بك في ${BRAND_AR}، ${userName}!`,
    html: baseTemplate(content, `حسابك جاهز — ابدأ رحلتك مع ${BRAND_AR}`),
    text: `أهلاً ${userName}،\n\nأهلاً بك في ${BRAND_AR}! حسابك جاهز الآن.\n\nابدأ الاستكشاف: ${SITE_URL}\n\n— فريق ${BRAND_AR}`,
  };
}
