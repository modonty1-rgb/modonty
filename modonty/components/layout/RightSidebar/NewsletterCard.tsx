import { Card, CardContent } from "@/components/ui/card";
import Link from "@/components/link";
import { Mail, ArrowLeft } from "lucide-react";

export function NewsletterCard() {
  return (
    <Card className="flex-none basis-[26%] min-h-0 overflow-hidden">
      <Link href="/news/subscribe" className="block">
        <CardContent className="p-4 flex flex-col gap-3 group">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
              <Mail className="h-4 w-4" />
            </span>
            <h2 className="text-xs font-semibold text-foreground">النشرة الإخبارية</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            احصل على رؤى وتحديثات أسبوعية في بريدك الإلكتروني
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline">
            اشترك في النشرة
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
