import { WhatsAppAction } from "@/components/shared/whatsapp-action/WhatsAppAction";

interface FinalCtaProps {
  clientId: string;
  clientName: string;
  phone: string | null;
}

/** The last word on the page: one line, two buttons — request a call, or WhatsApp. */
export function FinalCta({ clientId, clientName, phone }: FinalCtaProps) {
  return (
    <section className="mx-auto max-w-[1216px] px-4">
      <div className="rounded-lg bg-primary p-10 text-white">
        <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold leading-tight">جاهز تبدأ مع {clientName}؟</h2>
            <p className="mt-2 text-white/85">اترك رقمك أو كلّمه واتساب — يردّ عليك في نفس اليوم.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a href="#request" className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-primary hover:bg-white/90">
              اطلب اتصالاً
            </a>
            {phone ? <WhatsAppAction phone={phone} clientId={clientId} clientName={clientName} source="client_page" variant="solid" label="واتساب" /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
