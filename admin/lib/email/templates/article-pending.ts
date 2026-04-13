import { baseTemplate, ctaButton, divider, heading, paragraph, badge } from "./base";

export interface ArticlePendingEmailParams {
  clientName: string;
  articleTitle: string;
  articleUrl: string;
  authorName: string;
}

export function articlePendingEmail({
  clientName,
  articleTitle,
  articleUrl,
  authorName,
}: ArticlePendingEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading("مقال جديد ينتظر موافقتك")}
    ${paragraph(`مرحباً ${clientName}،`)}
    ${paragraph(`قام <strong>${authorName}</strong> بإرسال مقال جديد للمراجعة والموافقة على نشره في موقعك.`)}
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
    ${ctaButton("مراجعة المقال والموافقة", articleUrl)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#999;">بإمكانك الموافقة على النشر أو طلب تعديلات من خلال لوحة تحكم مودونتي.</span>`)}
  `;

  return {
    subject: `مقال ينتظر موافقتك: ${articleTitle}`,
    html: baseTemplate(content, `${authorName} أرسل مقالاً للمراجعة`),
    text: `مرحباً ${clientName}،\n\nمقال جديد ينتظر موافقتك:\n${articleTitle}\n\nالكاتب: ${authorName}\n\nراجع المقال: ${articleUrl}\n\n— فريق مودونتي`,
  };
}
