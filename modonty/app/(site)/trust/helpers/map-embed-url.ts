// The pin is the office address, so it comes from the same row as the address itself.
// No coordinates on file → no map, rather than a pin pointing at a remembered spot.
export const mapEmbedUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
