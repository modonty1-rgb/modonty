import { VideosTable, type VideoRow } from "./components/videos-table";
import { getVideoJobs } from "./helpers/get-video-jobs";

export const metadata = { title: "الفيديوهات" };

/**
 * فيديوهات المصنع (خالد ١٦ أكتوبر ٢٠٢٦ · documents/video-factory/) — كل مقالة منشورة يحوّلها سيرفر
 * كونتابو إلى فيديو عادي + ٣ شورتس، وتوصل هنا مسودة. هنا القرار: اعتماد كل (ملف × منصة) لحاله.
 */
export default async function VideosPage() {
  const jobs = await getVideoJobs();
  const rows: VideoRow[] = jobs.map((j) => {
    const count = (s: string) => j.items.filter((i) => i.status === s).length;
    return {
      id: j.id,
      title: j.article.title,
      client: j.client.name,
      status: j.status,
      revision: j.revision,
      updatedAt: j.updatedAt.toISOString(),
      shorts: j.shorts.length,
      pending: count("PENDING"),
      approved: count("APPROVED"),
      published: count("PUBLISHED"),
      rejected: count("REJECTED"),
      failed: count("FAILED"),
      total: j.items.length,
      lastError: j.status === "NEEDS_ATTENTION" ? (j.errors.at(-1)?.message ?? null) : null,
      searchText: `${j.article.title} ${j.client.name}`,
    };
  });

  return (
    <div dir="rtl" className="space-y-3">
      <h1 className="text-lg font-semibold tracking-[-0.01em]">الفيديوهات</h1>
      <VideosTable rows={rows} />
    </div>
  );
}
