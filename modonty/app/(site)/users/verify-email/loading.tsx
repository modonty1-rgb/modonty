import { Skeleton } from "@/components/ui/skeleton";

/**
 * تفعيل البريد يتحقّق من رمز على الخادم قبل أن يعرض نتيجته، فالزائر ينتظر على شاشة
 * بيضاء بلا هذا الملف. الهيكل يطابق الصفحة: أيقونة كبيرة، عنوان، سطر شرح، ثم رابط.
 */
export default function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <Skeleton className="mx-auto h-14 w-14 rounded-full" />
        <Skeleton className="mx-auto h-6 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </div>
  );
}
