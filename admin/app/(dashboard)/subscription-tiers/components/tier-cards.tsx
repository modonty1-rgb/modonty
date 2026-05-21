"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Star, Newspaper, Pencil } from "lucide-react";
import { SubscriptionTier } from "@prisma/client";
import { resolvePricing, formatPrice } from "../lib/pricing";

interface TierConfigWithCount {
  id: string;
  tier: SubscriptionTier;
  name: string;
  articlesPerMonth: number;
  price: number;
  isActive: boolean;
  isPopular: boolean;
  description: string | null;
  pricing: unknown;
  _count: {
    clients: number;
  };
  articleCount: number;
}

interface Props {
  tiers: TierConfigWithCount[];
  totalClients: number;
}

export function TierCards({ tiers, totalClients }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiers.map((tier) => {
        const p = resolvePricing(tier.name, tier.pricing);
        const adoptionPct =
          totalClients > 0 ? Math.round((tier._count.clients / totalClients) * 100) : 0;

        const cardTone = tier.isPopular
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : tier.isActive
            ? "border-border bg-card"
            : "border-border bg-muted/20 opacity-60";

        return (
          <div
            key={tier.id}
            className={`rounded-xl border ${cardTone} p-4 flex flex-col gap-4 transition-shadow hover:shadow-md`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 min-h-[36px]">
              <h3 className="font-semibold text-lg leading-tight">{tier.name}</h3>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {tier.isPopular && (
                  <Badge className="gap-1 text-[10px]">
                    <Star className="h-3 w-3" />
                    Recommended
                  </Badge>
                )}
                {!tier.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
              </div>
            </div>

            {/* Dual currency pricing */}
            <div className="space-y-2 py-2 border-y">
              <PriceRow flag="🇸🇦" label="Saudi" amount={p.SA.yr} currency="SA" />
              <PriceRow flag="🇪🇬" label="Egypt" amount={p.EG.yr} currency="EG" />
              <p className="text-[10px] text-muted-foreground mt-1">
                Monthly equivalent on annual plan
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <Stat
                icon={<Newspaper className="h-3.5 w-3.5" />}
                label="Articles / month"
                value={tier.articlesPerMonth}
              />
              <Stat
                icon={<Users className="h-3.5 w-3.5" />}
                label="Clients"
                value={tier._count.clients}
                trail={adoptionPct > 0 ? `${adoptionPct}%` : undefined}
              />
              <Stat
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Published articles"
                value={tier.articleCount}
              />
            </div>

            {/* Adoption progress */}
            {totalClients > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Adoption</span>
                  <span className="font-semibold tabular-nums">{adoptionPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tier.isPopular ? "bg-primary" : "bg-violet-500/60"
                    }`}
                    style={{ width: `${Math.max(adoptionPct, 2)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Edit action — full-width inside the card */}
            <Link href={`/subscription-tiers/${tier.id}/edit`} className="mt-auto">
              <Button size="sm" variant="outline" className="w-full gap-2">
                <Pencil className="h-3.5 w-3.5" />
                Edit plan
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function PriceRow({
  flag,
  label,
  amount,
  currency,
}: {
  flag: string;
  label: string;
  amount: number;
  currency: "SA" | "EG";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-base leading-none">{flag}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="font-bold tabular-nums text-end">
        {formatPrice(amount, currency)}
        <span className="text-[10px] font-normal text-muted-foreground ms-1">/ mo</span>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  trail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trail?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="font-semibold tabular-nums">{value}</span>
        {trail && <span className="text-muted-foreground tabular-nums">({trail})</span>}
      </span>
    </div>
  );
}
