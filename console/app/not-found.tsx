"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 px-4 py-12"
    >
      <div className="w-full max-w-lg text-center">
        {/* Friendly icon — no error symbols */}
        <div className="relative mx-auto mb-8 w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
            <Compass className="h-14 w-14 text-primary" aria-hidden="true" strokeWidth={1.5} />
          </div>
        </div>

        {/* Friendly heading + description */}
        <h1 className="text-2xl font-bold sm:text-3xl mb-3">
          خلنا نساعدك تلاقي طريقك
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
          الصفحة اللي تبحث عنها قد تكون اتنقلت أو الرابط اتحدّث. ما يخالف —
          إليك أهم الصفحات اللي ممكن تحتاجها.
        </p>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-center sm:items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            رجوع
          </Button>
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              <Home className="h-4 w-4" aria-hidden="true" />
              لوحة التحكم
            </Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-6 border-t">
          <p className="text-xs text-muted-foreground mb-3">روابط سريعة:</p>
          <div className="flex flex-wrap gap-2 justify-center text-sm">
            <Link
              href="/dashboard/profile"
              className="text-primary hover:underline"
            >
              معلومات الشركة
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/dashboard/seo/intake"
              className="text-primary hover:underline"
            >
              معلومات نشاطك
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/dashboard/articles"
              className="text-primary hover:underline"
            >
              المقالات
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/dashboard/media"
              className="text-primary hover:underline"
            >
              الوسائط
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
