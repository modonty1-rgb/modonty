/**
 * يصغّر صورة السند في المتصفّح قبل إرسالها مع «حفظ التعديل».
 *
 * طلب الـServer Action محدود بـ١ ميقا افتراضياً (لا `bodySizeLimit` في next.config)، وصورة
 * الجوّال ٣–٥ ميقا. فتُرسم على canvas بعرضٍ أقصاه ٢٠٠٠ وتُصدَّر WebP — يبقى نصّ الإيصال مقروءاً.
 */
export async function shrinkImage(file: File, max = 2000): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("shrink failed");
  return new File([blob], "receipt.webp", { type: "image/webp" });
}
