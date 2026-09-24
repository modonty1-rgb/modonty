import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * هيكلُ `/industries` و`/industries/[slug]` معاً — الصفحتان ترسمهما `IndustryPageLayout` نفسُها،
 * فالهيكل واحد. قبل ٢٤ سبتمبر ٢٠٢٦ كان هيكلُ الفهرس بطلاً أسود بعرض الشاشة لصفحةٍ لا بطلَ فيها
 * (مقيس: الهيكل عمودٌ واحد، والصفحة ٣٠٠/٥٠١/٣٠٠). والصدفةُ نفسُها من `ThreeColumnLayout`، فلا تنحرف.
 */
export function IndustriesSkeleton() {
  return (
    <ThreeColumnLayout
      right={
        <div className="hidden w-[300px] shrink-0 self-start min-[1240px]:block" aria-hidden>
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
      }
      center={
        <>
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[160px] w-full rounded-lg" />
          ))}
        </>
      }
      left={
        <div className="hidden w-[300px] shrink-0 space-y-4 self-start lg:block" aria-hidden>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
      }
    />
  );
}
