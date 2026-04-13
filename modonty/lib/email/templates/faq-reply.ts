import { baseTemplate, ctaButton, heading, paragraph, divider } from "./base";

export interface FaqReplyEmailParams {
  userName: string;
  question: string;
  answer: string;
  articleTitle: string;
  articleUrl: string;
}

export function faqReplyEmail({
  userName,
  question,
  answer,
  articleTitle,
  articleUrl,
}: FaqReplyEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading("تمّت الإجابة على سؤالك")}
    ${paragraph(`مرحباً ${userName}،`)}
    ${paragraph(`أجاب المتخصص على سؤالك المتعلق بـ <strong>${articleTitle}</strong>:`)}
    ${divider()}
    <div style="background-color:#f0fffe;border-right:4px solid #00D8D8;padding:16px;border-radius:4px;margin:8px 0;">
      <p style="margin:0 0 6px;font-size:12px;color:#999;">سؤالك:</p>
      <p style="margin:0;font-size:14px;color:#555;direction:rtl;">${question}</p>
    </div>
    <div style="background-color:#f8f9ff;border-right:4px solid #3030FF;padding:16px;border-radius:4px;margin:8px 0 24px;">
      <p style="margin:0 0 6px;font-size:12px;color:#999;">الإجابة:</p>
      <p style="margin:0;font-size:15px;color:#333;line-height:1.7;direction:rtl;">${answer}</p>
    </div>
    ${ctaButton("عرض الإجابة كاملةً", articleUrl)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#999;">عندك سؤال آخر؟ <a href="${articleUrl}" style="color:#3030FF;">اسأل الآن</a></span>`)}
  `;

  return {
    subject: `تمّت الإجابة على سؤالك — ${articleTitle}`,
    html: baseTemplate(content, "تمّت الإجابة على سؤالك في مودونتي"),
    text: `مرحباً ${userName}،\n\nتمّت الإجابة على سؤالك:\nسؤالك: ${question}\n\nالإجابة: ${answer}\n\nشاهد الإجابة: ${articleUrl}\n\n— فريق مودونتي`,
  };
}
