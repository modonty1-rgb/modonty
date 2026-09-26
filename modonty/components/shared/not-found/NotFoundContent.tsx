import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconFileQuestion, IconHome, IconFolder } from "@/lib/icons";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";

/**
 * The not-found message itself, with no chrome around it. Two callers: `app/not-found.tsx`
 * (unmatched URLs — the root layout has no chrome, so it wraps this in `SiteShell`) and
 * `app/(site)/not-found.tsx` (a `notFound()` from any modonty page — the `(site)` layout has
 * ALREADY mounted `SiteShell`, and wrapping it again drew two headers, two bottom bars and two
 * footers; measured on `/modonty/unknown-x`, 26 Sep 2026).
 */
export function NotFoundContent() {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <IconFileQuestion className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">الصفحة غير موجودة</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </p>
            <p className="text-sm text-muted-foreground">
              يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/">
                <Button variant="default" className="gap-2">
                  <IconHome className="h-4 w-4" />
                  الصفحة الرئيسية
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" className="gap-2">
                  <IconFolder className="h-4 w-4" />
                  الفئات
                </Button>
              </Link>
              <Link href="/clients">
                <Button variant="ghost" className="gap-2">
                  <ModontyPartnerMark className="h-4 w-4" />
                  الشركاء
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
