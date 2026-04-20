"use server";

import { auth } from "@/lib/auth";
import { welcomeEmail } from "@/lib/email/templates/welcome";
import { emailVerificationEmail } from "@/lib/email/templates/email-verification";
import { passwordResetEmail } from "@/lib/email/templates/password-reset";
import { commentReplyEmail } from "@/lib/email/templates/comment-reply";
import { faqReplyEmail } from "@/lib/email/templates/faq-reply";
import { newsletterWelcomeEmail } from "@/lib/email/templates/newsletter-welcome";
import { articlePendingEmail } from "@/lib/email/templates/article-pending";
import { articlePublishedEmail } from "@/lib/email/templates/article-published";
import { sendEmailWithRetry } from "@/lib/email/resend-client";
import { EMAIL_TEMPLATES } from "../email-templates-config";

const MOCK = {
  userName: "أحمد محمد",
  verifyUrl: "https://modonty.com/verify?token=abc123def456abc123",
  resetUrl: "https://modonty.com/reset?token=abc123def456abc123",
  articleTitle: "كيف تحافظ على صحتك في الشتاء؟",
  articleUrl: "https://www.modonty.com/articles/كيف-تحافظ-على-صحتك",
  replyAuthor: "د. محمد علي",
  replyContent: "شكراً على سؤالك! للحفاظ على صحتك في الشتاء يُنصح بتناول فيتامين C بانتظام وممارسة الرياضة يومياً.",
  question: "ما هي أفضل طريقة لتقوية المناعة في الشتاء؟",
  answer: "يُنصح بتناول الخضروات والفواكه الغنية بفيتامين C، وممارسة الرياضة بانتظام، والنوم الكافي لتقوية جهاز المناعة.",
  email: "ahmed@example.com",
  clientName: "عيادات بلسم الطبية",
  authorName: "أحمد العمر",
  publishedAt: "٢٠ أبريل ٢٠٢٦",
};

function renderTemplate(id: string): { subject: string; html: string; text: string } {
  switch (id) {
    case "welcome":
      return welcomeEmail({ userName: MOCK.userName });
    case "email-verification":
      return emailVerificationEmail({ userName: MOCK.userName, verifyUrl: MOCK.verifyUrl });
    case "password-reset":
      return passwordResetEmail({ userName: MOCK.userName, resetUrl: MOCK.resetUrl });
    case "comment-reply":
      return commentReplyEmail({
        userName: MOCK.userName,
        articleTitle: MOCK.articleTitle,
        articleUrl: MOCK.articleUrl,
        replyAuthor: MOCK.replyAuthor,
        replyContent: MOCK.replyContent,
      });
    case "faq-reply":
      return faqReplyEmail({
        userName: MOCK.userName,
        question: MOCK.question,
        answer: MOCK.answer,
        articleTitle: MOCK.articleTitle,
        articleUrl: MOCK.articleUrl,
      });
    case "newsletter-welcome":
      return newsletterWelcomeEmail({ email: MOCK.email });
    case "article-pending":
      return articlePendingEmail({
        clientName: MOCK.clientName,
        articleTitle: MOCK.articleTitle,
        articleUrl: MOCK.articleUrl,
        authorName: MOCK.authorName,
      });
    case "article-published":
      return articlePublishedEmail({
        clientName: MOCK.clientName,
        articleTitle: MOCK.articleTitle,
        articleUrl: MOCK.articleUrl,
        publishedAt: MOCK.publishedAt,
      });
    default:
      throw new Error(`Unknown template: ${id}`);
  }
}

export async function getTemplatePreview(id: string): Promise<{ subject: string; html: string }> {
  const { subject, html } = renderTemplate(id);
  return { subject, html };
}

export async function sendTestEmail(
  id: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session) return { success: false, message: "Unauthorized" };

  const template = EMAIL_TEMPLATES.find((t) => t.id === id);
  if (!template) return { success: false, message: "Template not found" };

  try {
    const { subject, html, text } = renderTemplate(id);
    await sendEmailWithRetry({
      from: process.env.RESEND_FROM!,
      to: "modonty1@gmail.com",
      subject: `[TEST] ${subject}`,
      html,
      text,
    });
    return { success: true, message: `Sent: ${template.label}` };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Send failed" };
  }
}
