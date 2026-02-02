import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PreviewBreadcrumbProps {
  clientName: string | null;
  clientId: string | null;
  title: string;
}

export function PreviewBreadcrumb({ clientName, clientId, title }: PreviewBreadcrumbProps) {
  const hasClient = Boolean(clientName && clientId);

  return (
    <nav
      aria-label="تنقل الصفحة"
      className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8"
    >
      <ol
        className="flex items-center gap-2 py-3 text-sm flex-wrap text-muted-foreground"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" className="hover:text-primary transition-colors" itemProp="item">
            <span itemProp="name">الرئيسية</span>
          </Link>
        </li>
        <ChevronLeft className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 rtl:rotate-180" aria-hidden />
        <li className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/clients" className="hover:text-primary transition-colors" itemProp="item">
            <span itemProp="name">العملاء</span>
          </Link>
        </li>
        {hasClient && (
          <>
            <ChevronLeft className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 rtl:rotate-180" aria-hidden />
            <li className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href={`/clients/${clientId}`} className="hover:text-primary transition-colors" itemProp="item">
                <span itemProp="name">{clientName}</span>
              </Link>
            </li>
          </>
        )}
        <ChevronLeft className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 rtl:rotate-180" aria-hidden />
        <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <span itemProp="name">{title}</span>
        </li>
      </ol>
    </nav>
  );
}
