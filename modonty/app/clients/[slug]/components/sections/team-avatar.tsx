"use client";

import { useState } from "react";

interface Props {
  src: string;
  name: string;
}

/**
 * Avatar for a team member whose photo URL is client-supplied (any host).
 * Plain <img> (not next/image) so an un-allowlisted host can't crash the page;
 * onError falls back to the name's first letter over the gradient circle.
 */
export function TeamAvatar({ src, name }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{name.trim().charAt(0)}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
