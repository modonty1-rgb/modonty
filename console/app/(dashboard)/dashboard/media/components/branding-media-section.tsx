"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { ar } from "@/lib/ar";

interface BrandingMediaSectionProps {
  clientId: string;
  brandingMedia: {
    logo: any;
    ogImage: any;
    twitterImage: any;
  };
  allMedia: any[];
}

export function BrandingMediaSection({
  clientId,
  brandingMedia,
  allMedia,
}: BrandingMediaSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{ar.media.brandingAssets}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {ar.media.viewLogoSocial}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">{ar.media.logo}</h3>
            <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              {brandingMedia.logo ? (
                <Image
                  src={brandingMedia.logo.url}
                  alt={ar.media.logo}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {ar.media.openGraphImage}
            </h3>
            <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              {brandingMedia.ogImage ? (
                <Image
                  src={brandingMedia.ogImage.url}
                  alt={ar.media.openGraphImage}
                  width={400}
                  height={200}
                  className="object-cover"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {ar.media.twitterCardImage}
            </h3>
            <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              {brandingMedia.twitterImage ? (
                <Image
                  src={brandingMedia.twitterImage.url}
                  alt={ar.media.twitterCardImage}
                  width={400}
                  height={200}
                  className="object-cover"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
