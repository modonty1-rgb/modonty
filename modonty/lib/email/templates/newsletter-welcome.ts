import { baseTemplate, ctaButton, heading, paragraph, divider } from "./base";
import { BRAND_AR, SITE_URL } from "@/lib/brand";

export interface NewsletterWelcomeParams {
  email: string;
}

export function newsletterWelcomeEmail({ email }: NewsletterWelcomeParams): {
  subject: string;
  html: string;
  text: string;
} {
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const content = `
    ${heading(`أهلاً بك في منصة ${BRAND_AR}! 📬`)}
    ${paragraph("شكراً لاشتراكك! ستصلك أحدث المقالات الطبية والنصائح الصحية من متخصصين معتمدين في السعودية والخليج.")}
    ${divider()}
    ${paragraph("توقّع منّا:")}
    <ul style="margin:0 0 24px;padding-right:20px;font-size:14px;color:#333;line-height:2;">
      <li>مقالات طبية موثوقة أسبوعياً</li>
      <li>نصائح صحية عملية من متخصصين</li>
      <li>أحدث الأبحاث والتوصيات الطبية</li>
    </ul>
    ${ctaButton("اقرأ أحدث المقالات", SITE_URL)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#999;text-align:center;">
      لإلغاء الاشتراك: <a href="${unsubscribeUrl}" style="color:#3030FF;">اضغط هنا</a>
    </p>
  `;

  return {
    subject: `أهلاً بك في منصة ${BRAND_AR} 📬`,
    html: baseTemplate(content, "مرحباً بك — ستصلك أحدث المقالات الطبية الموثوقة"),
    text: `أهلاً،\n\nشكراً لاشتراكك في منصة ${BRAND_AR}!\n\nستصلك أحدث المقالات الطبية أسبوعياً.\n\nاقرأ المقالات: ${SITE_URL}\n\nلإلغاء الاشتراك: ${unsubscribeUrl}\n\n— فريق ${BRAND_AR}`,
  };
}
