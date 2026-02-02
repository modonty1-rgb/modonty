"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

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
        <CardTitle className="text-lg">Branding Assets</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          View your logo and social media images
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Logo</h3>
            <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              {brandingMedia.logo ? (
                <Image
                  src={brandingMedia.logo.url}
                  alt="Logo"
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
              Open Graph Image
            </h3>
            <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              {brandingMedia.ogImage ? (
                <Image
                  src={brandingMedia.ogImage.url}
                  alt="OG Image"
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
              Twitter Card Image
            </h3>
            <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
              {brandingMedia.twitterImage ? (
                <Image
                  src={brandingMedia.twitterImage.url}
                  alt="Twitter Image"
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
