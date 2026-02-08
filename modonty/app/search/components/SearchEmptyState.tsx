import Link from "@/components/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          لم يتم العثور على نتائج
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          لم نتمكن من العثور على مقالات تطابق بحثك عن &quot;{query}&quot;.
          جرب كلمات أخرى أو امسح البحث.
        </p>
        <Link href="/search">
          <Button variant="outline">مسح البحث</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
