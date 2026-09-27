"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Client } from "../types";

interface ClientSelectorProps {
  clients: Client[];
  clientId: string;
  onClientChange: (clientId: string) => void;
  isLoading: boolean;
  /** false on a client-only upload (Clients › Media): «General» belongs to the main library. */
  allowGeneral?: boolean;
}

export function ClientSelector({
  clients,
  clientId,
  onClientChange,
  isLoading,
  allowGeneral = true,
}: ClientSelectorProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label htmlFor="client-select">Client *</Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading clients...
            </div>
          ) : (
            <Select value={clientId} onValueChange={onClientChange}>
              <SelectTrigger id="client-select" className="w-full">
                <SelectValue placeholder="Select a client (required)" />
              </SelectTrigger>
              <SelectContent>
                {allowGeneral && <SelectItem value="none">General — no client (visible to all)</SelectItem>}
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {allowGeneral && (
            <p className="text-xs text-muted-foreground">
              General images appear in all client media pickers. Client images appear only for that client.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
