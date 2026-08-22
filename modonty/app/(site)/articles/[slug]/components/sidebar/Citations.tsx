import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { IconRead, IconExternal } from "@/lib/icons";

interface ArticleCitationsProps {
  citations: string[];
}

export function ArticleCitations({ citations }: ArticleCitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <section aria-labelledby="citations-heading">
      <Card className="min-w-0 hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col gap-4">
          {/* `data-section-head`: the phone wrapper's bar already says «مصادر» — see MobileSection. */}
          <div data-section-head className="flex items-center gap-2">
            <IconRead className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                  className="flex max-lg:min-h-11 items-center gap-2 break-all max-lg:py-1 text-sm text-primary transition-colors hover:text-primary/90"
                >
                  <span className="truncate min-w-0">{citation}</span>
                  <IconExternal className="h-3.5 w-3.5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
