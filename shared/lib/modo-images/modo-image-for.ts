import type { ModoImages, ModoPose } from "./modo-poses";

/**
 * The image for a pose, falling back to Modo's avatar (then any pose the admin did fill), so a pose
 * left empty in the admin never shows a hole. null only when the admin has uploaded nothing at all.
 */
export function modoImageFor(images: ModoImages, pose: ModoPose): string | null {
  return images[pose] ?? images.avatar ?? images.front ?? images.original ?? Object.values(images)[0] ?? null;
}
