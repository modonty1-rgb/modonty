import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { IntakeForm } from "./components/intake-form";
import type { ClientIntake } from "./lib/intake-types";
import { detectTech } from "./lib/detect-tech";

export const dynamic = "force-dynamic";

export default async function SeoIntakePage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      intake: true,
      intakeUpdatedAt: true,
      url: true,
      addressCountry: true,
      industry: { select: { name: true } },
    },
  });

  const initial = (client?.intake as ClientIntake | null) ?? null;

  // Auto-detect Google Business Profile URL if not set yet — runs once on first visit, ~1s.
  let detected: { gbpUrl: string | null } | null = null;
  if (!initial?.technical?.googleBusinessProfileUrl && client?.url) {
    detected = await detectTech(client.url);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight">معلومات نشاطك</h1>
        <p className="text-muted-foreground mt-1">
          قائمة الإجابات هذه هي القاعدة التي يبني عليها الفريق محتوى موقعك. كل ما كانت إجاباتك أوضح، المحتوى أقوى.
        </p>
      </header>
      <IntakeForm
        initial={initial}
        intakeUpdatedAt={client?.intakeUpdatedAt ?? null}
        detected={detected}
        industryName={client?.industry?.name ?? null}
        country={client?.addressCountry ?? null}
      />
    </div>
  );
}
