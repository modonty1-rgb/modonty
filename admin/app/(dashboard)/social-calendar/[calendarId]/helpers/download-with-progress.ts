/**
 * تحميل ملف من الـCDN بشريط تقدّم حقيقي (القديم `lib/download-with-progress.ts`): يُقرأ الجسم
 * قطعةً قطعة ليُحسب ما وصل، ثم يُحفظ بالاسم المعطى. يستعمله الميديا باير والمعرض.
 */
export async function downloadWithProgress(
  url: string,
  filename: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`fetch failed (${res.status})`);

  const total = Number(res.headers.get("Content-Length") ?? 0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) onProgress(Math.min(99, Math.round((received / total) * 100)));
  }
  onProgress(100);

  const blobUrl = URL.createObjectURL(new Blob(chunks as BlobPart[]));
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
}
