"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
    >
      {children}
      <ChevronDown
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
  children: React.ReactNode;
}

function AccordionContent({ className, children }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  if (!context) throw new Error("AccordionContent must be used within Accordion");
  if (!itemContext) throw new Error("AccordionContent must be used within AccordionItem");

  const isOpen = context.value === itemContext.value;

  if (!isOpen) return null;

  return (
    <div className={cn("overflow-hidden text-sm transition-all pb-4 pt-0", className)}>
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
