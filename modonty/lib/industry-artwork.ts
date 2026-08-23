/**
 * A field's own picture, or `null` when what the record holds is the platform's fallback
 * logo — that logo is NOT the field's picture: six tiles wearing it showed the brand six
 * times and told the fields apart by nothing (measured live on 390, 22 Aug). Without it
 * the tile falls back to its tone-coloured mark; a field whose admin uploads real artwork
 * gets it back automatically.
 */
export function industryArtwork(image: string | null | undefined): string | null {
  if (!image) return null;
  return image.includes("platform-default-logo") ? null : image;
}
