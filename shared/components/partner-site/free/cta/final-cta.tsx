import { WhatsAppIcon } from "../../../icons/whatsapp-icon";
import { cn } from "../../../../lib/utils/index";
import { WHATSAPP_GREEN } from "../../parts/whatsapp-button";
import type { HomeData } from "../home/home-data";

/** «النداء الأخير» — a brand-colour band with one line and the WhatsApp button (Tailwind "CTA section"). */
export function FinalCta({ data }: { data: HomeData; preview?: boolean }) {
  const btn = (
    <span className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold" style={{ color: WHATSAPP_GREEN }}>
      <WhatsAppIcon size={16} /> راسلنا على واتساب
    </span>
  );
  return (
    <section id="cta" className="px-6 py-8">
      <div className={cn("mx-auto flex max-w-[1128px] flex-wrap items-center justify-between gap-6 rounded-lg px-8 py-8 text-white", !data.primaryColor && "bg-primary")} style={data.primaryColor ? { backgroundColor: data.primaryColor } : undefined}>
        <div>
          <p className="text-2xl font-bold leading-tight">جاهز تبدأ مع {data.name}؟</p>
          <p className="mt-1 text-sm text-white/80">اترك رسالة ونردّ عليك في نفس اليوم.</p>
        </div>
        {data.whatsappHref ? <a href={data.whatsappHref} target="_blank" rel="noopener noreferrer">{btn}</a> : btn}
      </div>
    </section>
  );
}
