"use client";

import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, CheckCircle2, XCircle, Star } from "lucide-react";
import Link from "next/link";
import { SubscriptionTier } from "@prisma/client";

interface TierConfig {
  id: string;
  tier: SubscriptionTier;
  name: string;
  articlesPerMonth: number;
  price: number;
  isActive: boolean;
  isPopular: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    clients: number;
  };
}

interface TierTableProps {
  tiers: TierConfig[];
}

export function TierTable({ tiers }: TierTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  return (
    <DataTable
      data={tiers}
      columns={[
        {
          key: "tier",
          header: "Tier",
          render: (tier) => (
            <div className="flex items-center gap-2">
              <span className="font-medium">{tier.name}</span>
              {tier.isPopular && (
                <Badge variant="default" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          ),
        },
        {
          key: "articlesPerMonth",
          header: "Articles/Month",
          render: (tier) => (
            <span className="font-medium">{tier.articlesPerMonth}</span>
          ),
        },
        {
          key: "price",
          header: "Price (SAR/year)",
          render: (tier) => (
            <span className="font-medium">{formatPrice(tier.price)}</span>
          ),
        },
        {
          key: "clients",
          header: "Clients",
          render: (tier) => (
            <span className="font-medium">{tier._count?.clients || 0}</span>
          ),
        },
        {
          key: "isActive",
          header: "Status",
          render: (tier) => (
            <Badge variant={tier.isActive ? "default" : "secondary"}>
              {tier.isActive ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          ),
        },
        {
          key: "actions",
          header: "Actions",
          render: (tier) => (
            <Link href={`/subscription-tiers/${tier.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
          ),
        },
      ]}
      searchKey="name"
    />
  );
}
