import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { BRAND_AR, SAUDI_BUSINESS_VERIFY_URL } from "@/constants";
import { messages, fill } from "@/lib/i18n/messages";
import { IconFileCheck, IconExternal } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

import type { LegalFact } from "../../helpers/build-legal-facts";

const text = messages.trust.record;

interface RecordCardProps {
  certificateSrc: string;
  legal: LegalEntityDisplay;
  facts: LegalFact[];
}

/** The commercial-registry card: the certificate image beside the rows it certifies. */
export function RecordCard({ certificateSrc, legal, facts }: RecordCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title={text.title} icon={IconFileCheck} />
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <figure className="m-0">
            <a href={certificateSrc} target="_blank" rel="noopener noreferrer" className="block">
              <OptimizedImage
                media={asMedia(certificateSrc)}
                alt={[
                  text.certificateAlt,
                  legal.legalName,
                  legal.unifiedNumber &&
                    fill(text.certificateAltUnified, { number: legal.unifiedNumber }),
                  text.certificateAltMinistry,
                ]
                  .filter(Boolean)
                  .join(" — ")}
                width={2573}
                height={1818}
                sizes="(max-width: 768px) 100vw, 520px"
                // No preload: the docs list "above the fold, typically the hero image"
                // as the condition (image.md:279-281), and this certificate sits far
                // below it. The banner above already holds the page's one preload.
                loading="lazy"
                className="h-auto w-full rounded-lg border border-border"
              />
            </a>
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {text.caption}
            </figcaption>
          </figure>

          <div>
            {/* Nothing on file yet → no empty bordered box, and no "verify it yourself"
                pointing at a number that is not there. */}
            {facts.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {facts.map((f) => (
                  <li
                    key={f.k}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span className="text-muted-foreground">{f.k}</span>
                    <span
                      className={cn(
                        "text-end font-semibold",
                        f.ltr && "[direction:ltr]",
                        f.active && "text-green-600"
                      )}
                    >
                      {f.active && "● "}
                      {f.v}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {legal.cr && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="font-semibold">{text.verifyYourself}</span>
                <a
                  href={SAUDI_BUSINESS_VERIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {text.verifyLink}
                  <IconExternal className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {legal.legalName && (
              <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                {text.umbrellaLead}{" "}
                <span className="font-semibold text-foreground">{BRAND_AR}</span>{" "}
                {text.umbrellaMid}{" "}
                <span className="font-semibold text-foreground">{legal.legalName}</span>{" "}
                {text.umbrellaTail}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
