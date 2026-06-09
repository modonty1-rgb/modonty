import { CtaTrackedLink } from "@/components/cta-tracked-link";

interface ClientFooterCtaProps {
  clientId?: string;
}

export function ClientFooterCta({ clientId }: ClientFooterCtaProps) {
  return (
    <div className="rounded-lg bg-gradient-to-l from-foreground to-primary p-[22px] text-center">
      <h3 className="text-[17px] font-black text-white">نشاطك التجاري يستحق نفس الحضور</h3>
      <p className="mt-[5px] mb-[14px] text-[12.5px] text-white/[.88]">
        انضم لشركاء مدوّنتي واجعل Google يجلب لك العملاء — بلا إعلانات.
      </p>
      <CtaTrackedLink
        href="https://www.jbrseo.com"
        target="_blank"
        rel="noopener noreferrer"
        label="Client Page CTA — عملاء بلا إعلانات"
        type="BANNER"
        clientId={clientId}
        className="inline-flex items-center gap-1.5 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-white/90"
      >
        عملاء بلا إعلانات <span aria-hidden="true">↗</span>
      </CtaTrackedLink>
    </div>
  );
}
