import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";
import { isFactoryAuthorized, PLATFORM_TO_API } from "@/lib/videos";

type Copy = Record<string, unknown> | null;

/**
 * طابور السيرفر (العقد §٢ و§٣):
 *  • `state=approved` ← بنود يوتيوب المعتمدة غير المنشورة، بالملف والنص **بعد تعديل الأدمن**. الريلز
 *    ينشرها الأدمن، وتيك توك وإنستغرام يدوي — فما يطلعون هنا.
 *  • `state=rejected` ← البنود المرفوضة بملاحظتها، فيعيد السيرفر السكربت ويرسل revision+1.
 */
export async function GET(request: NextRequest) {
  if (!isFactoryAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = request.nextUrl.searchParams.get("state");
  if (state !== "approved" && state !== "rejected") {
    return NextResponse.json({ error: "bad-request", issues: [{ path: ["state"], message: "approved | rejected" }] }, { status: 400 });
  }

  const wanted = state === "approved" ? ({ status: "APPROVED", platform: "YOUTUBE" } as const) : ({ status: "REJECTED" } as const);
  const jobs = await db.videoJob.findMany({
    where: { items: { some: wanted } },
    orderBy: { updatedAt: "asc" },
    take: 100,
    select: { id: true, articleUrl: true, revision: true, long: true, shorts: true, copy: true, items: true },
  });

  const items = jobs.flatMap((job) =>
    job.items
      .filter((i) => i.status === wanted.status && (!("platform" in wanted) || i.platform === wanted.platform))
      .map((i) => {
        const base = { jobId: job.id, articleUrl: job.articleUrl, revision: job.revision, asset: i.asset, platform: PLATFORM_TO_API[i.platform] };
        if (state === "rejected") return { ...base, note: i.note ?? "" };
        const isLong = i.asset === "long";
        const file = isLong ? job.long?.url : job.shorts.find((s) => s.key === i.asset)?.url;
        return {
          ...base,
          file: file ?? null,
          thumbnail: isLong ? (job.long?.thumbnail ?? null) : null,
          srt: isLong ? (job.long?.srt ?? null) : null,
          copy: ((job.copy as Copy)?.[i.asset] as Copy) ?? null,
        };
      }),
  );
  return NextResponse.json({ items });
}
