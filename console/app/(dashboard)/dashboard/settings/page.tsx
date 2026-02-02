import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsForm } from "./components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { email: true, phone: true, gtmId: true },
  });
  if (!client) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Update your contact info and GTM
        </p>
      </div>
      <SettingsForm
        clientId={clientId}
        initial={{
          email: client.email,
          phone: client.phone,
          gtmId: client.gtmId,
        }}
      />
    </div>
  );
}
