import { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
  lastUpdated?: string;
}

export function LegalPageLayout({ title, children, lastUpdated }: LegalPageLayoutProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {lastUpdated && (
        <p className="text-sm text-muted-foreground mb-6">
          آخر تحديث: {lastUpdated}
        </p>
      )}
      <div className="space-y-4 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
