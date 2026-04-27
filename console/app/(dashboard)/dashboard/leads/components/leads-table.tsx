"use client";

import { useState } from "react";
import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadWithDetails } from "../helpers/lead-queries";

interface LeadsTableProps {
  leads: LeadWithDetails[];
}

function levelLabel(level: string | null): string {
  const l = ar.leads;
  if (level === "HOT") return l.hot;
  if (level === "WARM") return l.warm;
  if (level === "COLD") return l.cold;
  return l.unqualified;
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const l = ar.leads;
  const [filter, setFilter] = useState<string>("all");

  const filteredLeads =
    filter === "all"
      ? leads
      : leads.filter((lead) => lead.qualificationLevel?.toLowerCase() === filter);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{l.leadsOverview}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredLeads.length} {l.leadsCount}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {l.all}
            </Button>
            <Button
              variant={filter === "hot" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("hot")}
            >
              {l.hot}
            </Button>
            <Button
              variant={filter === "warm" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("warm")}
            >
              {l.warm}
            </Button>
            <Button
              variant={filter === "cold" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("cold")}
            >
              {l.cold}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLeads.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-sm font-medium text-foreground">{l.noLeadsFound}</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">{l.noLeadsHint}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {l.contact}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {l.level}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {l.score}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {l.pages}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {l.timeMin}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {l.interactions}
                  </th>
                  <th className="text-end py-3 px-2 font-medium text-foreground">
                    {l.conversions}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-foreground">
                    {l.lastActive}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {lead.user?.name || lead.email || l.anonymous}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.user?.email || lead.email || lead.phone || l.noContact}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.qualificationLevel === "HOT"
                            ? "bg-destructive/10 text-destructive"
                            : lead.qualificationLevel === "WARM"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {levelLabel(lead.qualificationLevel)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-end">
                      <span className="font-medium text-foreground">
                        {lead.engagementScore}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-end text-foreground">
                      {lead.pagesViewed}
                    </td>
                    <td className="py-3 px-2 text-end text-foreground">
                      {(lead.totalTimeSpent / 60).toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-end text-foreground">
                      {lead.interactions}
                    </td>
                    <td className="py-3 px-2 text-end text-foreground">
                      {lead.conversions}
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {lead.lastActivityAt
                        ? new Date(lead.lastActivityAt).toLocaleDateString("ar-SA")
                        : l.never}
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
