"use client";

import Link from "@/components/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function UserProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-16">
        <Card className="max-w-2xl mx-auto border-destructive/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-3xl text-destructive">
              حدث خطأ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">
              عذراً، حدث خطأ أثناء تحميل الملف الشخصي.
            </p>
            
            {process.env.NODE_ENV === "development" && (
              <div className="bg-muted p-4 rounded-md text-left">
                <p className="text-sm font-mono text-destructive">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={reset} variant="default" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                حاول مرة أخرى
              </Button>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  الصفحة الرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
