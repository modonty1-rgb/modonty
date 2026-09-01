import { Skeleton } from "@/components/ui/skeleton";

// يغطّي الشاشات الأربع. لا هيكل عنوان فيه: العنوان والعرض صارا في `layout.tsx`،
// وهو يُرسم فوراً — فرسم هيكلٍ له هنا يعني عنوانين، أحدهما رماديّ تحت الحقيقيّ.
// القاعدة: الهيكل يحاكي ما سيحلّ محلّه بالضبط، لا شيئاً قريباً منه.
export default function ReelsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-72" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-3">
          <Skeleton className="h-28 w-20 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2.5 py-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
