import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoreClientId } from "@modonty/shared/lib/core-client";
import type { MediaType } from "@prisma/client";
import { CLIENT_UPLOAD_ROLES, MEDIA_TYPE_ORDER } from "@/lib/media/media-specs";
import { UploadZone } from "../components/upload-zone";

interface UploadMediaPageProps {
  /** `for=clients` = opened from Clients › Media: client roles only, owner fixed, back to it. */
  searchParams: Promise<{ clientId?: string; for?: string; role?: string }>;
}

export default async function UploadMediaPage({ searchParams }: UploadMediaPageProps) {
  const [params, coreClientId] = await Promise.all([searchParams, getCoreClientId()]);
  const clientId = params.clientId || null;
  const forClients = params.for === "clients";
  // Only a role this upload actually offers may be pre-picked; anything else is ignored.
  const offered: MediaType[] = forClients ? CLIENT_UPLOAD_ROLES : MEDIA_TYPE_ORDER;
  const initialRole = offered.find((r) => r === params.role) ?? null;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center gap-3">
        <Link href={forClients ? `/clients/media${clientId ? `?clientId=${clientId}` : ""}` : "/media"}>
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
        <Link href="/playbook/media" target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Standards
          </Button>
        </Link>
      </div>
      <UploadZone
        initialClientId={clientId}
        coreClientId={coreClientId}
        initialRole={initialRole}
        {...(forClients ? { roles: CLIENT_UPLOAD_ROLES, clientOnly: true } : {})}
      />
    </div>
  );
}
