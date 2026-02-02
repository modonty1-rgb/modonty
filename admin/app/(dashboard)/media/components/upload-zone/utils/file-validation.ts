/**
 * Validate file before upload
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export function validateFile(file: File): string | null {
  // Check if file type is detected
  if (!file.type || file.type === "") {
    return `File type could not be detected for "${file.name}". Please ensure the file has a valid extension.`;
  }

  // File type validation
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    const fileExtension = file.name.split(".").pop()?.toUpperCase() || "unknown";
    return `File type "${file.type}" (${fileExtension}) is not supported. Supported types: Images (JPG, PNG, GIF, WebP, SVG) and Videos (MP4, WebM).`;
  }

  // File size validation
  const maxSizes: Record<string, number> = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
  };

  const fileCategory = file.type.split("/")[0];
  const maxSize = maxSizes[fileCategory];

  if (!maxSize) {
    return `File type "${file.type}" is not supported. Please upload an image or video file.`;
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;
    return `File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB for ${fileCategory} files.`;
  }

  return null;
}
