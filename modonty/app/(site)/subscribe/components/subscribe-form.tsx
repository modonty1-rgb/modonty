"use client";

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconLoading, IconCheckCircle } from "@/lib/icons";

import { useSubscribe } from "../hooks/use-subscribe";

export function SubscribeForm() {
  const { email, setEmail, isSubmitting, error, success, handleSubmit } = useSubscribe();

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          احصل على آخر الأخبار والمقالات مباشرة في بريدك الإلكتروني
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <IconCheckCircle className="h-12 w-12 text-primary" />
            <p className="text-center text-muted-foreground">
              شكراً لك! تم الاشتراك بنجاح. تحقق من بريدك الإلكتروني لتأكيد الاشتراك.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                className="max-md:h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full max-md:h-11">
              {isSubmitting ? (
                <>
                  <IconLoading className="mr-2 h-4 w-4 animate-spin" />
                  جاري الاشتراك...
                </>
              ) : (
                "اشترك الآن"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
