"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import NextImage from "next/image";
import { Loader2, Search, Upload, RefreshCw } from "lucide-react";
import { getMedia, type MediaFilters } from "@/app/(dashboard)/media/actions/media-actions";
import Link from "next/link";
import { MediaType } from "@prisma/client";
import { getMediaTypeLabel, getMediaTypeBadgeVariant } from "@/app/(dashboard)/media/helpers/media-utils";

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

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  onSelect: (media: { url: string; altText: string | null; mediaId: string; width?: number | null; height?: number | null }) => void;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  clientId,
  onSelect,
}: MediaPickerDialogProps) {
  const router = useRouter();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");

  useEffect(() => {
    if (open && clientId) {
      loadMedia();
    }
  }, [open, clientId, typeFilter]);

  const loadMedia = async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      const filters: MediaFilters = {
        clientId,
        mimeType: "image",
        type: typeFilter !== "all" ? typeFilter : undefined,
      };
      const mediaList = await getMedia(filters);
      setMedia(mediaList as Media[]);
    } catch (error) {
      console.error("Failed to load media:", error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Media) => {
    onSelect({
      url: item.url,
      altText: item.altText,
      mediaId: item.id,
      width: item.width,
      height: item.height,
    });
    onOpenChange(false);
  };

  const filteredMedia = search
    ? media.filter(
      (item) =>
        item.filename.toLowerCase().includes(search.toLowerCase()) ||
        item.altText?.toLowerCase().includes(search.toLowerCase())
    )
    : media;

  const getImageUrl = (item: Media): string => {
    if (item.cloudinaryPublicId) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfegnpgwx";
      const version = item.cloudinaryVersion || "";
      const format = item.filename.split(".").pop() || "png";
      let publicId = item.cloudinaryPublicId;
      const lastDot = publicId.lastIndexOf(".");
      if (lastDot > 0) {
        const possibleExt = publicId.substring(lastDot + 1).toLowerCase();
        const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
        if (validExtensions.includes(possibleExt)) {
          publicId = publicId.substring(0, lastDot);
        }
      }
      if (version) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/v${version}/${publicId}.${format}`;
      } else {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.${format}`;
      }
    }
    return item.url;
  };

  if (!clientId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
            <DialogDescription>
              Please select a client first before choosing media.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No client selected</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription className="mt-1.5">
            Choose an image from the media library for this client.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 pt-4 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search media by filename or alt text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="w-[160px] shrink-0">
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as MediaType | "all")}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="LOGO">Logo</SelectItem>
                  <SelectItem value="POST">Post</SelectItem>
                  <SelectItem value="OGIMAGE">OG Image</SelectItem>
                  <SelectItem value="TWITTER_IMAGE">Twitter Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={loadMedia}
              disabled={loading}
              title="Refresh media list"
              className="h-9 w-9 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {search
                  ? "No media found matching your search."
                  : typeFilter !== "all"
                    ? `No ${getMediaTypeLabel(typeFilter).toLowerCase()} media available for this client.`
                    : "No media available for this client."}
              </p>
              <Link href={`/media/upload?clientId=${clientId}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-2 px-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-2">
                  {filteredMedia.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-md transition-all border hover:border-primary/50"
                      onClick={() => handleSelect(item)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                          <NextImage
                            src={getImageUrl(item)}
                            alt={item.altText || item.filename}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3 space-y-2">
                          <p className="text-sm font-medium line-clamp-2 leading-tight">{item.filename}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getMediaTypeBadgeVariant(item.type)} className="text-xs font-normal">
                              {getMediaTypeLabel(item.type)}
                            </Badge>
                            {item.width && item.height && (
                              <Badge variant="secondary" className="text-xs font-normal">
                                {item.width} × {item.height}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
