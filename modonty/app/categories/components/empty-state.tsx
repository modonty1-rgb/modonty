import Link from "@/components/link";
import { Search, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchTerm?: string;
}

export function EmptyState({ searchTerm }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">
          لم نجد نتائج
        </h3>
        
        {searchTerm ? (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            لم نتمكن من العثور على فئات تطابق بحثك عن &quot;{searchTerm}&quot;. جرب كلمات بحث مختلفة أو امسح البحث.
          </p>
        ) : (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            لا توجد فئات تطابق المعايير المحددة. جرب تغيير خيارات الفلترة.
          </p>
        )}

        <Link href="/categories">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
