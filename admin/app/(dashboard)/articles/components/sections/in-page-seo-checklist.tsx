'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, Info, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistItem } from '../../helpers/seo-guidance-analyzer';
import type { ArticleFormData } from '@/lib/types/form-types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InPageSEOChecklistProps {
  items: ChecklistItem[];
  onFixIssue?: (field: keyof ArticleFormData, value: any) => void;
  isLoading?: boolean;
}

export function InPageSEOChecklist({ items, onFixIssue, isLoading }: InPageSEOChecklistProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-600">Pass</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-600">Warning</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'info':
        return <Badge variant="outline" className="bg-blue-600">Info</Badge>;
    }
  };

  const getPriorityBadge = (priority: ChecklistItem['priority']) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-yellow-600',
      low: 'bg-gray-600',
    };
    return (
      <Badge variant="outline" className={cn('text-xs', colors[priority])}>
        {priority}
      </Badge>
    );
  };

  const categoryLabels: Record<string, string> = {
    metaTags: 'Meta Tags & Titles',
    content: 'Content Quality',
    images: 'Images & Media',
    structuredData: 'Structured Data',
    technical: 'Technical Elements',
    mobile: 'Mobile & Performance',
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{categoryLabels[category] || category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryItems.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleItem(item.id)}>
                    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{item.label}</span>
                          {getStatusBadge(item.status)}
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.recommendation}</p>
                        {(item.currentValue !== undefined || item.targetValue !== undefined) && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            {item.currentValue !== undefined && (
                              <span>
                                Current: <strong>{item.currentValue}</strong>
                              </span>
                            )}
                            {item.targetValue && (
                              <span>
                                Target: <strong>{item.targetValue}</strong>
                              </span>
                            )}
                          </div>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Show Details
                              </>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="pt-2 border-t space-y-2">
                            {item.field && onFixIssue && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Navigate to the field - this would need to be implemented
                                  // For now, just show a message
                                  console.log('Navigate to field:', item.field);
                                }}
                                className="text-xs"
                              >
                                Go to {item.field}
                              </Button>
                            )}
                            {item.officialSource && (
                              <a
                                href={item.officialSource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              >
                                Official Documentation
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
