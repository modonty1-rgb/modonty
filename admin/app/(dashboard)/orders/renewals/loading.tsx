import { Skeleton } from "@/components/ui/skeleton";

export default function RenewalsLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-8" dir="rtl">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
