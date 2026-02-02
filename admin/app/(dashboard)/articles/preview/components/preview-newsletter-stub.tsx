import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export function PreviewNewsletterStub() {
  return (
    <section className="my-8 md:my-12" aria-labelledby="newsletter-preview-heading">
      <Card>
        <CardHeader>
          <CardTitle id="newsletter-preview-heading" className="text-xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            الاشتراك في النشرة (معاينة)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            نموذج الاشتراك في النشرة يظهر على الموقع الفعلي بعد النشر.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
