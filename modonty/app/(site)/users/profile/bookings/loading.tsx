import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * الهيكل يطابق تخطيط الصفحة: بطاقة الملف الشخصي بترويستها وتبويباتها، ثم صفوف الحجوزات.
 * الأشكال والأحجام مقصودة — الهيكل الذي لا يشبه المحتوى ينتج قفزة في التخطيط عند وصوله.
 */
export default function BookingsLoading() {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-3 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
              <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
