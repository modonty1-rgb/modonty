"use client";

import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UTMPerformance } from "../helpers/campaign-queries";

interface UTMTableProps {
  utmData: UTMPerformance[];
}

export function UTMTable({ utmData }: UTMTableProps) {
  const c = ar.campaigns;
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{c.utmAnalysis}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {c.trackBySource}
        </p>
      </CardHeader>
      <CardContent>
        {utmData.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {c.noUtmData}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {c.source}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {c.medium}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {c.campaign}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {c.visits}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {c.conversions}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {c.conversionRate}
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
                    <td className="py-3 px-2 text-end text-foreground">
                      {utm.visits.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-end text-foreground">
                      {utm.conversions}
                    </td>
                    <td className="py-3 px-2 text-end text-foreground">
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
