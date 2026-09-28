/** The same compression the crop editor exports with. */
const WEBP_QUALITY = 0.85;

/**
 * A file already in the role's ratio, scaled to the role's exact size as WebP — no crop editor.
 *
 * The editor exported a scaled-down picture on a 1080×1080 canvas (752×752 in the corner, the rest
 * black) when the admin window was short: 495px tall on production, 28 Sep 2026. A file that needs
 * no crop has nothing to choose, so it skips the editor and is drawn here from its own pixels,
 * whatever the window size.
 */
export async function fitToSpec(file: File, width: number, height: number): Promise<File> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
  if (!blob) throw new Error("Could not encode the image");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}
