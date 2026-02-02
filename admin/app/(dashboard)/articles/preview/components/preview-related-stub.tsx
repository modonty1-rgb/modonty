import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2 } from "lucide-react";

export function PreviewRelatedStub() {
  return (
    <section className="my-8 md:my-12" aria-labelledby="related-stub-heading">
      <Card>
        <CardHeader>
          <CardTitle id="related-stub-heading" className="text-xl font-semibold flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            مقالات ذات صلة (معاينة)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            المقالات ذات الصلة تظهر على الموقع الفعلي بعد النشر. أضفها من خطوة «مقالات ذات صلة» في المحرر.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
