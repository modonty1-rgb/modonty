import Link from "@/components/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, FolderOpen, Building2 } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <FileQuestion className="h-16 w-16 text-muted-foreground" />
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
                  <Home className="h-4 w-4" />
                  الصفحة الرئيسية
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  الفئات
                </Button>
              </Link>
              <Link href="/clients">
                <Button variant="ghost" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  العملاء
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
