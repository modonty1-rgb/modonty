import { Skeleton } from "@/components/ui/skeleton";

/**
 * هيكلُ الصفحات القانونيّة الخمس (`/terms` · `/legal/privacy-policy` · `cookie-policy` ·
 * `copyright-policy` · `user-agreement`) — صدفتُها واحدة: `max-w-4xl` · فتات · عنوان · تاريخ · أقسام نصّ.
 *
 * مصدرٌ واحد لـ`loading.tsx` ولـ`<Suspense fallback>` في كل صفحة: حتى ٢٤ سبتمبر ٢٠٢٦ كان لكلّ
 * صفحةٍ هيكلان مختلفان — `loading.tsx` بأربعة أقسام، والـfallback بعنوانٍ وسطرين — فالزائر الداخل
 * برابطٍ مباشر يرى صفحةً بطول ١٥٠px يقفز تحتها الفوتر، والداخل بنقرةٍ يرى غيرها.
 */
export function LegalPageSkeleton({ crumbs = 2 }: { crumbs?: 2 | 3 }) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8" aria-hidden>
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        {crumbs === 3 ? (
          <>
            <Skeleton className="h-4 w-3" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : null}
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="mb-6 h-9 w-56" />
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
