import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { IntakeForm } from "./components/intake-form";
import { DynamicIntakeForm } from "./components/dynamic-intake-form";
import type { ClientIntake } from "./lib/intake-types";
import { detectTech } from "./lib/detect-tech";
import { getIntakeFormDefinition } from "./lib/intake-queries";
import { isYmylIndustry } from "./lib/ymyl";

export const dynamic = "force-dynamic";

export default async function SeoIntakePage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  // Client data + admin-managed questionnaire fetched in parallel.
  const [client, formDef] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        intake: true,
        intakeUpdatedAt: true,
        url: true,
        addressCountry: true,
        industry: { select: { name: true } },
      },
    }),
    getIntakeFormDefinition(),
  ]);

  const initial = (client?.intake as ClientIntake | null) ?? null;

  // Auto-detect Google Business Profile URL if not set yet — runs once on first visit, ~1s.
  let detected: { gbpUrl: string | null } | null = null;
  if (!initial?.technical?.googleBusinessProfileUrl && client?.url) {
    detected = await detectTech(client.url);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight">
          {formDef?.title ?? "معلومات نشاطك"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {formDef?.description ??
            "قائمة الإجابات هذه هي القاعدة التي يبني عليها الفريق محتوى موقعك. كل ما كانت إجاباتك أوضح، المحتوى أقوى."}
        </p>
      </header>

      {formDef ? (
        // DB-driven (admin-managed) questionnaire — once seeded, this is the source of truth.
        <DynamicIntakeForm
          form={formDef}
          initial={(initial as Record<string, unknown> | null) ?? null}
          intakeUpdatedAt={client?.intakeUpdatedAt ?? null}
          detectedGbpUrl={detected?.gbpUrl ?? null}
          isYmyl={isYmylIndustry(client?.industry?.name ?? null)}
          country={client?.addressCountry ?? null}
        />
      ) : (
        // Fallback: legacy hardcoded form until the questionnaire is seeded into the DB.
        <IntakeForm
          initial={initial}
          intakeUpdatedAt={client?.intakeUpdatedAt ?? null}
          detected={detected}
          industryName={client?.industry?.name ?? null}
          country={client?.addressCountry ?? null}
        />
      )}
    </div>
  );
}
