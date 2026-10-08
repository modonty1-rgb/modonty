import { notFound } from "next/navigation";
import { Images } from "lucide-react";

import { ClientPageHeader } from "../components/client-page-header";
import { formatMonthParam, riyadhToday } from "../../helpers/dates";
import { canSocial } from "../../helpers/post-permissions";
import { getCalendarClient, getClientGallery } from "../../helpers/queries";
import { requireSocialActor } from "../../helpers/require-social-actor";
import { GalleryClient } from "./components/gallery-client";

/** معرض إبداع العميل (القديم `clients/[slug]/gallery/page.tsx`). */
export default async function SocialGalleryPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;

  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const client = await getCalendarClient(clientId);
  if (!client) notFound();

  const posts = await getClientGallery(client.id);
  const t = riyadhToday();
  const currentMonth = formatMonthParam(t.year, t.month);

  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col bg-background sm:-m-6 sm:h-[calc(100%+3rem)]">
      <ClientPageHeader
        client={client}
        backHref="/social-calendar"
        subtitle={
          <>
            <Images className="h-3 w-3" />
            معرض الإبداع
          </>
        }
      >
        <span className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          <span className="font-bold tabular-nums text-foreground">{posts.length}</span> منشور يحتوي ملفات
        </span>
      </ClientPageHeader>
      <div className="min-h-0 flex-1 overflow-hidden">
        <GalleryClient
          posts={posts}
          clientId={client.id}
          canDelete={canSocial(actor.role, "produce")}
          currentMonth={currentMonth}
        />
      </div>
    </div>
  );
}
