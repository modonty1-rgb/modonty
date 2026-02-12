const CLOUDINARY_LOGO =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1769683590/modontyLogo_ftf4yf.png";

export const MODONTY_CHARACTER_URL =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1770560849/Modonty_Character_fsybt1.png";

const CHARACTER_BASE =
  "https://res.cloudinary.com/dfegnpgwx/image/upload/v1770560849/Modonty_Character_fsybt1.png";

export function getOptimizedCharacterUrl(width = 96): string {
  if (!CHARACTER_BASE.includes("res.cloudinary.com")) return CHARACTER_BASE;
  if (CHARACTER_BASE.includes("/f_auto") || CHARACTER_BASE.includes("/q_auto")) return CHARACTER_BASE;
  try {
    const uploadIndex = CHARACTER_BASE.indexOf("/upload/");
    if (uploadIndex === -1) return CHARACTER_BASE;
    const beforeUpload = CHARACTER_BASE.substring(0, uploadIndex + 8);
    const afterUpload = CHARACTER_BASE.substring(uploadIndex + 8);
    return `${beforeUpload}f_auto,q_auto,w_${width},c_limit/${afterUpload}`;
  } catch {
    return CHARACTER_BASE;
  }
}

export function getOptimizedLogoUrl(): string {
  if (!CLOUDINARY_LOGO.includes("res.cloudinary.com")) return CLOUDINARY_LOGO;
  const uploadIndex = CLOUDINARY_LOGO.indexOf("/upload/");
  if (uploadIndex === -1) return CLOUDINARY_LOGO;
  const beforeUpload = CLOUDINARY_LOGO.substring(0, uploadIndex + 8);
  const afterUpload = CLOUDINARY_LOGO.substring(uploadIndex + 8);
  return `${beforeUpload}f_auto,q_auto,w_300,c_limit/${afterUpload}`;
}

export function getOptimizedThumbnailUrl(url: string | null | undefined, width = 80): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return url || null;
  if (url.toLowerCase().endsWith(".svg")) return url;
  if (url.includes("/f_auto") || url.includes("/q_auto")) return url;
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return url;
    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);
    return `${beforeUpload}f_auto,q_auto,w_${width},c_fill,g_auto/${afterUpload}`;
  } catch {
    return url;
  }
}

