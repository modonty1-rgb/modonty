import { baseTemplate, ctaButton, divider, heading, paragraph, EMAIL_BRAND_AR, EMAIL_SITE_URL } from "../index";
import type { EmailContent } from "../index";

export interface NewsletterWelcomeParams {
  email: string;
}

export async function newsletterWelcomeEmail({ email }: NewsletterWelcomeParams): Promise<EmailContent> {
  const unsubscribeUrl = `${EMAIL_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content = `
    ${heading(`أهلاً بك في نشرة ${EMAIL_BRAND_AR}! 📬`)}
    ${paragraph("شكراً لاشتراكك! بتوصلك أحدث المقالات الطبية والنصائح الصحية من متخصصين معتمدين في السعودية والخليج.")}
    ${divider()}
    ${paragraph("توقّع منّا:")}
    <ul style="margin:0 0 24px;padding-right:20px;font-size:14px;color:#333;line-height:2;">
      <li>مقالات طبية موثوقة كل أسبوع</li>
      <li>نصائح صحية عملية من متخصصين</li>
      <li>أحدث الأبحاث والتوصيات الطبية</li>
    </ul>
    ${ctaButton("اقرأ أحدث المقالات", EMAIL_SITE_URL)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#999;text-align:center;">
      تبي توقف النشرة؟ <a href="${unsubscribeUrl}" style="color:#3030FF;">اضغط هنا</a>
    </p>
  `;

  return {
    subject: `أهلاً بك في نشرة ${EMAIL_BRAND_AR} 📬`,
    html: await baseTemplate(content, "أهلاً بك — بتوصلك أحدث المقالات الطبية الموثوقة"),
    text: `أهلاً،\n\nشكراً لاشتراكك في نشرة ${EMAIL_BRAND_AR}!\n\nبتوصلك أحدث المقالات الطبية كل أسبوع.\n\nاقرأ المقالات: ${EMAIL_SITE_URL}\n\nلإيقاف النشرة: ${unsubscribeUrl}\n\n— فريق ${EMAIL_BRAND_AR}`,
  };
}
