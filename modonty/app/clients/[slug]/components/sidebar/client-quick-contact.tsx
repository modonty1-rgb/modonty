"use client";

import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { SectionCard } from "@/app/clients/[slug]/components/sections/section-card";
import { IconPhone, IconEmail } from "@/lib/icons";

interface ClientQuickContactProps {
  phone: string | null;
  email: string | null;
  clientId?: string;
}

/**
 * Sidebar «تواصل سريع» — phone + email rows. WhatsApp lives in the floating FAB
 * (desktop) / mobile dock instead, so it isn't duplicated here.
 * Client island so the tel/mailto taps fire CTA tracking. Hides when the
 * partner has neither phone nor email.
 */
export function ClientQuickContact({ phone, email, clientId }: ClientQuickContactProps) {
  if (!phone && !email) return null;

  return (
    <SectionCard id="quick-contact" icon="⚡" title="تواصل سريع">
      <div className="flex flex-col gap-[9px]">
        {phone && (
          <CtaTrackedLink
            href={`tel:${phone}`}
            label="Quick – tel"
            type="LINK"
            clientId={clientId}
            className="flex items-center gap-[11px] rounded-md border bg-card p-[11px] transition-colors hover:bg-muted"
          >
            <span
              className="grid h-[35px] w-[35px] shrink-0 place-items-center rounded-[9px] bg-primary/[0.08] text-primary"
              aria-hidden
            >
              <IconPhone className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <b className="block text-[9.5px] font-bold text-muted-foreground">اتصال</b>
              <span className="block truncate text-[12.5px] font-bold text-foreground">{phone}</span>
            </span>
          </CtaTrackedLink>
        )}

        {email && (
          <CtaTrackedLink
            href={`mailto:${email}`}
            label="Quick – mail"
            type="LINK"
            clientId={clientId}
            className="flex items-center gap-[11px] rounded-md border bg-card p-[11px] transition-colors hover:bg-muted"
          >
            <span
              className="grid h-[35px] w-[35px] shrink-0 place-items-center rounded-[9px] bg-accent/15 text-accent-foreground"
              aria-hidden
            >
              <IconEmail className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <b className="block text-[9.5px] font-bold text-muted-foreground">البريد</b>
              <span className="block truncate text-[12.5px] font-bold text-foreground">{email}</span>
            </span>
          </CtaTrackedLink>
        )}
      </div>
    </SectionCard>
  );
}
