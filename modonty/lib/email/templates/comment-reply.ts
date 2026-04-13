import { baseTemplate, ctaButton, heading, paragraph, divider } from "./base";

export interface CommentReplyEmailParams {
  userName: string;
  articleTitle: string;
  articleUrl: string;
  replyAuthor: string;
  replyContent: string;
}

export function commentReplyEmail({
  userName,
  articleTitle,
  articleUrl,
  replyAuthor,
  replyContent,
}: CommentReplyEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    ${heading("ردّ جديد على تعليقك")}
    ${paragraph(`مرحباً ${userName}،`)}
    ${paragraph(`ردّ <strong>${replyAuthor}</strong> على تعليقك في مقال: <strong>${articleTitle}</strong>`)}
    ${divider()}
    <div style="background-color:#f8f9ff;border-right:4px solid #3030FF;padding:16px;border-radius:4px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7;direction:rtl;">${replyContent}</p>
    </div>
    ${divider()}
    ${ctaButton("عرض الرد والمشاركة في النقاش", articleUrl)}
    ${paragraph(`<span style="font-size:13px;color:#999;">لإيقاف إشعارات التعليقات، يمكنك تعديل إعداداتك من <a href="https://modonty.com/users/settings" style="color:#3030FF;">صفحة الحساب</a>.</span>`)}
  `;

  return {
    subject: `ردّ جديد على تعليقك — ${articleTitle}`,
    html: baseTemplate(content, `${replyAuthor} ردّ على تعليقك في مودونتي`),
    text: `مرحباً ${userName}،\n\nردّ ${replyAuthor} على تعليقك في: ${articleTitle}\n\nالرد: ${replyContent}\n\nشاهد الرد: ${articleUrl}\n\n— فريق مودونتي`,
  };
}
