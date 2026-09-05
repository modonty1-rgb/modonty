import { Skeleton } from "@/components/ui/skeleton";

/** الهيكل يطابق الشكل الحقيقيّ: صفّ عنوانٍ وزرّ، ثم بطاقاتٌ بارتفاع البطاقة نفسها. */
export default function Loading() {
  return (
    <div dir="rtl" className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="ms-auto h-8 w-28 rounded" />
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[124px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
