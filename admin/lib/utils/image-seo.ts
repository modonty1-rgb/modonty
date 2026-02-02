import { slugify } from "../utils";

/**
 * Generate a short unique identifier for filename deduplication
 * Uses timestamp + random string to ensure uniqueness
 * 
 * @returns Short unique string (e.g., "a3f2b1c")
 */
function generateUniqueSuffix(): string {
  // Use timestamp (last 6 digits) + random 3 chars for uniqueness
  const timestamp = Date.now().toString(36).slice(-6); // Base36, last 6 chars
  const random = Math.random().toString(36).substring(2, 5); // 3 random chars
  return `${timestamp}${random}`;
}

/**
 * Generate SEO-friendly filename for Cloudinary public_id
 * 
 * Cloudinary uses public_id as the filename in the URL.
 * This function creates a SEO-friendly public_id from alt text or title.
 * Automatically appends a unique suffix to prevent duplicates.
 * 
 * @param altText - Primary source for SEO keywords
 * @param title - Fallback if altText is empty
 * @param originalFilename - Original file name (for extension)
 * @param clientSlug - Optional client slug for organization
 * @param ensureUnique - If true, appends unique suffix to prevent duplicates (default: true)
 * @returns SEO-friendly filename without extension
 * 
 * @example
 * generateSEOFileName("Sunset over beach", "Beach Sunset", "IMG1234.jpg", "client-name")
 * // Returns: "client-name/sunset-over-beach-a3f2b1c" (with unique suffix)
 */
export function generateSEOFileName(
  altText: string,
  title?: string,
  originalFilename?: string,
  clientSlug?: string,
  ensureUnique: boolean = true
): string {
  // Use altText as primary source, fallback to title, then original filename
  const sourceText = altText?.trim() || title?.trim() || originalFilename || "image";
  
  // Generate slug from the text
  let seoSlug = slugify(sourceText);
  
  // Ensure minimum length (at least 3 characters)
  if (seoSlug.length < 3) {
    seoSlug = `image-${seoSlug}`;
  }
  
  // Add unique suffix to prevent duplicates (short, SEO-friendly)
  if (ensureUnique) {
    const uniqueSuffix = generateUniqueSuffix();
    // Reserve space for suffix (9 chars: "-" + 8 char suffix)
    const maxBaseLength = 100 - 9;
    if (seoSlug.length > maxBaseLength) {
      seoSlug = seoSlug.substring(0, maxBaseLength);
      // Remove trailing hyphen if cut off mid-word
      seoSlug = seoSlug.replace(/-+$/, "");
    }
    seoSlug = `${seoSlug}-${uniqueSuffix}`;
  } else {
    // Limit length to 100 characters if not using unique suffix
    if (seoSlug.length > 100) {
      seoSlug = seoSlug.substring(0, 100);
      // Remove trailing hyphen if cut off mid-word
      seoSlug = seoSlug.replace(/-+$/, "");
    }
  }
  
  // Add client slug prefix for organization (optional)
  if (clientSlug) {
    const clientPrefix = slugify(clientSlug);
    return `${clientPrefix}/${seoSlug}`;
  }
  
  return seoSlug;
}

/**
 * Generate Cloudinary public_id with folder structure
 * 
 * @param seoFileName - SEO-friendly filename (from generateSEOFileName)
 * @param folder - Optional folder path (e.g., "media", "og-images/tag/slug")
 * @returns Full public_id path for Cloudinary
 * 
 * @example
 * generateCloudinaryPublicId("sunset-beach", "media")
 * // Returns: "media/sunset-beach"
 * generateCloudinaryPublicId("filename", "og-images/tag/slug")
 * // Returns: "og-images/tag/slug/filename"
 */
/**
 * Check if a string is a MongoDB ObjectId (24 hex characters)
 */
function isObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

export function generateCloudinaryPublicId(
  seoFileName: string,
  folder?: string
): string {
  if (folder) {
    // If folder contains slashes, it's already a path structure - preserve it
    // Only slugify individual path segments, not the entire path
    // Skip slugifying ObjectIds (they're already URL-safe)
    if (folder.includes("/")) {
      const pathSegments = folder.split("/");
      const processedSegments = pathSegments.map(segment => {
        // Don't slugify ObjectIds - they're already URL-safe
        if (isObjectId(segment)) {
          return segment;
        }
        return slugify(segment);
      });
      const folderPath = processedSegments.join("/");
      return `${folderPath}/${seoFileName}`;
    }
    // Single folder name - check if it's an ObjectId
    if (isObjectId(folder)) {
      return `${folder}/${seoFileName}`;
    }
    // Single folder name - slugify it
    const folderSlug = slugify(folder);
    return `${folderSlug}/${seoFileName}`;
  }
  return seoFileName;
}

/**
 * Validate Cloudinary public_id format
 * 
 * Cloudinary public_id rules:
 * - Can contain: alphanumeric, underscore, hyphen, forward slash
 * - Cannot start or end with slash
 * - Max length: 255 characters
 * 
 * @param publicId - Public ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidCloudinaryPublicId(publicId: string): boolean {
  if (!publicId || publicId.length === 0) return false;
  if (publicId.length > 255) return false;
  if (publicId.startsWith("/") || publicId.endsWith("/")) return false;
  
  // Only allow alphanumeric, underscore, hyphen, and forward slash
  const validPattern = /^[a-zA-Z0-9_\-/]+$/;
  return validPattern.test(publicId);
}

/**
 * Extract file extension from filename
 * 
 * @param filename - Original filename
 * @returns File extension without dot (e.g., "jpg", "png")
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Generate complete SEO-friendly filename with extension
 * 
 * @param seoFileName - SEO-friendly filename without extension
 * @param originalFilename - Original filename to extract extension
 * @returns Complete filename with extension
 * 
 * @example
 * generateCompleteFileName("sunset-beach", "IMG1234.jpg")
 * // Returns: "sunset-beach.jpg"
 */
export function generateCompleteFileName(
  seoFileName: string,
  originalFilename: string
): string {
  const extension = getFileExtension(originalFilename);
  return extension ? `${seoFileName}.${extension}` : seoFileName;
}

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