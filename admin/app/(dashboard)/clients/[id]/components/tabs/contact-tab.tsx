"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Users, Link2 } from "lucide-react";
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Link as LinkIcon,
} from "lucide-react";
import {
  detectPlatform,
  getPlatformName,
  type Platform,
} from "../../../helpers/url-validation";

interface ContactTabProps {
  client: {
    url: string | null;
    phone: string | null;
    contactType: string | null;
    sameAs: string[];
  };
}

export function ContactTab({ client }: ContactTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Website URL</p>
              </div>
              {client.url ? (
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {client.url}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Phone</p>
              </div>
              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {client.phone}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Contact Type</p>
              </div>
              <p className="text-sm font-medium">{client.contactType || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {client.sameAs && client.sameAs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {client.sameAs.map((url, index) => {
                const platform = detectPlatform(url);
                const platformName = getPlatformName(platform);

                const platformIcons: Record<
                  Platform,
                  React.ComponentType<{ className?: string }>
                > = {
                  linkedin: Linkedin,
                  twitter: Twitter,
                  facebook: Facebook,
                  instagram: Instagram,
                  youtube: Youtube,
                  tiktok: Music,
                  other: LinkIcon,
                };

                const Icon = platformIcons[platform] || LinkIcon;

                return (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary group-hover:underline break-all font-medium">
                        {url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{platformName}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Not set</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
