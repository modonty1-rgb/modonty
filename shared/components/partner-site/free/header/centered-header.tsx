import { BrandLogo } from "../../parts/brand-logo";
import { VerifiedBadge } from "../../parts/verified-badge";
import { WhatsAppButton } from "../../parts/whatsapp-button";
import { NavLinks } from "./parts/nav-links";
import { PhoneLine } from "./parts/phone-line";
import { MobileMenu } from "./parts/mobile-menu";
import type { HeaderData } from "./header-data";

/**
 * «المركزي» — two rows: logo in the true centre (phone start · WhatsApp text link end),
 * then the links centred under a hairline. Three grid columns, no absolute positioning,
 * so a long phone number can never overlap the logo.
 */
export function CenteredHeader({ data }: { data: HeaderData }) {
  return (
    <header className="relative border-b bg-background">
      {/* تحت `lg` سطر الهاتف مخفيّ، فالعمود الأوّل يبقى فارغاً — ومع `1fr_auto_1fr`
          يحجز الفارغُ نفس عرض عمود البرغر لأن القسمة متساوية. المقيس على آيفون ٣٩٠:
          الاسم يحصل على ٧٩px فيُبتَر هو والسطر تحته. `auto` للطرفين يعطي الفارغ صفراً
          والاسم ما تبقّى (≈٢٩٨px)؛ ومن `lg` فصاعداً — حيث الهاتف يظهر فعلاً — تعود
          الشبكة المتساوية كما هي، فبصمة الديسكتوب ١٢٨٠ لا تتغيّر. */}
      <div className="mx-auto grid h-16 max-w-[1128px] grid-cols-[auto_minmax(0,1fr)_auto] items-center px-6 lg:grid-cols-[1fr_auto_1fr]">
        <PhoneLine phone={data.phone} className="hidden justify-self-start text-muted-foreground lg:flex" />
        <a href={data.homeHref} className="min-w-0 max-md:flex max-md:min-h-11 max-md:items-center">
          <BrandLogo name={data.name} tagline={data.tagline} logoUrl={data.logoUrl} size="standard" />
        </a>
        <div className="flex items-center justify-self-end">
          <WhatsAppButton href={data.whatsappHref} variant="text" className="hidden md:inline-flex" />
          <MobileMenu data={data} />
        </div>
      </div>
      {/* الشارة في صفّ الروابط لا في الصفّ الأوّل: الصفّ الأوّل شبكة ثلاثية، وأيّ عمود
          يكبر يقضم عرض الاسم — وهو المقيس ٧٩px على آيفون ٣٩٠ الذي أُصلح للتوّ. */}
      <div className="hidden border-t md:block">
        <div className="mx-auto flex h-11 max-w-[1128px] items-center justify-center gap-6 px-6">
          <NavLinks links={data.links} gap="gap-10" />
          <VerifiedBadge />
        </div>
      </div>
    </header>
  );
}
