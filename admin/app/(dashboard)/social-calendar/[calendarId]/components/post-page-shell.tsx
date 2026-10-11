import type { ReactNode } from "react";

import type { CalendarInfo } from "../../helpers/queries";
import { ClientPageHeader } from "./client-page-header";

/**
 * هيكل صفحتَي «منشور جديد» و«تعديل» — نفس رأس التقويم (رجوع · شعار العميل واسمه · سطر الصفحة)
 * وبعرض الشاشة كلّها. كان شريطاً من المحتوى القديم (`sub-page-header.tsx`): محشوراً في الوسط داخل
 * إطار، واسم العميل باهتاً على الطرف، والعنوان مكرّراً مع مسار التنقّل (خالد ١١ أكتوبر ٢٠٢٦).
 * الرأس ثابت والمحتوى وحده يمرّر، كالتقويم.
 */
export function PostPageShell({
  calendar,
  backHref,
  subtitle,
  children,
}: {
  calendar: CalendarInfo;
  backHref: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col bg-background sm:-m-6 sm:h-[calc(100%+3rem)]">
      <ClientPageHeader calendar={calendar} subtitle={subtitle} backHref={backHref} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/30 px-4 pt-6 sm:px-6">{children}</main>
    </div>
  );
}
