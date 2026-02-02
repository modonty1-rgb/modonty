import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export function PreviewCommentsStub() {
  return (
    <section className="my-8 md:my-12" aria-labelledby="comments-preview-heading">
      <Card>
        <CardHeader>
          <CardTitle id="comments-preview-heading" className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            تعليقات (معاينة)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد تعليقات في المعاينة. التعليقات تظهر على الموقع الفعلي بعد النشر.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
