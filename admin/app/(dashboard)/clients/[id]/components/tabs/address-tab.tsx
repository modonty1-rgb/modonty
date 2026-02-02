"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface AddressTabProps {
  client: {
    addressStreet: string | null;
    addressCity: string | null;
    addressCountry: string | null;
    addressPostalCode: string | null;
    addressRegion: string | null;
    addressNeighborhood: string | null;
    addressBuildingNumber: string | null;
    addressAdditionalNumber: string | null;
  };
}

export function AddressTab({ client }: AddressTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Street Address</p>
            </div>
            <p className="text-sm">{client.addressStreet || <span className="text-muted-foreground italic">Not set</span>}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Building Number</p>
            <p className="text-sm font-medium">
              {client.addressBuildingNumber || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Additional Number</p>
            <p className="text-sm font-medium">
              {client.addressAdditionalNumber || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Neighborhood</p>
            <p className="text-sm font-medium">
              {client.addressNeighborhood || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">City</p>
            <p className="text-sm font-medium">
              {client.addressCity || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Region/Province</p>
            <p className="text-sm font-medium">
              {client.addressRegion || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Country</p>
            <p className="text-sm font-medium">
              {client.addressCountry || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Postal Code</p>
            <p className="text-sm font-medium">
              {client.addressPostalCode || <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
