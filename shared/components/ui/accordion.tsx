"use client";

import * as React from "react";
import { IconChevronDown } from "../../lib/icons";
import { cn } from "../../lib/utils/index";

interface AccordionContextValue {
  value: string | null;
  onValueChange: (value: string | null) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
  defaultValue?: string;
}

function Accordion({ type = "single", collapsible = true, className, children, defaultValue }: AccordionProps) {
  const [value, setValue] = React.useState<string | null>(defaultValue || null);

  const onValueChange = React.useCallback((newValue: string | null) => {
    if (type === "single") {
      setValue((prev) => (prev === newValue && collapsible ? null : newValue));
    }
  }, [type, collapsible]);

  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const AccordionItemContext = React.createContext<{ value: string } | undefined>(undefined);

function AccordionItem({ value, className, children }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn("border-b", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  if (!context) throw new Error("AccordionTrigger must be used within Accordion");
  if (!itemContext) throw new Error("AccordionTrigger must be used within AccordionItem");

  const isOpen = context.value === itemContext.value;

  return (
    <button
      type="button"
      className={cn(
        "flex flex-1 w-full items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
      onClick={() => context.onValueChange(isOpen ? null : itemContext.value)}
      aria-expanded={isOpen}
      // The panel now stays mounted (see AccordionContent), so `aria-expanded` finally has a
      // panel to point at — a screen reader can announce what this button controls.
      aria-controls={`${itemContext.value}-panel`}
    >
      {children}
      <IconChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

interface AccordionContentProps {
  className?: string;
  /**
   * Keep the closed panel in the DOM and hide it with CSS instead of unmounting it.
   *
   * Set this wherever the page ships structured data naming this content. `/help/faq` and a
   * partner page both emit `FAQPage` JSON-LD listing every answer, while the default unmount
   * left those answers out of the HTML entirely — Google: "Don't mark up content that is not
   * visible to readers of the page." The article FAQ already hides with CSS
   * (`FaqCollapsibleBody.tsx:48`); this is the same behavior for the shared primitive.
   *
   * It stays opt-in because the default is right for the admin: `article-form-sections.tsx:77`
   * mounts a whole form section per panel, and mounting all six at once would change what the
   * form does, not just what it shows.
   */
  keepMounted?: boolean;
  children: React.ReactNode;
}

function AccordionContent({ className, keepMounted = false, children }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  if (!context) throw new Error("AccordionContent must be used within Accordion");
  if (!itemContext) throw new Error("AccordionContent must be used within AccordionItem");

  const isOpen = context.value === itemContext.value;

  if (!isOpen && !keepMounted) return null;

  // `hidden` keeps the panel out of the a11y tree and out of find-in-page, so a closed panel
  // behaves for a reader exactly as an unmounted one did — the difference is only that the
  // text now exists in the HTML the crawler receives.
  return (
    <div
      id={`${itemContext.value}-panel`}
      className={cn("overflow-hidden text-sm transition-all pb-4 pt-0", !isOpen && "hidden", className)}
    >
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
