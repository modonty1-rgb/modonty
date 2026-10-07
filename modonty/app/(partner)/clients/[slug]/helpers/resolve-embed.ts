export type EmbedKind =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "native"; src: string };

/** Parse a video URL into a lazy-embeddable shape (no network on render). */
export function resolveEmbed(url: string): EmbedKind {
  // YouTube: watch?v=ID | youtu.be/ID | /embed/ID | /shorts/ID
  const yt =
    url.match(/[?&]v=([\w-]{6,})/) ||
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/\/embed\/([\w-]{6,})/) ||
    url.match(/\/shorts\/([\w-]{6,})/);
  if (yt) return { kind: "youtube", id: yt[1] };

  // Vimeo: vimeo.com/ID | player.vimeo.com/video/ID
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);
  if (vm) return { kind: "vimeo", id: vm[1] };

  return { kind: "native", src: url };
}
