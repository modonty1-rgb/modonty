import { IconSearch } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";

export function SearchNoQueryState() {
  return (
    <Card className="border-border border-dashed shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <IconSearch className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          اكتب في مربع البحث أعلاه للعثور على مقالات
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
          يمكنك البحث بالعنوان أو مقتطف المقال (حرفين على الأقل)
        </p>
      </CardContent>
    </Card>
  );
}
