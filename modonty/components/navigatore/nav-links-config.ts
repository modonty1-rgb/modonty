export const navLinksConfig = {
  company: [
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "اتصل بنا" },
    { href: "/subscribe", label: "اشترك في النشرة" },
  ],
  support: [
    { href: "/help", label: "مركز المساعدة" },
    { href: "/help/faq", label: "الأسئلة الشائعة" },
    { href: "/help/feedback", label: "إرسال ملاحظات" },
  ],
  legal: [
    { href: "/legal/user-agreement", label: "اتفاقية المستخدم" },
    { href: "/legal/privacy-policy", label: "سياسة الخصوصية" },
    { href: "/legal/cookie-policy", label: "سياسة ملفات تعريف الارتباط" },
    { href: "/legal/copyright-policy", label: "سياسة حقوق النشر" },
  ],
} as const;
