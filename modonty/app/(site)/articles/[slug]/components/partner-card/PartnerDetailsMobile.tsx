import { IconPhone, IconExternal } from "@/lib/icons";
import { AskClientDialog } from "@/components/client/ask-client-dialog";
import { socialIconFor, type SocialIcon } from "../../helpers/social-icon-for";

interface PartnerDetailsMobileProps {
  client: {
    id: string;
    name: string;
    slug: string;
    url?: string | null;
    phone?: string | null;
    sameAs?: string[];
  };
  askClientProps?: {
    articleId: string;
    clientId: string | null;
    articleTitle?: string;
    user?: { name: string | null; email: string | null } | null;
    pendingFaqs?: { id: string; question: string; createdAt: Date }[];
  };
}

/**
 * What opens under the partner row on a phone — and ONLY what the row does not already say
 * (Khalid, 21 Aug).
 *
 * The row above carries the logo, the name, the ✓, the city and what the partner does. Putting
 * the full card behind it repeated all five and made the reader read the same partner twice in
 * one gesture. What is genuinely new here is the ways to reach them — their channels, their
 * number, their site — and the one thing only this page offers: asking them about this article.
 *
 * Booking is deliberately absent: it sits in the bottom bar, on screen the whole time.
 */
export function PartnerDetailsMobile({ client, askClientProps }: PartnerDetailsMobileProps) {
  const social = (client.sameAs ?? [])
    .map((url) => ({ url, meta: socialIconFor(url) }))
    .filter((s): s is { url: string; meta: SocialIcon } => Boolean(s.meta));

  const hasPhone = Boolean(client.phone?.trim());
  const hasSite = Boolean(client.url?.trim());
  const canAsk = Boolean(askClientProps?.clientId);

  if (!hasPhone && !hasSite && social.length === 0 && !canAsk) return null;

  const chip =
    "grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground active:bg-muted active:text-foreground motion-safe:active:scale-95";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(hasPhone || hasSite || social.length > 0) && (
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="تواصل ومتابعة">
          {hasPhone && (
            <a href={`tel:${client.phone}`} aria-label="اتصال" className={chip}>
              <IconPhone className="h-4 w-4" />
            </a>
          )}
          {hasSite && (
            <a
              href={client.url!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`موقع ${client.name}`}
              className={chip}
            >
              <IconExternal className="h-4 w-4" />
            </a>
          )}
          {(hasPhone || hasSite) && social.length > 0 && <span className="mx-1 h-5 w-px bg-border" />}
          {social.map(({ url, meta: { icon: Icon, label } }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={chip}>
              <Icon className="h-4 w-4" aria-hidden />
            </a>
          ))}
        </nav>
      )}

      {canAsk && askClientProps && (
        <div className="ms-auto">
          <AskClientDialog
            articleId={askClientProps.articleId}
            clientId={askClientProps.clientId!}
            clientName={client.name}
            articleTitle={askClientProps.articleTitle}
            user={askClientProps.user ?? null}
            pendingFaqs={askClientProps.pendingFaqs}
            triggerOnly
            triggerClassName="w-auto h-9 px-3 text-[13px] bg-transparent border-border text-foreground font-semibold hover:bg-muted/60 hover:border-border shadow-none"
          />
        </div>
      )}
    </div>
  );
}
