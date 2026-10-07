export interface ClientReel {
  id: string;
  /** Derived from `mimeType` — there is no separate type column any more. */
  isVideo: boolean;
  url: string;
  bunnyUrl: string | null;
  blurDataURL: string | null;
  thumbnailUrl: string | null;
  /** Videos only — the plain MP4 the card plays, and the file Google fetches. */
  mp4Url: string | null;
  title: string | null;
  description: string | null;
  /** Image reels only — Google reads it to understand a still picture. */
  altText: string | null;
  status: string | null;
  rejectionReason: string | null;
  width: number | null;
  height: number | null;
  /** Also a gallery image — the client manages it from the gallery tick, not from here. */
  inGallery: boolean;
  /** Cached on the row itself, so the card costs no extra query (ق10). */
  views: number;
  likes: number;
  comments: number;
  favorites: number;
  createdAt: Date;
}
