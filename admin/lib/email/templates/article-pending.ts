import { baseTemplate, ctaButton, divider, heading, paragraph } from "@modonty/shared/lib/email";
import type { EmailContent } from "@modonty/shared/lib/email";

export interface ArticlePendingEmailParams {
  clientName: string;
  articleTitle: string;
  articleUrl: string;
  authorName: string;
}

export async function articlePendingEmail({
  clientName,
  articleTitle,
  articleUrl,
  authorName,
}: ArticlePendingEmailParams): Promise<EmailContent> {
  const content = `
    ${heading("مقال جديد ينتظر موافقتك")}
    ${paragraph(`مرحباً ${clientName}،`)}
    ${paragraph(`<strong>${authorName}</strong> أرسل لك مقالاً جديداً تراجعه وتوافق على نشره في موقعك.`)}
    ${divider()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#f8f9ff;border-radius:6px;border:1px solid #e0e3ff;">
          <p style="margin:0 0 8px;font-size:12px;color:#999;">عنوان المقال</p>
          <p style="margin:0 0 12px;font-size:16px;font-weight:bold;color:#0E065A;">${articleTitle}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#999;">الكاتب</p>
          <p style="margin:0;font-size:13px;color:#333;">${authorName}</p>
        </td>
      </tr>
    </table>
    ${ctaButton("راجع المقال ووافق", articleUrl)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#999;">تقدر توافق على النشر أو تطلب تعديلات من لوحة تحكّمك.</span>`)}
  `;

  return {
    subject: `مقال ينتظر موافقتك: ${articleTitle}`,
    html: await baseTemplate(content, `${authorName} أرسل مقالاً للمراجعة`),
    text: `مرحباً ${clientName}،\n\nمقال جديد ينتظر موافقتك:\n${articleTitle}\n\nالكاتب: ${authorName}\n\nراجع المقال: ${articleUrl}\n\n— فريق مُدَوَّنَتِي`,
  };
}
