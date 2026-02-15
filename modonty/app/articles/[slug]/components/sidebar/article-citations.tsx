import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";

interface ArticleCitationsProps {
  citations: string[];
}

export function ArticleCitations({ citations }: ArticleCitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <section aria-labelledby="citations-heading">
      <Card className="min-w-0 hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
            <h2 id="citations-heading" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              مصادر
            </h2>
          </div>
          <ul className="space-y-2">
            {citations.map((citation, idx) => (
              <li key={idx}>
                <Link
                  href={citation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/90 transition-colors flex items-center gap-2 break-all"
                >
                  <span className="truncate min-w-0">{citation}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
