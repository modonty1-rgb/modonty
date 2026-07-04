import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, MapPinIcon, StarIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { getWhatsAppLink } from "@/lib/whatsapp";

interface ClientCardProps {
  name: string;
  slug: string;
  logoUrl?: string | null;
  heroUrl?: string | null;
  slogan?: string | null;
  addressCity?: string | null;
  /** 0 = hide */
  averageRating?: number;
  articleCount: number;
  /** GA4 digital impact total (pageViews+sessions+activeUsers+events). 0 = hide */
  googleTotal?: number;
  phone?: string | null;
  /** Pass true for the first 3 cards to eager-load the cover */
  priority?: boolean;
}

const compact = new Intl.NumberFormat("ar-SA", { notation: "compact", maximumFractionDigits: 1 });

export function ClientCard({
  name,
  slug,
  logoUrl,
  heroUrl,
  slogan,
  addressCity,
  averageRating = 0,
  articleCount,
  googleTotal = 0,
  phone,
  priority = false,
}: ClientCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
      {/* Overlay link — covers entire card for profile navigation */}
      <Link href={`/clients/${slug}`} className="absolute inset-0 z-0" aria-label={name} />

      {/* Cover 6:1 */}
      <div className="relative w-full aspect-[6/1] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0">
        {heroUrl && (
          <Image
            src={heroUrl}
            alt={name}
            fill
            priority={priority}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        {/* Identity: logo + name + slogan */}
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-[42px] h-[42px] rounded-xl border border-border/50 bg-muted overflow-hidden">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`شعار ${name}`}
                width={42}
                height={42}
                className="object-contain w-full h-full p-1"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-base font-black text-primary/40">
                {name.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {name}
            </h2>
            {slogan && (
              <p className="text-xs text-muted-foreground truncate">{slogan}</p>
            )}
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {addressCity && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
              <MapPinIcon className="h-2.5 w-2.5 shrink-0" />
              {addressCity}
            </span>
          )}
          {averageRating > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <StarIcon className="h-2.5 w-2.5 shrink-0 fill-current" />
              {averageRating.toFixed(1)}
            </span>
          )}
          <span className="inline-flex items-center text-[11px] font-semibold text-muted-foreground/70 bg-muted/40 px-2 py-0.5 rounded-full">
            {articleCount} مقال
          </span>
          {googleTotal > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 shrink-0" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {compact.format(googleTotal)} الأثر الرقمي
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border -mx-4" />

        {/* CTA */}
        <div className="flex gap-2">
          {phone ? (
            <>
              <a
                href={getWhatsAppLink(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 px-3 py-2 text-xs font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
              >
                <WhatsAppIcon size={13} />
                تواصل واتساب
              </a>
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
                <ChevronLeftIcon className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </>
          ) : (
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/8 px-3 py-2 text-xs font-bold text-primary">
              عرض الملف الكامل
              <ChevronLeftIcon className="h-3.5 w-3.5 rtl:rotate-180" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
