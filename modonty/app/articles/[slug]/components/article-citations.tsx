import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ArticleCitationsProps {
  citations: string[];
}

export function ArticleCitations({ citations }: ArticleCitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <section className="my-8 md:my-12" aria-labelledby="citations-heading">
      <h2 id="citations-heading" className="text-xl font-semibold mb-6">مصادر</h2>
      <Card>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {citations.map((citation, idx) => (
              <li key={idx}>
                <a
                  href={citation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                  <span>{citation}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
