import { baseTemplate, ctaButton, divider, heading, paragraph, EMAIL_BRAND_AR } from "../index";
import type { EmailContent } from "../index";

export interface FaqReplyEmailParams {
  userName: string;
  question: string;
  answer: string;
  articleTitle: string;
  articleUrl: string;
}

/** Sent by the console when the partner answers a reader's question; previewed by the admin. */
export async function faqReplyEmail({
  userName,
  question,
  answer,
  articleTitle,
  articleUrl,
}: FaqReplyEmailParams): Promise<EmailContent> {
  const content = `
    ${heading("سؤالك صار له جواب")}
    ${paragraph(`مرحباً ${userName}،`)}
    ${paragraph(`المتخصص ردّ على سؤالك عن <strong>${articleTitle}</strong>:`)}
    ${divider()}
    <div style="background-color:#f0fffe;border-right:4px solid #00D8D8;padding:16px;border-radius:4px;margin:8px 0;">
      <p style="margin:0 0 6px;font-size:12px;color:#999;">سؤالك:</p>
      <p style="margin:0;font-size:14px;color:#555;direction:rtl;">${question}</p>
    </div>
    <div style="background-color:#f8f9ff;border-right:4px solid #3030FF;padding:16px;border-radius:4px;margin:8px 0 24px;">
      <p style="margin:0 0 6px;font-size:12px;color:#999;">الجواب:</p>
      <p style="margin:0;font-size:15px;color:#333;line-height:1.7;direction:rtl;">${answer}</p>
    </div>
    ${ctaButton("شوف الجواب كاملاً", articleUrl)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#999;">عندك سؤال ثاني؟ <a href="${articleUrl}" style="color:#3030FF;">اسأل الحين</a></span>`)}
  `;

  return {
    subject: `سؤالك صار له جواب — ${articleTitle}`,
    html: await baseTemplate(content, `المتخصص ردّ على سؤالك في ${EMAIL_BRAND_AR}`),
    text: `مرحباً ${userName}،\n\nسؤالك صار له جواب:\nسؤالك: ${question}\n\nالجواب: ${answer}\n\nشوف الجواب: ${articleUrl}\n\n— فريق ${EMAIL_BRAND_AR}`,
  };
}
