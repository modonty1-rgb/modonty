import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "../components/upload-zone";

interface UploadMediaPageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function UploadMediaPage({ searchParams }: UploadMediaPageProps) {
  const params = await searchParams;
  const clientId = params.clientId || null;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/media">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="me-1.5 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold">Upload Media</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pick a role, crop to the locked ratio, then enhance — no wrong-sized images.
          </p>
        </div>
        <Link href="/guidelines/media" target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Standards
          </Button>
        </Link>
      </div>
      <UploadZone initialClientId={clientId} />
    </div>
  );
}
