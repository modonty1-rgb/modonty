"use client";

import { Mail } from "lucide-react";

interface SecurityTabProps {
  client: {
    email: string;
  };
}

export function SecurityTab({ client }: SecurityTabProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
          Security
        </span>
      </div>
      <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Email</p>
            </div>
            <a
              href={`mailto:${client.email}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              {client.email}
            </a>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Password is hidden for security reasons. To change the password, use the edit form.</p>
          </div>
      </div>
    </div>
  );
}
