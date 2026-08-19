import Link from "next/link";

import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { Card, CardContent } from "@/components/ui/card";
import { IconMessage } from "@/lib/icons";

interface QuestionCardProps {
  /** Null when the number is not on file — the card falls back to the contact page. */
  whatsappHref: string | null;
}

/** «عندك سؤال قبل تبدأ؟» — the last card, where the reading turns into a conversation. */
export function QuestionCard({ whatsappHref }: QuestionCardProps) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <h2 className="text-xl font-semibold">عندك سؤال قبل تبدأ؟</h2>
        <p className="mt-1.5 text-muted-foreground">
          تواصل معنا مباشرة، أو شوف الباقات والأسعار بكل وضوح.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {whatsappHref ? (
            <CtaTrackedLink
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              label="Trust Page CTA — تواصل واتساب"
              type="BUTTON"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <IconMessage className="h-4 w-4" />
              تواصل عبر واتساب
            </CtaTrackedLink>
          ) : (
            <Link
              href="/contact"
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              تواصل معنا
            </Link>
          )}
          <CtaTrackedLink
            href="https://www.jbrseo.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            label="Trust Page CTA — شوف الباقات (جبر SEO)"
            type="BUTTON"
            className="inline-flex items-center gap-1 rounded-md border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            شوف الباقات <span aria-hidden="true">↗</span>
          </CtaTrackedLink>
        </div>
      </CardContent>
    </Card>
  );
}
