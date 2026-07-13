import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="mx-auto max-w-[1100px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{segment.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{segment.description}</p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted"
        >
          ← Back to dashboard
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <MediaSegmentTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
