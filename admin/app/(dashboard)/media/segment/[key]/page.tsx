import { notFound } from "next/navigation";
import { SegmentPageHeader } from "@/components/shared/segment-page-header";
import { Card, CardContent } from "@/components/ui/card";

import { getMediaRows } from "../../../actions/media-counts";
import { getMediaSegment } from "../segments";
import { MediaSegmentTable } from "./components/media-segment-table";

// One dynamic page behind every card in the dashboard's Media section
// (Khalid 2026-07-13: «من ناحية الـ SEO تبعها، ومن ناحية المستخدمة والغير مستخدمة»).
//
// Same contract as the client, article and reference segments: the card's count and this
// list come from the same read and the same scorer, so they cannot tell two stories.

export default async function MediaSegmentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const segment = getMediaSegment(key);
  if (!segment) notFound();

  const rows = await getMediaRows(segment.key);

  return (
    <div dir="rtl" className="mx-auto max-w-[1100px] space-y-6">
      <SegmentPageHeader title={segment.title} description={segment.description} count={`${rows.length} ملف`} />

      <Card>
        <CardContent className="pt-4">
          <MediaSegmentTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
