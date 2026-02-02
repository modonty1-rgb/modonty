import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText } from "lucide-react";
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
  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case "BASIC":
        return "border-border bg-muted/50";
      case "STANDARD":
        return "border-border bg-secondary/30";
      case "PRO":
        return "border-primary/30 bg-primary/5";
      case "PREMIUM":
        return "border-primary/50 bg-primary/10";
      default:
        return "border-border bg-card";
    }
  };

  const totalArticles = tiers.reduce((sum, tier) => sum + tier.articleCount, 0);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={getTierColor(tier.tier)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                {!tier.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Clients</span>
                  </div>
                  <span className="font-bold text-2xl text-primary">
                    {tier._count.clients}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Published Articles</span>
                  </div>
                  <span className="font-bold text-2xl text-primary">
                    {tier.articleCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Total Published Articles (All Plans)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Total Published Articles for All Clients</span>
            </div>
            <span className="font-bold text-3xl text-primary">
              {totalArticles}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
