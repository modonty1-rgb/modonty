import { PageHeader } from "@/components/shared/page-header";
import { UploadZone } from "../components/upload-zone";

interface UploadMediaPageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function UploadMediaPage({ searchParams }: UploadMediaPageProps) {
  const params = await searchParams;
  const clientId = params.clientId || null;

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Upload Media" description="Upload media files with drag-and-drop support" />
      <UploadZone initialClientId={clientId} />
    </div>
  );
}
