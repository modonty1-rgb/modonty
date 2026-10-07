

const CLOUDINARY_UPLOAD_REGEX = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload)\/([^/]*)(\/.+)$/;
const VERSION_TOKEN = /^v\d+$/;
const DEFAULT_OPTS = ["f_auto", "q_auto", "w_auto"] as const;

function normalizeCloudinaryPath(url: string): string {
  return url.replace(/(\/(?:image|video)\/upload)\/+/g, "$1/");
}

/**
 * Inject f_auto,q_auto,w_auto into Cloudinary URL; collapse duplicate slashes.
 * Version (v123...) stays a separate path segment.
 */
export function optimizeCloudinaryUrl(
  url: string,
  _publicId?: string,
  _format?: string,
  _resourceType?: "image" | "video"
): string {
  if (!url || typeof url !== "string") return url;
  const normalized = normalizeCloudinaryPath(url.trim());
  const match = normalized.match(CLOUDINARY_UPLOAD_REGEX);
  if (!match) return url;
  const [, prefix, segment, suffix] = match;
  const parts = segment.split(",").map((p) => p.trim()).filter(Boolean);
  const version = parts.find((p) => VERSION_TOKEN.test(p));
  const rawTransforms = parts.filter((p) => !VERSION_TOKEN.test(p));
  const seen = new Set<string>();
  const transformParts = rawTransforms.filter((p) => {
    if (seen.has(p)) return false;
    seen.add(p);
    return true;
  });
  const toAdd = DEFAULT_OPTS.filter((opt) => !transformParts.includes(opt));
  const newTransformStr = [...toAdd, ...transformParts].join(",");
  const pathAfterUpload = version ? `/${version}${suffix}` : suffix;
  const afterUpload = newTransformStr
    ? `${newTransformStr}${pathAfterUpload}`
    : pathAfterUpload.replace(/^\/+/, "");
  return `${prefix}/${afterUpload}`;
}