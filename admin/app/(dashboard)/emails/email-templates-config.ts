export interface EmailTemplateConfig {
  id: string;
  label: string;
  description: string;
  group: "Modonty Emails" | "Admin Emails";
}

export const EMAIL_TEMPLATES: EmailTemplateConfig[] = [
  { id: "welcome", label: "Welcome", description: "Sent on new user registration", group: "Modonty Emails" },
  { id: "email-verification", label: "Email Verification", description: "Verify email address after signup", group: "Modonty Emails" },
  { id: "password-reset", label: "Password Reset", description: "User requests password reset", group: "Modonty Emails" },
  { id: "comment-reply", label: "Comment Reply", description: "Someone replied to their comment", group: "Modonty Emails" },
  { id: "faq-reply", label: "FAQ Reply", description: "Expert answered their question", group: "Modonty Emails" },
  { id: "newsletter-welcome", label: "Newsletter Welcome", description: "New newsletter subscriber", group: "Modonty Emails" },
  { id: "article-pending", label: "Article Pending", description: "Article awaiting client approval", group: "Admin Emails" },
  { id: "article-published", label: "Article Published", description: "Article published confirmation to client", group: "Admin Emails" },
];
