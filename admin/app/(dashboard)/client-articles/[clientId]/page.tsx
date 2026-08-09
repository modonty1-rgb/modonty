import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ClientArticlesDetailTable } from "./components/client-articles-detail-table";
import { getClientSiteDetail } from "./helpers/load-client-detail";

// One client's workspace: everything about the articles that go to THEIR domain.
//
// This is where the work happens (Khalid 2026-08-08 chose a full page over an
// expanding row): write a new article for them, pick their main article, see the
// address each piece lives at, and spot a website that stopped fetching.

export default async function ClientArticlesDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const detail = await getClientSiteDetail(clientId);

  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <div>
        <Link
          href="/client-articles"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          All client sites
        </Link>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">{detail.name}</h1>
          <code dir="ltr" className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
            {detail.articlesBaseUrl || "—"}
          </code>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          {detail.keySuspended ? (
            <span className="rounded-full bg-destructive/10 px-2.5 py-1 font-medium text-destructive">
              Delivery suspended
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600">
              Delivering
            </span>
          )}
          {/* No «Client settings» button here (Khalid 2026-08-08): the client file is one
              click away in its own section, and a second door to it is visual noise on a
              page whose job is the articles. */}
          <Button asChild size="sm">
            <Link href={`/articles/new?clientSite=${detail.id}`}>New article</Link>
          </Button>
        </div>
      </div>

      <ClientArticlesDetailTable
        clientId={detail.id}
        articles={detail.articles}
        canMarkMain={detail.canMarkMain}
      />
    </div>
  );
}
