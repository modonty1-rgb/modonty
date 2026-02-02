"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignSummary } from "../helpers/campaign-queries";

interface CampaignsTableProps {
  campaigns: CampaignSummary[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Campaign Performance</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed metrics for each campaign
        </p>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No campaign data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Campaign
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Type
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Impressions
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Clicks
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    CTR
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Conversions
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    CVR
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Cost
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.campaignId}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-foreground">
                          {campaign.campaignName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.campaignId}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2 capitalize">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-muted">
                        {campaign.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {campaign.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {campaign.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {campaign.ctr.toFixed(2)}%
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {campaign.conversions}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {campaign.conversionRate.toFixed(2)}%
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {campaign.cost.toLocaleString()} SAR
                    </td>
                    <td
                      className={`py-3 px-2 text-right font-medium ${
                        campaign.roi > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {campaign.roi.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
