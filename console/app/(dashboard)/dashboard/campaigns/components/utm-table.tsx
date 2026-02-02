"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UTMPerformance } from "../helpers/campaign-queries";

interface UTMTableProps {
  utmData: UTMPerformance[];
}

export function UTMTable({ utmData }: UTMTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">UTM Parameters Analysis</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Track performance by source, medium, and campaign
        </p>
      </CardHeader>
      <CardContent>
        {utmData.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No UTM tracking data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Source
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Medium
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Campaign
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Visits
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Conversions
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {utmData.map((utm, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2 text-foreground">{utm.utmSource}</td>
                    <td className="py-3 px-2 text-foreground">{utm.utmMedium}</td>
                    <td className="py-3 px-2 text-foreground">
                      {utm.utmCampaign}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {utm.visits.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {utm.conversions}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {utm.conversionRate.toFixed(2)}%
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
