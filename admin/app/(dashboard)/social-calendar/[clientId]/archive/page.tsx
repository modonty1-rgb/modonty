import { notFound } from "next/navigation";
import { Archive } from "lucide-react";

import { ClientPageHeader } from "../components/client-page-header";
import { formatMonthParam, riyadhToday } from "../../helpers/dates";
import { canSocial } from "../../helpers/post-permissions";
import { getArchivedPosts, getCalendarClient } from "../../helpers/queries";
import { requireSocialActor } from "../../helpers/require-social-actor";
import { ArchiveList } from "./components/archive-list";

/** أرشيف منشورات العميل (القديم `clients/[slug]/archive/page.tsx`). */
export default async function SocialArchivePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;

  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const client = await getCalendarClient(clientId);
  if (!client) notFound();

  const posts = await getArchivedPosts(client.id);
  const t = riyadhToday();

  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col bg-background sm:-m-6 sm:h-[calc(100%+3rem)]">
      <ClientPageHeader
        client={client}
        backHref={`/social-calendar/${client.id}/${formatMonthParam(t.year, t.month)}`}
        subtitle={
          <>
            <Archive className="h-3 w-3" />
            الأرشيف
          </>
        }
      >
        <span className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          <span className="font-bold tabular-nums text-foreground">{posts.length}</span> منشور مؤرشف
        </span>
      </ClientPageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ArchiveList posts={posts} clientId={client.id} canRestore={canSocial(actor.role, "archive")} />
      </div>
    </div>
  );
}
