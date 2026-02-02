"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Tier {
  value: string;
  name: string;
  price: number;
  articlesPerMonth: number;
  popular?: boolean;
}

interface SubscriptionTierCardsProps {
  selectedTier?: string;
  onSelect: (tier: string) => void;
  tiers?: Tier[];
}

export function SubscriptionTierCards({ selectedTier, onSelect, tiers = [] }: SubscriptionTierCardsProps) {

  if (tiers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading subscription tiers...
      </div>
    );
  }

  return (
    <div className="flex gap-2 w-full">
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier.value;

        return (
          <Card
            key={tier.value}
            className={`cursor-pointer transition-all hover:shadow-sm flex-1 h-12 ${
              isSelected
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(tier.value)}
          >
            <CardContent className="p-2 h-full flex items-center justify-center">
              <div className="flex items-center justify-center gap-2">
                <span className="font-medium text-xs whitespace-nowrap">{tier.name}</span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
