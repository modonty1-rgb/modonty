"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface BusinessTabProps {
  client: {
    legalName: string | null;
    foundingDate: Date | null;
    industry: {
      id: string;
      name: string;
    } | null;
    organizationType: string | null;
    targetAudience: string | null;
    contentPriorities: string[];
  };
}

export function BusinessTab({ client }: BusinessTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Legal Name</p>
              <p className="text-sm">{client.legalName || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Founding Date</p>
              <p className="text-sm font-medium">
                {client.foundingDate ? format(new Date(client.foundingDate), "MMM d, yyyy") : <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Industry</p>
              <p className="text-sm font-medium">{client.industry?.name || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Organization Type</p>
              <p className="text-sm font-medium">{client.organizationType || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Target Audience</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {client.targetAudience || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Content Priorities</p>
              {client.contentPriorities && client.contentPriorities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.contentPriorities.map((priority, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {priority}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
