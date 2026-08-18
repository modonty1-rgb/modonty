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

/** Every home block sits in this: ≤ 1128px container, 64px vertical rhythm, one heading pattern. */
export function Section({ id, eyebrow, heading, description, tone = "plain", className, children }: SectionProps) {
  return (
    <section id={id} className={cn(tone === "muted" && "bg-muted/30", className)}>
      <div className="mx-auto max-w-[1128px] px-6 py-16">
        {(eyebrow || heading) && (
          <div className="mb-10">
            {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
            {heading && <h2 className="mt-1 max-w-2xl text-2xl font-bold leading-tight text-foreground md:text-3xl">{heading}</h2>}
            {description && <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
