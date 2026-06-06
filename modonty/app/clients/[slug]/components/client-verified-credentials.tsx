import Image from "next/image";
import Link from "@/components/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { IconVerified, IconExternal } from "@/lib/icons";

interface ClientVerifiedCredentialsProps {
  client: {
    name: string;
    isYmyl?: boolean | null;
    ymylCategory?: string | null;
    // Prisma Json (JsonValue) — narrowed to an object inside.
    ymylData?: unknown;
  };
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

// Per-category title for the verified-credential card.
const CATEGORY_LABEL: Record<string, string> = {
  medical: "ترخيص طبي موثّق",
  legal: "قيد نقابي موثّق",
  financial: "ترخيص مالي موثّق",
};

/**
 * Verified credentials card for YMYL clients (medical / legal / financial).
 * Reads the license image + number + authority from `ymylData` (keys vary per
 * category) and links to the public /trust page. Renders nothing when the client
 * isn't YMYL or has no credential data yet.
 */
export function ClientVerifiedCredentials({ client }: ClientVerifiedCredentialsProps) {
  if (!client.isYmyl || typeof client.ymylData !== "object" || client.ymylData === null) {
    return null;
  }

  const data = client.ymylData as Record<string, unknown>;
  const imageUrl = str(data.licenseImageUrl) ?? str(data.barCertificateUrl);
  const number = str(data.licenseNumber) ?? str(data.barNumber) ?? str(data.regulatorLicense);
  const authority = str(data.authority) ?? str(data.barAssociation) ?? str(data.regulator);

  if (!imageUrl && !number && !authority) return null;

  const title = (client.ymylCategory && CATEGORY_LABEL[client.ymylCategory]) || "ترخيص موثّق";

  return (
    <Card className="border-emerald-500/30">
      <CardHeader>
        <CardTitleWithIcon title={title} icon={IconVerified} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/30">
          <IconVerified className="h-3.5 w-3.5" />
          موثّق من مدوّنتي
        </div>

        {imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted/30">
            <Image
              src={imageUrl}
              alt={`ترخيص ${client.name}`}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 280px"
            />
          </div>
        )}

        {number && (
          <div>
            <p className="text-xs text-muted-foreground">رقم الترخيص</p>
            <p className="text-sm font-medium tabular-nums" dir="ltr">
              {number}
            </p>
          </div>
        )}

        {authority && (
          <div>
            <p className="text-xs text-muted-foreground">الجهة المُرخِّصة</p>
            <p className="text-sm font-medium">{authority}</p>
          </div>
        )}

        <Link
          href="/trust"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          تعرّف على نظام التوثيق في مدوّنتي
          <IconExternal className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
