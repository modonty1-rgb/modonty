"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LegalTabProps {
  client: {
    commercialRegistrationNumber: string | null;
    legalForm: string | null;
    vatID: string | null;
    taxID: string | null;
    licenseNumber: string | null;
    licenseAuthority: string | null;
  };
}

export function LegalTab({ client }: LegalTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saudi Arabia Legal & Registration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Commercial Registration Number (CR)</p>
            <p className="text-sm font-medium font-mono">
              {client.commercialRegistrationNumber || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Legal Form</p>
            <p className="text-sm font-medium">
              {client.legalForm || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">VAT ID (ZATCA)</p>
            <p className="text-sm font-medium font-mono">
              {client.vatID || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tax ID</p>
            <p className="text-sm font-medium font-mono">
              {client.taxID || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">License Number</p>
            <p className="text-sm font-medium">
              {client.licenseNumber || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">License Authority</p>
            <p className="text-sm font-medium">
              {client.licenseAuthority || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
