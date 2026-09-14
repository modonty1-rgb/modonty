import { SocialFacebookOutline } from "@modonty/shared/components/icons/facebook";
import { Instagram } from "@modonty/shared/components/icons/instagram";
import { Linkedin } from "@modonty/shared/components/icons/linkedin";
import { RoundSnapchat } from "@modonty/shared/components/icons/snapchat";
import { TiktokLogoLight } from "@modonty/shared/components/icons/tiktok";
import { Twitter } from "@modonty/shared/components/icons/twitter";
import { Whatsapp } from "@modonty/shared/components/icons/whatsapp";
import { Youtube } from "@modonty/shared/components/icons/youtube";

import type { SocialLink } from "@/app/data/get-site-chrome";

/**
 * حسابات المنصّة — صفٌّ من الأيقونات.
 *
 * مكانه ترويسة **الأوفرفيو وحدها** (خالد ١٤ سبتمبر ٢٠٢٦): هناك الزائر يتعرّف على
 * المنصّة، فحساباتها دليلُ وجودٍ يطمئنه. وفي صفحة الباقات هي مخرجٌ قبل الشراء — فحُذفت
 * من هناك مع التذييل كلّه.
 *
 * والقائمة مغلقة: ما ليس في الإعدادات لا يُرسم، فلا أيقونة تقود إلى صفحةٍ لا وجود لها.
 */

/**
 * نوع الأيقونة مأخوذٌ من أيقونةٍ فعليّة لا مكتوبٌ بـ`SVGProps` من `react` هنا: الحزمة
 * المشتركة تحلّ نسخة `@types/react` أخرى، فالتوقيعان متطابقان شكلاً ويرفضهما `tsc`
 * (٢٤ خطأ TS2322 حين كُتب يدوياً). و`typeof` يأخذ نوع المصدر نفسه فلا نسختين.
 */
type SocialIcon = typeof Twitter;

/** الأيقونة تُرى، والاسم يبقى في `aria-label` لقارئ الشاشة. */
const SOCIAL: Record<string, { label: string; Icon: SocialIcon }> = {
  x: { label: "X", Icon: Twitter },
  instagram: { label: "إنستقرام", Icon: Instagram },
  linkedin: { label: "لينكدإن", Icon: Linkedin },
  facebook: { label: "فيسبوك", Icon: SocialFacebookOutline },
  tiktok: { label: "تيك توك", Icon: TiktokLogoLight },
  youtube: { label: "يوتيوب", Icon: Youtube },
  snapchat: { label: "سناب شات", Icon: RoundSnapchat },
  whatsapp: { label: "قناة واتساب", Icon: Whatsapp },
};

export function SocialRow({ socials }: { socials: SocialLink[] }) {
  if (socials.length === 0) return null;

  return (
    <nav aria-label="حسابات مدونتي" className="flex items-center gap-0.5">
      {socials.map((s) => {
        const entry = SOCIAL[s.name];
        if (!entry) return null;
        const { label, Icon } = entry;
        return (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={label}
            title={label}
            className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            <Icon className="size-[17px]" aria-hidden />
          </a>
        );
      })}
    </nav>
  );
}
