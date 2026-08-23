import { baseTemplate, ctaButton, divider, heading, paragraph, EMAIL_BRAND_AR, EMAIL_SITE_URL } from "../index";
import type { EmailContent } from "../index";

export interface CommentReplyEmailParams {
  userName: string;
  articleTitle: string;
  articleUrl: string;
  replyAuthor: string;
  replyContent: string;
}

export async function commentReplyEmail({
  userName,
  articleTitle,
  articleUrl,
  replyAuthor,
  replyContent,
}: CommentReplyEmailParams): Promise<EmailContent> {
  const content = `
    ${heading("ردّ جديد على تعليقك")}
    ${paragraph(`مرحباً ${userName}،`)}
    ${paragraph(`<strong>${replyAuthor}</strong> ردّ على تعليقك في مقال: <strong>${articleTitle}</strong>`)}
    ${divider()}
    <div style="background-color:#f8f9ff;border-right:4px solid #3030FF;padding:16px;border-radius:4px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7;direction:rtl;">${replyContent}</p>
    </div>
    ${divider()}
    ${ctaButton("شوف الردّ وشارك في النقاش", articleUrl)}
    ${paragraph(`<span style="font-size:13px;color:#999;">ما تبي إشعارات التعليقات؟ غيّرها من <a href="${EMAIL_SITE_URL}/users/settings" style="color:#3030FF;">صفحة حسابك</a>.</span>`)}
  `;

  return {
    subject: `ردّ جديد على تعليقك — ${articleTitle}`,
    html: await baseTemplate(content, `${replyAuthor} ردّ على تعليقك في ${EMAIL_BRAND_AR}`),
    text: `مرحباً ${userName}،\n\n${replyAuthor} ردّ على تعليقك في: ${articleTitle}\n\nالردّ: ${replyContent}\n\nشوف الردّ: ${articleUrl}\n\n— فريق ${EMAIL_BRAND_AR}`,
  };
}
