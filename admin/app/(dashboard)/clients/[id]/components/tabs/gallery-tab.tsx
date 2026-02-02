"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import NextImage from "next/image";
import Link from "next/link";
import { Eye, ExternalLink, Image as ImageIcon, Video, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaType } from "@prisma/client";

interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  title: string | null;
  description: string | null;
  type: MediaType;
  createdAt: Date;
  cloudinaryPublicId?: string | null;
  cloudinaryVersion?: string | null;
}

interface GalleryTabProps {
  media: Media[];
}

export function GalleryTab({ media }: GalleryTabProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "Unknown";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getMediaIcon = (mimeType: string) => {
    if (isImage(mimeType)) return ImageIcon;
    if (isVideo(mimeType)) return Video;
    return File;
  };

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">No media found</p>
          <p className="text-sm text-muted-foreground">
            Upload media for this client to see it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Media Gallery</h3>
            <p className="text-sm text-muted-foreground">
              {media.length} {media.length === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => {
              const MediaIcon = getMediaIcon(item.mimeType);
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => setSelectedMedia(item)}
                >
                  <div className="relative aspect-square bg-muted">
                    {isImage(item.mimeType) ? (
                      <NextImage
                        src={item.url}
                        alt={item.altText || item.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <MediaIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium truncate mb-1">{item.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(item.fileSize)}
                      </Badge>
                      {item.width && item.height && (
                        <span className="text-xs">
                          {item.width}×{item.height}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {media.map((item) => {
              const MediaIcon = getMediaIcon(item.mimeType);
              return (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {isImage(item.mimeType) ? (
                          <NextImage
                            src={item.url}
                            alt={item.altText || item.filename}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <MediaIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.filename}</p>
                            {item.altText && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {item.altText}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(item.fileSize)}</span>
                              {item.width && item.height && (
                                <span>
                                  {item.width}×{item.height}
                                </span>
                              )}
                              <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/media/${item.id}/edit`} onClick={(e) => e.stopPropagation()}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.filename}</DialogTitle>
                {selectedMedia.altText && (
                  <DialogDescription>{selectedMedia.altText}</DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                  {isImage(selectedMedia.mimeType) ? (
                    <NextImage
                      src={selectedMedia.url}
                      alt={selectedMedia.altText || selectedMedia.filename}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {(() => {
                        const Icon = getMediaIcon(selectedMedia.mimeType);
                        return <Icon className="h-16 w-16 text-muted-foreground" />;
                      })()}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">File Size</p>
                    <p className="text-muted-foreground">{formatFileSize(selectedMedia.fileSize)}</p>
                  </div>
                  {selectedMedia.width && selectedMedia.height && (
                    <div>
                      <p className="font-medium mb-1">Dimensions</p>
                      <p className="text-muted-foreground">
                        {selectedMedia.width} × {selectedMedia.height}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium mb-1">Type</p>
                    <p className="text-muted-foreground">{selectedMedia.mimeType}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Uploaded</p>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedMedia.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  {selectedMedia.title && (
                    <div className="col-span-2">
                      <p className="font-medium mb-1">Title</p>
                      <p className="text-muted-foreground">{selectedMedia.title}</p>
                    </div>
                  )}
                  {selectedMedia.description && (
                    <div className="col-span-2">
                      <p className="font-medium mb-1">Description</p>
                      <p className="text-muted-foreground">{selectedMedia.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/media/${selectedMedia.id}/edit`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Edit Media
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Original
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
