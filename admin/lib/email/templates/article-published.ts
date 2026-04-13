import { baseTemplate, ctaButton, divider, heading, paragraph } from "./base";

export interface ArticlePublishedEmailParams {
  clientName: string;
  articleTitle: string;
  articleUrl: string;
  publishedAt: string;
}

export function articlePublishedEmail({
  clientName,
  articleTitle,
  articleUrl,
  publishedAt,
}: ArticlePublishedEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading("تم نشر مقالك بنجاح ✅")}
    ${paragraph(`مرحباً ${clientName}،`)}
    ${paragraph("تمّ نشر مقالك وأصبح متاحاً للقراء على موقع مودونتي.")}
    ${divider()}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background-color:#f0fff8;border-radius:6px;border:1px solid #b7f0d4;">
          <p style="margin:0 0 8px;font-size:12px;color:#999;">عنوان المقال</p>
          <p style="margin:0 0 12px;font-size:16px;font-weight:bold;color:#0E065A;">${articleTitle}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#999;">تاريخ النشر</p>
          <p style="margin:0;font-size:13px;color:#333;">${publishedAt}</p>
        </td>
      </tr>
    </table>
    ${ctaButton("مشاهدة المقال المنشور", articleUrl)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#999;">شارك مقالك مع جمهورك للحصول على أكبر انتشار ممكن.</span>`)}
  `;

  return {
    subject: `تم نشر مقالك: ${articleTitle}`,
    html: baseTemplate(content, `مقالك منشور الآن على مودونتي`),
    text: `مرحباً ${clientName}،\n\nتم نشر مقالك:\n${articleTitle}\n\nتاريخ النشر: ${publishedAt}\n\nشاهد المقال: ${articleUrl}\n\n— فريق مودونتي`,
  };
}
