import { baseTemplate, ctaButton, heading, paragraph, divider } from "./base";

export interface WelcomeEmailParams {
  userName: string;
}

export function welcomeEmail({ userName }: WelcomeEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading(`أهلاً بك في مودونتي، ${userName}! 🎉`)}
    ${paragraph("حسابك جاهز. أنت الآن جزء من مجتمع مودونتي — منصة المحتوى الطبي والصحي الموثوق في السعودية والخليج.")}
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
    ${ctaButton("ابدأ الاستكشاف", "https://modonty.com")}
  `;

  return {
    subject: `أهلاً بك في مودونتي، ${userName}!`,
    html: baseTemplate(content, "حسابك جاهز — ابدأ رحلتك مع مودونتي"),
    text: `أهلاً ${userName}،\n\nأهلاً بك في مودونتي! حسابك جاهز الآن.\n\nابدأ الاستكشاف: https://modonty.com\n\n— فريق مودونتي`,
  };
}
