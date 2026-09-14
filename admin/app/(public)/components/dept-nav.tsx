"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { departmentOf } from "./playbook-sections";

/**
 * شريط صفحات القسم — يظهر داخل القسم وحده.
 *
 * الشريط الجانبي صار يعرض أسماء الأقسام الأربعة فقط (خالد، ١٢ سبتمبر ٢٠٢٦)، لأن نشر
 * صفحات الأقسام كلّها فيه كان يطوّله إلى ٢٣ سطرًا ويعرض على قارئ المبيعات صفحات
 * التصميم. فصفحات القسم انتقلت إلى هنا: تُرى حين تدخله، وتختفي حين تخرج منه.
 */
export function DeptNav() {
  const pathname = usePathname() ?? "";
  const dept = departmentOf(pathname);
  if (!dept) return null;
  // قسمٌ بلا صفحات فرعية لا يحتاج شريطًا: يعرض «نظرة عامّة» وحدها تشير إلى الصفحة
  // المفتوحة نفسها (خالد، ١٣ سبتمبر ٢٠٢٦). وقع هذا حين طُويت صفحات المبيعات السبع
  // داخل صفحتها، وحين وُلد قسم العمليات بلا صفحات.
  if (dept.items.length === 0) return null;

  const Icon = dept.icon;
  return (
    <nav aria-label={`صفحات قسم ${dept.title}`} className="rounded-xl border bg-card p-2.5">
      <div className="flex items-center gap-2 px-1.5 pb-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[13px] font-bold">قسم {dept.title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Link
          href={dept.href}
          className={cn(
            "rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors",
            pathname === dept.href
              ? "border-primary bg-primary/10 font-bold text-primary"
              : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          نظرة عامّة
        </Link>
        {dept.items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors",
              pathname === item.href
                ? "border-primary bg-primary/10 font-bold text-primary"
                : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
