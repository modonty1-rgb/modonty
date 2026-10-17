"use client";

import { useContext } from "react";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";
import { modoImageFor, type ModoPose } from "@modonty/shared/lib/modo-images";
import { ModoImagesContext } from "./modo-images-context";

interface ModoFaceProps {
  /** Which of Modo's poses — the chat changes it per reply so he reads as alive, not a stamp. */
  pose?: ModoPose;
  sizes: string;
  decorative?: boolean;
  /** Crop a full-body pose to head and hands — for small tiles. Ignored when the avatar stands in. */
  framing?: "fill" | "bust";
}

/** Modo as the team set him in the admin. Fills its parent, like ModoCharacter. */
export function ModoFace({ pose = "avatar", sizes, decorative, framing = "fill" }: ModoFaceProps) {
  const images = useContext(ModoImagesContext);
  const src = modoImageFor(images, pose);
  // the avatar is already a bust on navy — when it stands in for an unset pose, don't zoom it again
  const isAvatar = !!src && src === images.avatar;
  return <ModoCharacter src={src} sizes={sizes} decorative={decorative} framing={isAvatar ? "fill" : framing} />;
}
