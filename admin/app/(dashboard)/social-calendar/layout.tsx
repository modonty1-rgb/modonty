import type { ReactNode } from "react";

export const metadata = { title: "Social Calendar" };

/**
 * إطار كل شاشات تقويم السوشيال: عربي ومن اليمين، كالتطبيق الأصلي (`JBRSEO/content/app/layout.tsx`)
 * وكصفحات الفريق الحديثة في الأدمن (`tasks/page.tsx`). `contents` كي لا يغيّر تخطيط `<main>`.
 */
export default function SocialCalendarLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="contents">
      {children}
    </div>
  );
}
