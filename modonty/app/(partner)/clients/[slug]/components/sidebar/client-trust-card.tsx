"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconExternal } from "@/lib/icons";

import { SectionCard } from "../sections/section-card";

interface ClientTrustCardProps {
  name: string;
  legalName: string | null;
  commercialRegistrationNumber: string | null;
  issuingAuthority: string | null;
  vatID: string | null;
  addressLine: string | null;
  foundingDate: Date | null;
  verificationImageUrl: string | null;
  maaroofUrl: string | null;
  verifiedAt: Date | null;
}

// Mockup .tshield / .mShield — gold-standard shield (no lucide barrel; tiny inline svg).
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// One «.vRow» — key on the start, value on the end, dashed divider.
function VRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-border py-2.5 text-[12.5px] last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-extrabold text-foreground">{value}</span>
    </div>
  );
}

/**
 * Green-tinted trust card (sidebar) — «موثّق من مدوّنتي» badge + a Dialog showing
 * the verified official credentials (legal name · CR · authority · VAT · address ·
 * founding year) + an optional Maarouf external CTA + a verified-date note.
 * Renders nothing when the client has no CR, no legal name, and no verification image.
 */
export function ClientTrustCard({
  name,
  legalName,
  commercialRegistrationNumber,
  issuingAuthority,
  vatID,
  addressLine,
  foundingDate,
  verificationImageUrl,
  maaroofUrl,
  verifiedAt,
}: ClientTrustCardProps) {
  const [open, setOpen] = useState(false);

  if (!commercialRegistrationNumber && !legalName && !verificationImageUrl) {
    return null;
  }

  const foundingYear = foundingDate
    ? new Intl.DateTimeFormat("ar-SA-u-nu-latn", { year: "numeric" }).format(
        foundingDate
      )
    : null;

  const verifiedDate = verifiedAt
    ? new Intl.DateTimeFormat("en-CA").format(verifiedAt)
    : null;

  const rows: { label: string; value: string }[] = [];
  if (legalName) rows.push({ label: "الاسم القانوني", value: legalName });
  if (commercialRegistrationNumber)
    rows.push({
      label: "رقم السجل التجاري",
      value: commercialRegistrationNumber,
    });
  rows.push({
    label: "الجهة المُصدِرة",
    value: issuingAuthority ?? "وزارة التجارة",
  });
  if (vatID) rows.push({ label: "الرقم الضريبي", value: vatID });
  if (addressLine) rows.push({ label: "المقر الرسمي", value: addressLine });
  if (foundingYear) rows.push({ label: "سنة التأسيس", value: foundingYear });

  return (
    <SectionCard
      id="trust"
      icon="🛡️"
      title="التوثيق"
      className="border-success/30 bg-gradient-to-br from-success/[0.08] to-accent/[0.07]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
          <ShieldIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h4 className="text-[13.5px] font-extrabold text-foreground">
            موثّق من مدوّنتي
          </h4>
          {commercialRegistrationNumber && (
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              سجل تجاري {commercialRegistrationNumber} · نشط
            </p>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1.5 h-auto p-0 text-[11.5px] font-extrabold text-primary hover:bg-transparent hover:underline"
              >
                عرض التوثيق ›
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
              {/* gradient header */}
              <div className="flex items-center gap-3 bg-gradient-to-l from-foreground to-primary p-4 text-white">
                <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-white/[0.18]">
                  <ShieldIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-black text-white">
                    توثيق {name}
                  </DialogTitle>
                  <span className="text-[11px] text-white/85">
                    بيانات رسمية موثّقة من مدوّنتي
                  </span>
                </div>
              </div>

              {/* body */}
              <div className="p-4">
                {rows.map((r) => (
                  <VRow key={r.label} label={r.label} value={r.value} />
                ))}

                {maaroofUrl && (
                  <a
                    href={maaroofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3.5 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-[13px] font-extrabold text-white"
                  >
                    تحقّق رسمياً عبر «معروف»
                    <IconExternal className="h-4 w-4" />
                  </a>
                )}

                {verifiedDate && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-success">
                    <ShieldIcon className="h-[13px] w-[13px] shrink-0" />
                    تحقّقت مدوّنتي من هذه البيانات بتاريخ {verifiedDate}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SectionCard>
  );
}
