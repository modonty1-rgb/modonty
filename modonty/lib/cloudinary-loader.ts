/**
 * Next.js custom image loader — builds Cloudinary URLs directly (see next.config.ts loaderFile).
 * https://nextjs.org/docs/app/api-reference/components/image#loaderfile
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.startsWith("/") || src.startsWith("data:")) {
    return src;
  }
  if (/^https?:\/\//.test(src) && !src.includes("res.cloudinary.com")) {
    return src;
  }

  const w = Math.min(width, 1200);
  const cloudName = "dfegnpgwx";

  if (src.includes("res.cloudinary.com")) {
    const uploadIdx = src.indexOf("/upload/");
    if (uploadIdx > -1) {
      const beforeUpload = src.substring(0, uploadIdx + 8);
      const afterUpload = src.substring(uploadIdx + 8);
      const segments = afterUpload.split("/");
      const restPath = segments[0]?.includes(",")
        ? segments.slice(1).join("/")
        : afterUpload;
      const qParam = quality != null ? `q_${quality}` : "q_auto";
      const transforms = `f_auto,${qParam},c_fill,g_auto,w_${w}`;
      return `${beforeUpload}${transforms}/${restPath}`;
    }
  }

  const qParam = quality != null ? `q_${quality}` : "q_auto";
  const params = ["f_auto", "c_limit", `w_${w}`, qParam];
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(",")}/${src}`;
}
