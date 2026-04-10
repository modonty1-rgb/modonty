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
import type { MediaType } from "@prisma/client";

interface MediaSocialTabProps {
  client: any;
  media: Array<{
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
  }>;
}

type Media = {
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
};

export function MediaSocialTab({ client, media }: MediaSocialTabProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const MEDIA_PAGE_SIZE = 24;
  const [mediaLimit, setMediaLimit] = useState(MEDIA_PAGE_SIZE);
  const visibleMedia = media.slice(0, mediaLimit);
  const hasMore = media.length > mediaLimit;

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

  return (
    <>
      <div className="space-y-6">
        {(client.logoMedia || client.heroImageMedia || client.heroImageMedia) && (
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
                Media Assets
              </span>
            </div>
            <div className="p-4 space-y-6">
              {client.logoMedia && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Logo</p>
                  <div className="flex items-center gap-4">
                    <NextImage
                      src={client.logoMedia.url}
                      alt={client.logoMedia.altText || "Logo"}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded object-contain border bg-muted"
                      sizes="96px"
                    />
                    <div className="flex-1 min-w-0">
                      <a
                        href={client.logoMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block break-all"
                      >
                        {client.logoMedia.url}
                      </a>
                      {client.logoMedia.altText && (
                        <p className="text-xs text-muted-foreground mt-1">Alt: {client.logoMedia.altText}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {client.heroImageMedia && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">OG Image</p>
                  <div className="flex items-center gap-4">
                    <NextImage
                      src={client.heroImageMedia.url}
                      alt={client.heroImageMedia.altText || "OG image"}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded object-contain border bg-muted"
                      sizes="96px"
                    />
                    <div className="flex-1 min-w-0">
                      <a
                        href={client.heroImageMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block break-all"
                      >
                        {client.heroImageMedia.url}
                      </a>
                      {client.heroImageMedia.altText && (
                        <p className="text-xs text-muted-foreground mt-1">Alt: {client.heroImageMedia.altText}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {client.heroImageMedia && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Twitter Image</p>
                  <div className="flex items-center gap-4">
                    <NextImage
                      src={client.heroImageMedia.url}
                      alt={client.heroImageMedia.altText || "Twitter image"}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded object-contain border bg-muted"
                      sizes="96px"
                    />
                    <div className="flex-1 min-w-0">
                      <a
                        href={client.heroImageMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block break-all"
                      >
                        {client.heroImageMedia.url}
                      </a>
                      {client.heroImageMedia.altText && (
                        <p className="text-xs text-muted-foreground mt-1">Alt: {client.heroImageMedia.altText}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(client.twitterCard ||
          client.twitterTitle ||
          client.twitterDescription ||
          client.twitterSite) && (
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
                Twitter Cards
              </span>
            </div>
            <div className="p-4 space-y-4">
              {client.twitterCard && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Twitter Card Type</p>
                  <p className="text-sm font-medium">{client.twitterCard}</p>
                </div>
              )}
              {client.twitterTitle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Twitter Title</p>
                  <p className="text-sm font-medium">{client.twitterTitle}</p>
                </div>
              )}
              {client.twitterDescription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Twitter Description</p>
                  <p className="text-sm leading-relaxed">{client.twitterDescription}</p>
                </div>
              )}
              {client.twitterSite && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Twitter Site</p>
                  <p className="text-sm font-medium">{client.twitterSite}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
              Social Profiles
            </span>
          </div>
          <div className="p-4">
            {client.sameAs && client.sameAs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {client.sameAs.map((url: string, index: number) => {
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
          </div>
        </div>

        {media.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
                Media Gallery
              </span>
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
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                {media.length} files{hasMore ? ` (showing ${mediaLimit})` : ""}
              </p>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleMedia.map((item) => {
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
                  {visibleMedia.map((item) => {
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
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaLimit((prev) => prev + MEDIA_PAGE_SIZE)}
                  >
                    Show More ({media.length - mediaLimit} remaining)
                  </Button>
                </div>
              )}
            </div>
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
