import { Menu, X, Phone } from "lucide-react";

import { cn } from "../../../../../lib/utils/index";
import { WhatsAppButton } from "../../../parts/whatsapp-button";
import type { HeaderData } from "../header-data";

interface MobileMenuProps {
  data: HeaderData;
  light?: boolean;
}

/**
 * The phone menu every header shares below `md`: a hamburger that opens a full-width
 * panel with the links, the phone and WhatsApp. Native <details>/<summary> — no client
 * JS, works before hydration, and the panel is part of the sticky chrome so it slides
 * with it. Icons swap with CSS on the open state.
 */
export function MobileMenu({ data, light = false }: MobileMenuProps) {
  return (
    <details className="group md:hidden">
      <summary
        aria-label="القائمة"
        className={cn(
          "grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full [&::-webkit-details-marker]:hidden",
          light ? "text-white" : "text-foreground",
        )}
      >
        <Menu className="h-6 w-6 group-open:hidden" aria-hidden />
        <X className="hidden h-6 w-6 group-open:block" aria-hidden />
      </summary>
      <div className="absolute inset-x-0 top-full z-20 border-b bg-background shadow-lg">
        <nav aria-label="الصفحات" className="mx-auto max-w-[1128px] px-6 py-2">
          <ul className="divide-y">
            {data.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="block py-3 text-base font-medium text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 py-4">
            <WhatsAppButton href={data.whatsappHref} />
            {data.phone && (
              <a href={`tel:${data.phone}`} className="inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium max-md:h-11">
                <Phone className="h-4 w-4" aria-hidden /> <span dir="ltr">{data.phone}</span>
              </a>
            )}
          </div>
        </nav>
      </div>
    </details>
  );
}
