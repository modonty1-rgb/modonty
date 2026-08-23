import { baseTemplate, ctaButton, divider, heading, paragraph } from "@modonty/shared/lib/email";
import type { EmailContent } from "@modonty/shared/lib/email";

export interface ArticlePublishedEmailParams {
  clientName: string;
  articleTitle: string;
  articleUrl: string;
  /** Already formatted for the reader (Arabic date) — the caller owns the format. */
  publishedAt: string;
}

export async function articlePublishedEmail({
  clientName,
  articleTitle,
  articleUrl,
  publishedAt,
}: ArticlePublishedEmailParams): Promise<EmailContent> {
  const content = `
    ${heading("مقالك صار منشوراً ✅")}
    ${paragraph(`مرحباً ${clientName}،`)}
    ${paragraph("مقالك انتشر على مُدَوَّنَتِي والقرّاء يقدرون يوصلون له الحين.")}
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
    ${ctaButton("شوف المقال المنشور", articleUrl)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#999;">شارك مقالك مع جمهورك عشان يوصل لأكبر عدد.</span>`)}
  `;

  return {
    subject: `مقالك صار منشوراً: ${articleTitle}`,
    html: await baseTemplate(content, "مقالك منشور الحين على مُدَوَّنَتِي"),
    text: `مرحباً ${clientName}،\n\nمقالك صار منشوراً:\n${articleTitle}\n\nتاريخ النشر: ${publishedAt}\n\nشوف المقال: ${articleUrl}\n\n— فريق مُدَوَّنَتِي`,
  };
}
