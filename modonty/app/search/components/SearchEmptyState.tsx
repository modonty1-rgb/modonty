import Link from "@/components/link";
import { IconSearch } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <Card className="border-border border-dashed shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <IconSearch className="h-12 w-12" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          لم يتم العثور على نتائج
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          لم نتمكن من العثور على مقالات تطابق بحثك عن &quot;{query}&quot;.
          جرب كلمات أخرى أو امسح البحث.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/search">
            <Button variant="outline">مسح البحث</Button>
          </Link>
          <Link
            href="/categories"
            className="text-sm text-primary underline hover:opacity-80 transition-opacity"
          >
            تصفح الفئات
          </Link>
          <Link
            href="/trending"
            className="text-sm text-primary underline hover:opacity-80 transition-opacity"
          >
            الرائجة
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
