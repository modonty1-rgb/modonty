"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  errorCount?: number;
  required?: boolean;
}

export function SectionWrapper({
  id,
  title,
  description,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  errorCount = 0,
  required = false,
}: SectionWrapperProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger className="w-full" aria-label={`${title} section`} aria-expanded={isOpen}>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div className="text-left">
                  <CardTitle className="flex items-center gap-2">
                    {title}
                    {required && <span className="text-destructive text-sm">*</span>}
                    {errorCount > 0 && (
                      <span className="text-destructive text-sm font-normal">
                        ({errorCount} error{errorCount > 1 ? "s" : ""})
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0" id={`${id}-content`} aria-describedby={`${id}-description`}>
            <div id={`${id}-description`} className="sr-only">
              {description}
            </div>
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
