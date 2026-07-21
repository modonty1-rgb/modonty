import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin-guard";
import { getClients, getClientsStats, ClientFilters } from "./actions/clients-actions";
import { ClientsHeaderWrapper } from "./components/clients-header-wrapper";
import { ClientsTabs } from "./components/clients-tabs";
import { RegenerateAllSeoButton } from "./components/regenerate-all-seo-button";
import {
  getJbrseoSubscribers,
  getJbrseoSubscriberStats,
  getWelcomeEmailStatuses,
} from "../subscription-tiers/helpers/jbrseo-queries";
import { getTierConfigs } from "../subscription-tiers/actions/tier-actions";
import { getPlatformDefaults } from "../settings/defaults/actions/defaults-actions";
import { expiringThisMonthWhere } from "./segment/segments";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

async function ClientsContent({ filters }: { filters: ClientFilters }) {
  // Authoritative gate BEFORE any data fetch — the proxy is optimistic (trusts the
  // JWT role), so a demoted admin holding a still-valid ADMIN token would slip past
  // it. This fresh DB read stops the fetch, so no client data is ever streamed.
  const gate = await checkAdmin();
  if (gate.status !== "ok") redirect("/login");

  const [clients, stats, signupsRows, signupStats, tiers, defaults, allClientEmails, expiringThisMonth] = await Promise.all([
    getClients(filters),
    getClientsStats(),
    getJbrseoSubscribers(),
    getJbrseoSubscriberStats(),
    getTierConfigs(),
    getPlatformDefaults(),
    // ALL clients (filter-independent) — used to hide already-clients from the
    // jbrseo "to convert" list by matching email.
    db.client.findMany({ select: { id: true, email: true } }),
    // Renewals due this calendar month — money queue (same where as the segment list).
    db.client.count({ where: expiringThisMonthWhere() }),
  ]);

  const clientByEmail: Record<string, string> = {};
  for (const c of allClientEmails) {
    if (c.email) clientByEmail[c.email.trim().toLowerCase()] = c.id;
  }

  const convertedClientIds = signupsRows
    .map((r) => r.convertedToClientId)
    .filter((id): id is string => Boolean(id));
  const emailStatuses = await getWelcomeEmailStatuses(convertedClientIds);

  return (
    <ClientsHeaderWrapper clientCount={clients.length} stats={stats} expiringThisMonth={expiringThisMonth}>
      <div className="mb-3 flex justify-end">
        <RegenerateAllSeoButton clients={clients} />
      </div>
      <ClientsTabs
        clientsCount={clients.length}
        signupsCount={signupStats.total}
        signupsRows={signupsRows}
        emailStatuses={emailStatuses}
        clients={clients}
        clientByEmail={clientByEmail}
        defaultLogoUrl={defaults.LOGO}
        tiers={tiers}
      />
    </ClientsHeaderWrapper>
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    hasArticles?: string;
    createdFrom?: string;
    createdTo?: string;
    minArticleCount?: string;
    maxArticleCount?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: ClientFilters = {
    hasArticles:
      params.hasArticles === "yes"
        ? true
        : params.hasArticles === "no"
          ? false
          : undefined,
    createdFrom: params.createdFrom ? new Date(params.createdFrom) : undefined,
    createdTo: params.createdTo ? new Date(params.createdTo) : undefined,
    minArticleCount: params.minArticleCount ? parseInt(params.minArticleCount) : undefined,
    maxArticleCount: params.maxArticleCount ? parseInt(params.maxArticleCount) : undefined,
  };

  return (
    <div className="">
      <Suspense fallback={<TableSkeleton />}>
        <ClientsContent filters={filters} />
      </Suspense>
    </div>
  );
}
