import { notFound } from "next/navigation";
import { SegmentPageHeader } from "@/components/shared/segment-page-header";
import { Card, CardContent } from "@/components/ui/card";

import { getReferenceRows } from "../../../actions/reference-seo-counts";
import { getReferenceSegment } from "../segments";
import { ReferenceTable } from "./components/reference-table";

// One dynamic page behind every card in the dashboard's Reference data section
// (Khalid 2026-07-13: «لما أضغط عليها يوديني على الـ table، وأبغى الـ SEO بتاع كل category»).
//
// Same contract as the client and article segments: the card's count and this list come
// from the same query and the same scorer (shared/lib/seo/reference), so they cannot
// tell two different stories.

export default async function ReferenceSegmentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const segment = getReferenceSegment(key);
  if (!segment) notFound();

  const rows = await getReferenceRows(segment.key);

  return (
    <div dir="rtl" className="mx-auto max-w-[1000px] space-y-6">
      <SegmentPageHeader title={segment.title} description={segment.description} count={`${rows.length} صفحة`} />

      <Card>
        <CardContent className="pt-4">
          <ReferenceTable rows={rows} editBase={segment.editBase} editMode={segment.editMode} />
        </CardContent>
      </Card>
    </div>
  );
}
