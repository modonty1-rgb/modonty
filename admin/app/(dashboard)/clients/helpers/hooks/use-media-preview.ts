import { useState, useEffect, useRef } from "react";
import { getMediaById } from "@/app/(dashboard)/media/actions/get-media-by-id";
import { mediaSrc } from "@modonty/shared/lib/media-src";

interface MediaPreview {
  url: string;
  altText: string | null;
}

interface UseMediaPreviewOptions {
  mediaId: string | null | undefined;
  clientId: string | null | undefined;
  initialMedia?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
}

/** Fetches and caches a media preview by ID, with initial data support. */
export function useMediaPreview({
  mediaId,
  clientId,
  initialMedia,
}: UseMediaPreviewOptions) {
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const initialMediaRef = useRef(initialMedia);

  useEffect(() => {
    const initialSrc = mediaSrc(initialMediaRef.current);
    if (initialMediaRef.current && initialSrc) {
      setMedia({
        url: initialSrc,
        altText: initialMediaRef.current.altText || null,
      });
    }
  }, []);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!mediaId || !clientId) {
        setMedia(null);
        return;
      }

      try {
        const result = await getMediaById(mediaId, clientId);
        if (result) {
          setMedia({ url: mediaSrc(result) ?? result.url, altText: result.altText });
        } else {
          setMedia(null);
        }
      } catch {
        setMedia(null);
      }
    };

    fetchMedia();
  }, [mediaId, clientId]);

  return { media, setMedia };
}
