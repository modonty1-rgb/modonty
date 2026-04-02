import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Star } from "lucide-react";
import { SubscriptionTier } from "@prisma/client";

interface TierConfigWithCount {
  id: string;
  tier: SubscriptionTier;
  name: string;
  articlesPerMonth: number;
  price: number;
  isActive: boolean;
  isPopular: boolean;
  description: string | null;
  _count: {
    clients: number;
  };
  articleCount: number;
}

interface TierCardsProps {
  tiers: TierConfigWithCount[];
}

export function TierCards({ tiers }: TierCardsProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(price);

  const getTierStyle = (tier: SubscriptionTier, isPopular: boolean) => {
    if (isPopular) return "border-primary bg-primary/5 ring-1 ring-primary/20";
    switch (tier) {
      case "PREMIUM": return "border-primary/40 bg-primary/5";
      case "PRO": return "border-primary/20 bg-primary/[0.02]";
      default: return "border-border";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiers.map((tier) => (
        <Card key={tier.id} className={getTierStyle(tier.tier, tier.isPopular)}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <p className="text-2xl font-bold mt-1">
                    {formatPrice(tier.price)}
                    <span className="text-sm font-normal text-muted-foreground"> / year</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {tier.isPopular && (
                    <Badge className="gap-1">
                      <Star className="h-3 w-3" />
                      Recommended
                    </Badge>
                  )}
                  {!tier.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Articles / month
                  </span>
                  <span className="font-semibold">{tier.articlesPerMonth}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Clients
                  </span>
                  <span className="font-semibold">{tier._count.clients}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Published
                  </span>
                  <span className="font-semibold">{tier.articleCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
