import Link from "@/components/link";
import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CategoryEmptyStateProps {
  categoryName: string;
  searchTerm?: string;
}

export function CategoryEmptyState({ categoryName, searchTerm }: CategoryEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">
          لا توجد مقالات
        </h3>
        
        {searchTerm ? (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            لم نتمكن من العثور على مقالات تطابق بحثك عن &quot;{searchTerm}&quot; في فئة {categoryName}. جرب كلمات بحث مختلفة.
          </p>
        ) : (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            لا توجد مقالات منشورة في فئة {categoryName} حاليًا. تحقق لاحقًا للحصول على محتوى جديد.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/categories">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              تصفح جميع الفئات
            </Button>
          </Link>
          <Link href="/">
            <Button className="gap-2">
              الذهاب إلى الصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
