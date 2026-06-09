"use client";

import { useState } from "react";

import { IconPlay } from "@/lib/icons";

interface ClientVideoEmbedProps {
  url: string;
  label?: string;
}

type EmbedKind =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "native"; src: string };

/** Parse a video URL into a lazy-embeddable shape (no network on render). */
function resolveEmbed(url: string): EmbedKind {
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

/**
 * Lazy video facade — renders a poster + play button only. The real iframe /
 * <video> element is mounted on click, so zero third-party JS loads until the
 * visitor opts in (performance-first per modonty.com rule #1).
 */
export function ClientVideoEmbed({ url, label }: ClientVideoEmbedProps) {
  const [active, setActive] = useState(false);
  const embed = resolveEmbed(url);

  if (active) {
    if (embed.kind === "native") {
      return (
        <div className="mb-4 overflow-hidden rounded-md">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={embed.src}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full bg-black"
          />
        </div>
      );
    }

    const src =
      embed.kind === "youtube"
        ? `https://www.youtube.com/embed/${embed.id}?autoplay=1&rel=0`
        : `https://player.vimeo.com/video/${embed.id}?autoplay=1`;

    return (
      <div className="mb-4 overflow-hidden rounded-md">
        <iframe
          src={src}
          title={label ?? "فيديو تعريفي"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="aspect-video w-full border-0 bg-black"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={label ?? "تشغيل الفيديو التعريفي"}
      className="group relative mb-4 grid aspect-video w-full place-items-center overflow-hidden rounded-md bg-gradient-to-br from-primary to-accent"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary shadow-[0_10px_26px_-8px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-110">
        <IconPlay className="h-6 w-6 ms-0.5 fill-current" />
      </span>
      {label && (
        <span className="absolute bottom-3 inline-flex items-center gap-1.5 rounded-md bg-primary/80 px-2.5 py-1 text-[11px] font-bold text-white start-3">
          {label}
        </span>
      )}
    </button>
  );
}
