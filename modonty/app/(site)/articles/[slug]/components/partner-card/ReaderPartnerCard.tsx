import { getViewer } from "@/app/(site)/articles/[slug]/helpers/get-viewer";
import { getPendingFaqsForCurrentUser } from "@/app/(site)/articles/[slug]/data/get-pending-faqs-for-current-user";
import { PartnerCard } from "./PartnerCard";

interface ReaderPartnerCardProps {
  client: Parameters<typeof PartnerCard>[0]["client"];
  articleId: string;
  articleTitle: string;
  clientId: string | null;
  cta: { mode: "NONE" | "FORM" | "LINK"; label?: string | null; url?: string | null };
}

/** The desktop partner card — an island for the same reason as its phone counterpart: the ask
 *  form prefills from the session and lists the questions this reader is already waiting on. */
export async function ReaderPartnerCard({
  client,
  articleId,
  articleTitle,
  clientId,
  cta,
}: ReaderPartnerCardProps) {
  const { userId, box } = await getViewer();
  const pendingFaqs = userId ? await getPendingFaqsForCurrentUser(articleId) : [];

  return (
    <PartnerCard
      client={client}
      askClientProps={{ articleId, clientId, articleTitle, user: box, pendingFaqs }}
      cta={{ ...cta, articleId, source: "article_card", user: box }}
    />
  );
}
