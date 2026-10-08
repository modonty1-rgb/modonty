import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ClientAvatar } from "../../components/client-avatar";
import type { CalendarClient } from "../../helpers/queries";

/**
 * رأس شاشات العميل الكاملة (التقويم · المعرض · الأرشيف) — نفس رأس القديم: رجوع، ثم هويّة
 * العميل وسطر وصف، وعلى الطرف الآخر ما تمرّره الشاشة (إحصاءات، أيقونات تنقّل).
 * اسم العميل رابط لصفحته في Clients.
 */
export function ClientPageHeader({
  client,
  subtitle,
  backHref,
  children,
}: {
  client: CalendarClient;
  subtitle: ReactNode;
  backHref: string;
  children?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-border bg-card">
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            aria-label="رجوع"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-5 w-px shrink-0 bg-border" />
          <div className="flex min-w-0 items-center gap-2.5">
            <ClientAvatar name={client.name} logoUrl={client.logoUrl} />
            <div className="min-w-0 leading-none">
              <Link
                href={`/clients/${client.id}`}
                className="block truncate text-sm font-semibold text-foreground hover:underline"
              >
                {client.name}
              </Link>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">{subtitle}</div>
            </div>
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </header>
  );
}
