"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeleteClientButton } from "./delete-client-button";
import { getTierDisplayName } from "../../helpers/client-display-utils";

interface ClientHeaderProps {
  client: {
    id: string;
    name: string;
    slug: string;
    logoMedia: {
      url: string;
      altText: string | null;
    } | null;
    subscriptionStatus: string;
    paymentStatus: string;
    subscriptionTier: string | null;
  };
  seoScore?: number;
}

export function ClientHeader({ client, seoScore }: ClientHeaderProps) {
  const tierLabel = client.subscriptionTier
    ? getTierDisplayName(client.subscriptionTier)
    : null;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 py-3 border-b bg-background">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {client.logoMedia?.url ? (
          <Image
            src={client.logoMedia.url}
            alt={client.logoMedia.altText || client.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-contain flex-shrink-0 border"
            sizes="40px"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground text-lg">
            🏢
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{client.name}</h1>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {client.slug}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {client.subscriptionStatus === "ACTIVE" && (
            <Badge
              variant="outline"
              className="text-xs text-green-500 border-green-500/40 bg-green-500/10"
            >
              Active
            </Badge>
          )}
          {client.subscriptionStatus === "EXPIRED" && (
            <Badge
              variant="outline"
              className="text-xs text-red-500 border-red-500/40 bg-red-500/10"
            >
              Expired
            </Badge>
          )}
          {client.paymentStatus === "PAID" && (
            <Badge
              variant="outline"
              className="text-xs text-green-500 border-green-500/40 bg-green-500/10"
            >
              Paid
            </Badge>
          )}
          {client.paymentStatus === "OVERDUE" && (
            <Badge
              variant="outline"
              className="text-xs text-red-500 border-red-500/40 bg-red-500/10"
            >
              Overdue
            </Badge>
          )}
          {tierLabel && (
            <Badge variant="secondary" className="text-xs">
              {tierLabel}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center flex-shrink-0">
        {seoScore !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/30 min-w-[110px]">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  seoScore >= 80
                    ? "bg-green-500"
                    : seoScore >= 60
                      ? "bg-amber-500"
                      : "bg-red-400",
                )}
                style={{ width: `${seoScore}%` }}
              />
            </div>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                seoScore >= 80
                  ? "text-green-500"
                  : seoScore >= 60
                    ? "text-amber-500"
                    : "text-red-400",
              )}
            >
              {seoScore}%
            </span>
          </div>
        )}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">← Back</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/clients/${client.id}/edit`}>✎ Edit</Link>
        </Button>
        <DeleteClientButton clientId={client.id} />
      </div>
    </div>
  );
}
