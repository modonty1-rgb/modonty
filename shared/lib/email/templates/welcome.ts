import { baseTemplate, ctaButton, divider, heading, paragraph, EMAIL_BRAND_AR, EMAIL_SITE_URL } from "../index";
import type { EmailContent } from "../index";

export interface WelcomeEmailParams {
  userName: string;
}

/** Reader signed up on modonty — sent by modonty, previewed by the admin, ONE file. */
export async function welcomeEmail({ userName }: WelcomeEmailParams): Promise<EmailContent> {
  const content = `
    ${heading(`أهلاً بك في ${EMAIL_BRAND_AR}، ${userName}! 🎉`)}
    ${paragraph(`حسابك جاهز. صرت جزءاً من مجتمع ${EMAIL_BRAND_AR} — منصة المحتوى الطبي والصحي الموثوق في السعودية والخليج.`)}
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
          <p style="margin:4px 0 0;font-size:13px;color:#666;">أسئلتك توصل مباشرة للمتخصصين</p>
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
    ${ctaButton("ابدأ القراءة", EMAIL_SITE_URL)}
  `;

  return {
    subject: `أهلاً بك في ${EMAIL_BRAND_AR}، ${userName}!`,
    html: await baseTemplate(content, `حسابك جاهز — ابدأ رحلتك مع ${EMAIL_BRAND_AR}`),
    text: `أهلاً ${userName}،\n\nأهلاً بك في ${EMAIL_BRAND_AR}! حسابك جاهز الحين.\n\nابدأ القراءة: ${EMAIL_SITE_URL}\n\n— فريق ${EMAIL_BRAND_AR}`,
  };
}
