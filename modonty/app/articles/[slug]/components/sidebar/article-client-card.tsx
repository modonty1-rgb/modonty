import Link from "@/components/link";
import { Card } from "@/components/ui/card";
import { Building2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { AskClientDialog } from "../ask-client-dialog";

interface PendingFaq {
  id: string;
  question: string;
  createdAt: Date;
}

interface ArticleClientCardProps {
  client: {
    id: string;
    name: string;
    slug: string;
    url?: string | null;
    description?: string | null;
    logoMedia?: { url: string } | null;
    ogImageMedia?: { url: string } | null;
  };
  /** When provided, Ask Client block is rendered inside the card */
  askClientProps?: {
    articleId: string;
    clientId: string;
    articleTitle?: string;
    user: { name: string | null; email: string | null } | null;
    pendingFaqs?: PendingFaq[];
  };
}

export function ArticleClientCard({ client, askClientProps }: ArticleClientCardProps) {
  const logoUrl = client.logoMedia?.url ?? null;
  const heroUrl = client.ogImageMedia?.url ?? null;
  const description = client.description?.trim();
  const hasDescription = description && description.length > 0;

  return (
    <Card className="min-w-0 overflow-hidden">
      {/* Media: hero with logo in bottom-right (circle); or logo/placeholder centered */}
      <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center shrink-0 relative overflow-hidden">
        {heroUrl && (
          <>
            <div className="absolute inset-0">
              <Image
                src={heroUrl}
                alt=""
                fill
                className="object-cover"
                sizes="240px"
              />
            </div>
            {/* Bottom scrim so logo stays legible on any hero */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[1]" />
          </>
        )}
        {logoUrl ? (
          heroUrl ? (
            <div className="absolute bottom-3 right-3 z-10 w-14 h-14 rounded-full overflow-hidden ring-2 ring-background shadow-lg bg-background flex items-center justify-center shrink-0">
              <Image
                src={logoUrl}
                alt={client.name}
                width={56}
                height={56}
                className="object-contain p-1.5"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden bg-background ring-2 ring-border shadow-sm shrink-0">
              <Image
                src={logoUrl}
                alt={client.name}
                fill
                className="object-contain p-3"
                sizes="80px"
              />
            </div>
          )
        ) : !heroUrl ? (
          <Building2 className="h-12 w-12 text-muted-foreground relative z-10" />
        ) : null}
      </div>
      {/* Heading, description */}
      <div className={`p-4 flex flex-col gap-2 ${!askClientProps ? "pb-4" : ""}`}>
        <h2 className="font-semibold text-base leading-tight">
          <Link
            href={`/clients/${client.slug}`}
            className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
          >
            {client.name}
            <ChevronLeft className="h-4 w-4 shrink-0 ltr:rotate-180" aria-hidden />
          </Link>
        </h2>
        {hasDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {askClientProps && (
        <div className="px-4 pb-4">
          <AskClientDialog
            articleId={askClientProps.articleId}
            clientId={askClientProps.clientId}
            articleTitle={askClientProps.articleTitle}
            user={askClientProps.user}
            pendingFaqs={askClientProps.pendingFaqs}
            embedInCard
          />
        </div>
      )}
    </Card>
  );
}
