import { useEffect, RefObject } from "react";
import { Section } from "./article-view-types";

interface UseIntersectionObserverProps {
  sections: Section[];
  sectionRefs: RefObject<{ [key: string]: HTMLElement | null }>;
  onSectionChange: (sectionId: string) => void;
  rootMargin?: string;
  threshold?: number;
}

export function useIntersectionObserver({
  sections,
  sectionRefs,
  onSectionChange,
  rootMargin = "-100px 0px -66%",
  threshold = 0,
}: UseIntersectionObserverProps) {
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const element = sectionRefs.current?.[section.id];
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              onSectionChange(section.id);
            }
          });
        },
        {
          rootMargin,
          threshold,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sections, sectionRefs, onSectionChange, rootMargin, threshold]);
}
