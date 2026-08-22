import { getViewer } from "@/app/(site)/articles/[slug]/helpers/get-viewer";
import { getPendingFaqsForCurrentUser } from "@/app/(site)/articles/[slug]/data/get-pending-faqs-for-current-user";
import { PartnerDetailsMobile } from "./PartnerDetailsMobile";

interface ReaderPartnerDetailsProps {
  client: Parameters<typeof PartnerDetailsMobile>[0]["client"];
  articleId: string;
  articleTitle: string;
  clientId: string | null;
}

/**
 * The partner's channels and «اسأل الشريك», as a request-time island.
 *
 * The channels are the same for everyone; two things are not — the name and email that prefill
 * the question form, and the questions this reader has already sent and is waiting on. Both come
 * from the session, so they stream instead of blocking the article's static shell.
 */
export async function ReaderPartnerDetails({
  client,
  articleId,
  articleTitle,
  clientId,
}: ReaderPartnerDetailsProps) {
  const { userId, box } = await getViewer();
  const pendingFaqs = userId ? await getPendingFaqsForCurrentUser(articleId) : [];

  return (
    <PartnerDetailsMobile
      client={client}
      askClientProps={{ articleId, clientId, articleTitle, user: box, pendingFaqs }}
    />
  );
}
