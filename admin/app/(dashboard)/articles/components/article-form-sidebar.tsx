'use client';

import { useMemo } from 'react';
import { useArticleFormStore, getSections } from './article-form-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FileText,
  Edit,
  Link,
  Search,
  Share2,
  Settings,
  Image,
  Tag,
  Code,
  CheckCircle,
} from 'lucide-react';
import { calculateWordCountImproved } from '../helpers/seo-helpers';

const ICONS = {
  basic: FileText,
  content: Edit,
  meta: Link,
  seo: Search,
  social: Share2,
  technical: Settings,
  media: Image,
  tags: Tag,
  'seo-validation': CheckCircle,
  jsonld: Code,
};

export function ArticleFormSidebar() {
  const {
    activeSection,
    setActiveSection,
    sidebarCollapsed,
    toggleSidebar,
    formData,
  } = useArticleFormStore();

  const sections = getSections();

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const wordCount = useMemo(() => {
    if (!formData.content) return 0;
    // Use improved word count function for accurate counting (handles HTML and Arabic)
    return calculateWordCountImproved(formData.content, formData.inLanguage || 'ar');
  }, [formData.content, formData.inLanguage]);

  return (
    <aside
      className={cn(
        'border-l bg-card h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 overflow-hidden flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-80',
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              'font-semibold text-sm transition-opacity',
              sidebarCollapsed && 'opacity-0 w-0 overflow-hidden',
            )}
          >
            Sections
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              'h-8 w-8 rounded-md shrink-0 hover:bg-muted border border-border',
              'flex items-center justify-center transition-colors',
              sidebarCollapsed && 'mx-auto',
            )}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sections.map((section) => {
          const Icon = ICONS[section.id as keyof typeof ICONS];
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={cn(
                'flex items-center rounded-md text-sm font-medium transition-colors w-full',
                sidebarCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              title={sidebarCollapsed ? section.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && (
                <span className="whitespace-nowrap text-left">{section.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer - Quick Stats */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Words:</span>
            <span className="font-medium">{wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium">{formData.status}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
