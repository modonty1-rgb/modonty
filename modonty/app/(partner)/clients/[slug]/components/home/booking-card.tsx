import { headers } from "next/headers";
import { ClientCtaMode } from "@prisma/client";
import { auth } from "@/lib/auth";
import { BookingForm } from "@/components/shared/booking-form/BookingForm";
import { WhatsAppAction } from "@/components/shared/whatsapp-action/WhatsAppAction";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { IconExternal } from "@/lib/icons";

interface BookingCardProps {
  clientId: string;
  clientName: string;
  phone: string | null;
  ctaMode: ClientCtaMode;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

/**
 * The hero's request card — the partner's real lead channel, chosen by his ctaMode:
 * FORM → the shared BookingForm (phone · name · note → «اطلب اتصال») · LINK → his own
 * booking link · NONE → WhatsApp only. Reads session + geo, so it renders behind a
 * Suspense boundary and the hero above it stays in the static shell.
 */
export async function BookingCard({ clientId, clientName, phone, ctaMode, ctaLabel, ctaUrl }: BookingCardProps) {
  if (ctaMode === ClientCtaMode.FORM) {
    const [session, h] = await Promise.all([auth(), headers()]);
    const user = session?.user ? { name: session.user.name ?? null, email: session.user.email ?? null } : null;
    return (
      <div id="request" className="scroll-mt-32 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-baseline justify-between">
          <p className="text-lg font-bold text-foreground">اطلب اتصالاً</p>
          <span className="text-xs text-green-600 dark:text-green-400">● يردّ في نفس اليوم</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">اترك رقمك ويتواصل معك فريق {clientName}.</p>
        <div className="mt-4">
          <BookingForm
            clientId={clientId}
            clientName={clientName}
            source="client_page"
            user={user}
            defaultCountry={h.get("x-vercel-ip-country")}
          />
        </div>
        {phone ? (
          <div className="mt-3 flex justify-center">
            <WhatsAppAction phone={phone} clientId={clientId} clientName={clientName} source="client_page" variant="quiet" label="أو كلّمه واتساب" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div id="request" className="scroll-mt-32 rounded-2xl border border-border bg-card p-6 shadow-2xl">
      <p className="text-lg font-bold text-foreground">تواصل مع {clientName}</p>
      <p className="mt-1 text-sm text-muted-foreground">اختر الطريقة الأسهل لك.</p>
      <div className="mt-5 flex flex-col gap-3">
        {ctaMode === ClientCtaMode.LINK && ctaUrl ? (
          <CtaTrackedLink
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            label={`Partner hero — ${ctaLabel ?? "cta"}`}
            type="BANNER"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white hover:brightness-110"
          >
            {ctaLabel ?? "احجز الآن"}
            <IconExternal className="h-4 w-4" aria-hidden />
          </CtaTrackedLink>
        ) : null}
        {phone ? (
          <WhatsAppAction phone={phone} clientId={clientId} clientName={clientName} source="client_page" variant="solid" label="كلّمه واتساب" className="w-full" />
        ) : null}
      </div>
    </div>
  );
}

/** Same footprint as the card so the hero doesn't jump when the real one streams in. */
export function BookingCardSkeleton() {
  return <div className="h-[420px] rounded-2xl border border-border bg-card/60" aria-hidden />;
}
