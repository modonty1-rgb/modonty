"use client";

import { createContext, useContext, useRef, useState, useMemo, useEffect } from "react";
import { Article, Section } from "../helpers/article-view-types";
import { getArticleSections } from "../helpers/sections";
import { scrollToSection } from "../helpers/scroll-utils";

interface ArticleViewContextType {
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
  activeSection: string;
  sections: Section[];
  handleScrollToSection: (sectionId: string) => void;
}

const ArticleViewContext = createContext<ArticleViewContextType | null>(null);

export function useArticleView() {
  const context = useContext(ArticleViewContext);
  if (!context) {
    throw new Error("useArticleView must be used within ArticleViewProvider");
  }
  return context;
}

interface ArticleViewProviderProps {
  article: Article;
  children: React.ReactNode;
}

export function ArticleViewProvider({ article, children }: ArticleViewProviderProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const sections = useMemo(() => getArticleSections(article), [article]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach((section) => {
      const element = sectionRefs.current[section.id];
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = sectionRefs.current[section.id];
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sections]);

  const handleScrollToSection = (sectionId: string) => {
    scrollToSection(sectionId, sectionRefs.current);
  };

  return (
    <ArticleViewContext.Provider
      value={{
        sectionRefs,
        activeSection,
        sections,
        handleScrollToSection,
      }}
    >
      {children}
    </ArticleViewContext.Provider>
  );
}
