"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadWithDetails } from "../helpers/lead-queries";

interface LeadsTableProps {
  leads: LeadWithDetails[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredLeads =
    filter === "all"
      ? leads
      : leads.filter((l) => l.qualificationLevel?.toLowerCase() === filter);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Leads Overview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredLeads.length} leads
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "hot" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("hot")}
            >
              Hot
            </Button>
            <Button
              variant={filter === "warm" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("warm")}
            >
              Warm
            </Button>
            <Button
              variant={filter === "cold" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("cold")}
            >
              Cold
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLeads.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No leads found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Contact
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Level
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Score
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Pages
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Time (min)
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Interactions
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-foreground">
                    Conversions
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-foreground">
                    Last Active
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
                          {lead.user?.name || lead.email || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.user?.email || lead.email || lead.phone || "No contact"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.qualificationLevel === "HOT"
                            ? "bg-red-100 text-red-800"
                            : lead.qualificationLevel === "WARM"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {lead.qualificationLevel || "UNQUALIFIED"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-medium text-foreground">
                        {lead.engagementScore}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {lead.pagesViewed}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {(lead.totalTimeSpent / 60).toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {lead.interactions}
                    </td>
                    <td className="py-3 px-2 text-right text-foreground">
                      {lead.conversions}
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {lead.lastActivityAt
                        ? new Date(lead.lastActivityAt).toLocaleDateString()
                        : "Never"}
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
