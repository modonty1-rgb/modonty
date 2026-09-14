"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelRightClose, PanelRightOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { DEPARTMENTS, SHARED } from "./playbook-sections";

/**
 * السايدبار = الأقسام الأربعة كما ينطق بها الفريق (خالد، ١١ سبتمبر ٢٠٢٦).
 * «ما هي مدونتي» و«كيف نتكلّم» فوق الأقسام لأن كل قسم يحتاجهما، وحصرهما في واحد يجعل
 * الباقين يتجاهلونهما.
 */

/**
 * قائمة جانبية واحدة: صفحات الـPlaybook فقط.
 *
 * حُذفت منها لوحة القرار (بنود نصّية لا تفتح شيئًا) ومراسي الأقسام داخل الصفحة
 * (خالد، ١١ سبتمبر ٢٠٢٦: «ما أحتاج anchors في السايدبار عشان ما أتوه»).
 * كل بند هنا رابط يعمل، وبند واحد يضيء في كل صفحة.
 */
export function HubSidebar() {
  const pathname = usePathname();
  const isPlaybook = pathname === "/playbook" || pathname?.startsWith("/playbook/");
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  /**
   * «/playbook» جذر القسم كلّه، فلو عومل معاملة البقية لأضاء مع كل صفحة داخله
   * (خالد، ١١ سبتمبر ٢٠٢٦: «ليش اثنين highlighted؟»). الجذر يُطابق تمامًا، وما دونه يقبل أبناءه.
   */
  const isActive = (href: string) =>
    href === "/playbook" ? pathname === href : pathname === href || pathname?.startsWith(href + "/");
  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors",
      isActive(href)
        ? "bg-primary text-primary-foreground"
        : "text-foreground/70 hover:bg-muted hover:text-foreground",
    );
  const navigation = () => (
    <nav className="space-y-5 p-4">
            <div>
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">الأساس</p>
              <div className="space-y-0.5">
                {SHARED.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className={linkClass(href)}>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/*
              أسماء الأقسام وحدها — صفحاتها انتقلت إلى شريط داخل القسم نفسه
              (خالد، ١٢ سبتمبر ٢٠٢٦). نشرُها هنا كان يطوّل الشريط إلى ٢٣ سطرًا،
              ويعرض على قارئ المبيعات صفحات التصميم وهو لا يفتحها.
            */}
            <div>
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">الأقسام</p>
              <div className="space-y-0.5">
                {DEPARTMENTS.map((dept) => (
                  <Link key={dept.title} href={dept.href} className={linkClass(dept.href)}>
                    <dept.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">قسم {dept.title}</span>
                  </Link>
                ))}
              </div>
            </div>
    </nav>
  );
  return (
    <>
      <button
        type="button"
        onClick={() => setDesktopCollapsed((value) => !value)}
        aria-label={desktopCollapsed ? "فتح القائمة الجانبية" : "طي القائمة الجانبية"}
        aria-expanded={!desktopCollapsed}
        className={cn(
          "fixed top-[62px] z-40 hidden h-9 w-9 place-items-center rounded-lg border bg-card text-foreground shadow-sm transition-[right,background-color] hover:bg-muted lg:grid",
          desktopCollapsed ? "right-4" : "right-[276px]",
        )}
      >
        {desktopCollapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label={mobileOpen ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية"}
        aria-expanded={mobileOpen}
        className="fixed right-4 top-[62px] z-50 grid h-9 w-9 place-items-center rounded-lg border bg-card text-foreground shadow-sm transition-colors hover:bg-muted lg:hidden"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      </button>
      <aside
        className={cn(
          "sticky top-[49px] hidden h-[calc(100vh-49px)] w-[260px] shrink-0 overflow-y-auto border-e bg-card/40 backdrop-blur-sm lg:block",
          desktopCollapsed && "lg:hidden",
        )}
      >
        {navigation()}
      </aside>
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="إغلاق القائمة الجانبية"
            className="fixed inset-0 z-40 cursor-default bg-background/55 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed bottom-0 right-0 top-[49px] z-50 w-[min(280px,calc(100vw-2rem))] overflow-y-auto border-e bg-card shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">التنقل</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="إغلاق القائمة الجانبية"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {navigation()}
          </aside>
        </>
      )}
    </>
  );
}
