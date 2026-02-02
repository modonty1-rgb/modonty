"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, Copy } from "lucide-react";

interface ClientContactProps {
  client: {
    name: string;
    url?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

export function ClientContact({ client }: ClientContactProps) {
  const hasContactInfo = client.url || client.email || client.phone;

  if (!hasContactInfo) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>معلومات الاتصال</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {client.url && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">الموقع الإلكتروني</p>
              <a
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {client.url}
              </a>
            </div>
          </div>
        )}

        {client.email && (
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">البريد الإلكتروني</p>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`mailto:${client.email}`}
                  className="text-primary hover:underline break-all"
                >
                  {client.email}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(client.email!);
                  }}
                  aria-label="نسخ البريد الإلكتروني"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {client.phone && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">رقم الهاتف</p>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`tel:${client.phone}`}
                  className="text-primary hover:underline"
                  dir="ltr"
                >
                  {client.phone}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => {
                    navigator.clipboard.writeText(client.phone!);
                  }}
                  aria-label="نسخ رقم الهاتف"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
