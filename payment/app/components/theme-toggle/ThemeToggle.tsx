"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * زرّ الوضع الفاتح/الداكن.
 *
 * `mounted` لا زينة: السمة تُقرأ من `localStorage` في المتصفّح، فالخادم لا يعرفها ويرسم
 * أيقونةً قد تخالف ما يراه الزائر — فيومض الزرّ عند التحميل (hydration mismatch).
 * فيُرسم محايداً حتى يعرف.
 *
 * وهدفه ٤٤px (Apple HIG) لا ٢٤: زرٌّ في ترويسة صفحة دفعٍ يُضغط بالإبهام على الجوّال.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? (isDark ? "الوضع الفاتح" : "الوضع الداكن") : "تبديل السمة"}
      title={mounted ? (isDark ? "الوضع الفاتح" : "الوضع الداكن") : undefined}
      className="inline-flex size-11 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
    >
      {mounted ? (
        isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />
      ) : (
        <span className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}
