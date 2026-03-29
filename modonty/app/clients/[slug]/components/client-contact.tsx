"use client";

import { useState } from "react";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Button } from "@/components/ui/button";
import { IconWebsite, IconEmail, IconPhone, IconCopy } from "@/lib/icons";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { trackCtaClick } from "@/lib/cta-tracking";

const CONTACT_TYPE_LABELS: Record<string, string> = {
  "customer service": "خدمة العملاء",
  "technical support": "الدعم الفني",
  sales: "المبيعات",
  support: "الدعم",
};

interface ClientContactProps {
  client: {
    name: string;
    url?: string | null;
    email?: string | null;
    phone?: string | null;
    contactType?: string | null;
    id?: string;
  };
}

export function ClientContact({ client }: ClientContactProps) {
  const [copiedField, setCopiedField] = useState<"email" | "phone" | "url" | null>(null);
  const clientId = client.id;

  const hasContactInfo = client.url || client.email || client.phone;

  if (!hasContactInfo) return null;

  const handleCopy = (text: string, field: "email" | "phone" | "url") => {
    if (clientId) {
      const label =
        field === "url" ? "Contact – copy url" : field === "email" ? "Contact – copy email" : "Contact – copy phone";
      trackCtaClick({ type: "BUTTON", label, targetUrl: "", clientId });
    }
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getWhatsAppNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0")) return "966" + digits.slice(1);
    if (!digits.startsWith("966") && digits.length <= 9) return "966" + digits;
    return digits;
  };

  const contactTypeLabel =
    client.contactType && CONTACT_TYPE_LABELS[client.contactType.toLowerCase()]
      ? CONTACT_TYPE_LABELS[client.contactType.toLowerCase()]
      : client.contactType || null;

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="معلومات الاتصال" icon={IconPhone} />
        {contactTypeLabel && (
          <p className="text-sm text-muted-foreground font-normal mt-1">
            {contactTypeLabel}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {client.url && (
          <div className="flex items-start gap-3">
            <IconWebsite className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CtaTrackedLink
                  href={client.url}
                  label="Contact – website"
                  type="LINK"
                  clientId={clientId}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  الموقع الإلكتروني
                </CtaTrackedLink>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => handleCopy(client.url!, "url")}
                  aria-label="نسخ رابط الموقع"
                >
                  {copiedField === "url" ? (
                    <span className="flex items-center gap-1.5 text-xs text-primary">تم النسخ</span>
                  ) : (
                    <IconCopy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {client.email && (
          <div className="flex items-start gap-3">
            <IconEmail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CtaTrackedLink
                  href={`mailto:${client.email}`}
                  label="Contact – email"
                  type="LINK"
                  clientId={clientId}
                  className="text-primary hover:underline"
                >
                  البريد الإلكتروني
                </CtaTrackedLink>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => handleCopy(client.email!, "email")}
                  aria-label="نسخ البريد الإلكتروني"
                >
                  {copiedField === "email" ? (
                    <span className="flex items-center gap-1.5 text-xs text-primary">تم النسخ</span>
                  ) : (
                    <IconCopy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {client.phone && (
          <>
            <div className="flex items-start gap-3">
              <IconPhone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                  <CtaTrackedLink
                    href={`tel:${client.phone}`}
                    label="Contact – phone"
                    type="LINK"
                    clientId={clientId}
                    className="text-primary hover:underline"
                  >
                    رقم الهاتف
                  </CtaTrackedLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleCopy(client.phone!, "phone")}
                    aria-label="نسخ رقم الهاتف"
                  >
                    {copiedField === "phone" ? (
                      <span className="flex items-center gap-1.5 text-xs text-primary">تم النسخ</span>
                    ) : (
                      <IconCopy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <WhatsAppIcon size={20} className="text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <CtaTrackedLink
                  href={`https://wa.me/${getWhatsAppNumber(client.phone)}`}
                  label="Contact – WhatsApp"
                  type="LINK"
                  clientId={clientId}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  واتساب
                </CtaTrackedLink>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
