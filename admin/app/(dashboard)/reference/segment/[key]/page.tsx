import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import { getReferenceRows } from "../../../actions/reference-seo-counts";
import { getReferenceSegment } from "../segments";
import { ReferenceTable } from "./components/reference-table";

// One dynamic page behind every card in the dashboard's Reference data section
// (Khalid 2026-07-13: «لما أضغط عليها يوديني على الـ table، وأبغى الـ SEO بتاع كل category»).
//
// Same contract as the client and article segments: the card's count and this list come
// from the same query and the same scorer (dataLayer/lib/seo/reference), so they cannot
// tell two different stories.

export default async function ReferenceSegmentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const segment = getReferenceSegment(key);
  if (!segment) notFound();

  const rows = await getReferenceRows(segment.key);

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
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
          <ReferenceTable rows={rows} editBase={segment.editBase} editMode={segment.editMode} />
        </CardContent>
      </Card>
    </div>
  );
}
