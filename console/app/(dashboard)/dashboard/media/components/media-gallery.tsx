"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { MediaWithStats } from "../helpers/media-queries";

interface MediaGalleryProps {
  clientId: string;
  media: MediaWithStats[];
}

export function MediaGallery({ clientId, media }: MediaGalleryProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredMedia =
    filter === "all"
      ? media
      : media.filter((m) => m.type.toLowerCase() === filter);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Media Gallery</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredMedia.length} files
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
              variant={filter === "logo" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("logo")}
            >
              Logos
            </Button>
            <Button
              variant={filter === "post" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("post")}
            >
              Posts
            </Button>
            <Button
              variant={filter === "ogimage" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ogimage")}
            >
              OG Images
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No media found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-muted"
              >
                <Image
                  src={item.url}
                  alt={item.altText || item.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <p className="text-white text-xs text-center px-2 truncate w-full">
                    {item.filename}
                  </p>
                  <p className="text-white/80 text-xs">
                    Used in {item.usageCount} place(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
