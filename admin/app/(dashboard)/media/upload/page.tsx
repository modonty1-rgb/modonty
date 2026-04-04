import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "../components/upload-zone";

interface UploadMediaPageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function UploadMediaPage({ searchParams }: UploadMediaPageProps) {
  const params = await searchParams;
  const clientId = params.clientId || null;

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/media">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 me-1.5" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Upload Media</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Upload media files with drag-and-drop support</p>
        </div>
      </div>
      <UploadZone initialClientId={clientId} />
    </div>
  );
}
