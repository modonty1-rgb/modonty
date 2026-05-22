import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  arabicDescription?: string;
}

export function SettingsPageHeader({ title, description, arabicDescription }: Props) {
  return (
    <>
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <Link href="/settings" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" />
          Settings
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
        )}
        {arabicDescription && (
          <p className="text-sm text-muted-foreground/80 mt-1 max-w-2xl" dir="rtl">
            {arabicDescription}
          </p>
        )}
      </header>
    </>
  );
}
