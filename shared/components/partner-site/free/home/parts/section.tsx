import { cn } from "../../../../../lib/utils/index";

interface SectionProps {
  id?: string;
  /** Small eyebrow above the heading («خدماتنا»). */
  eyebrow?: string;
  heading?: string;
  /** One supporting sentence under the heading. */
  description?: string;
  /** Muted background band to alternate rhythm between blocks. */
  tone?: "plain" | "muted";
  className?: string;
  children: React.ReactNode;
}

/**
 * حاوية كل قسم في موقع الشريك: عرض ١١٢٨ · حافة ٢٤ · إيقاع رأسي واحد · نمط عنوان واحد.
 *
 * الإيقاع صار سُلَّماً لا رقماً ثابتاً (٣١ أغسطس): كان ٦٤px فوق وتحت على الجوّال كما على
 * الديسكتوب، فتضخّمت الصفحة إلى ٤٢٥٧px على ٣٩٠ — أي أن الزائر يمرّر فراغاً بمقدار ثلث
 * شاشة بين كل قسمين. ٤٨ على الجوّال · ٦٤ من `md`، ومن هذا الملفّ وحده.
 */
export function Section({ id, eyebrow, heading, description, tone = "plain", className, children }: SectionProps) {
  return (
    // Two muted bands back to back read as one grey slab — on the home page video · services ·
    // booking were three in a row (4 Oct 2026). A muted section that directly follows another
    // muted one drops its tint, so the rhythm alternates whatever the partner switched off.
    <section
      id={id}
      data-tone={tone}
      className={cn(tone === "muted" && "bg-muted/30 [[data-tone=muted]+&]:bg-transparent", className)}
    >
      <div className="mx-auto max-w-[1128px] px-6 py-[var(--ps-section-y,3rem)] md:py-[var(--ps-section-y-md,4rem)]">
        {(eyebrow || heading) && (
          <div className="mb-10">
            {eyebrow && <p className="text-sm font-medium text-[hsl(var(--primary-ink,var(--primary)))]">{eyebrow}</p>}
            {heading && <h2 className="mt-1 max-w-2xl text-balance text-2xl font-bold leading-tight text-foreground md:text-3xl">{heading}</h2>}
            {description && <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
