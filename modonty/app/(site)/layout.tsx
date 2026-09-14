import type { ReactNode } from "react";
import { SiteShell } from "@/app/layout/components/SiteShell";
import { SessionProviderWrapper } from "@/app/layout/components/SessionProviderWrapper";

/**
 * Every modonty page (home, articles, partners list, users…) renders inside modonty's
 * header and footer. Kept free of any request-time read (cookies/headers) so the whole
 * site keeps its static shell — the header must stay in the prerendered HTML.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  // المزوّد هنا لا في الجذر: قرّاء الجلسة كلّهم تحت هذه المجموعة (قائمة الجوّال ·
  // قائمة المستخدم · إعدادات الحساب · شريط التفاعل…). ووضعه هنا يُبقي مجموعة `(pay)`
  // خارج المصادقة تماماً. وهو غير `async` عمداً، فلا شيء ينتظر الطلب.
  return (
    <SessionProviderWrapper>
      <SiteShell>{children}</SiteShell>
    </SessionProviderWrapper>
  );
}
