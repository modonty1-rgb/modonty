import { Skeleton } from "@/components/ui/skeleton";

/** يطابق الشكل الحقيقي: عنوان وسطر عدّ، ثم مجموعتان كلٌّ منهما بطاقة فيها صفوف. */
export default function Loading() {
  return (
    <div dir="rtl" className="space-y-4 p-4 sm:p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-52" />
      </div>

      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
              <Skeleton className="h-8 w-40 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
