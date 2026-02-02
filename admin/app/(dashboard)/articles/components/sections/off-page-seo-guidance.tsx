'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Link2, Share2, FileText, Award } from 'lucide-react';
import type { OffPageRecommendation } from '../../helpers/seo-guidance-analyzer';

interface OffPageSEOGuidanceProps {
  recommendations: OffPageRecommendation[];
}

const categoryIcons = {
  'link-building': Link2,
  'social-signals': Share2,
  'content-distribution': FileText,
  'authority-building': Award,
};

const categoryLabels = {
  'link-building': 'Link Building',
  'social-signals': 'Social Signals',
  'content-distribution': 'Content Distribution',
  'authority-building': 'Authority Building',
};

export function OffPageSEOGuidance({ recommendations }: OffPageSEOGuidanceProps) {
  const grouped = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<OffPageRecommendation['category'], OffPageRecommendation[]>);

  const getPriorityColor = (priority: OffPageRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        <p>
          Off-page SEO focuses on factors outside your website that influence search rankings.
          These recommendations are based on your current article configuration.
        </p>
      </div>

      {Object.entries(grouped).map(([category, items]) => {
        const categoryKey = category as keyof typeof categoryIcons;
        const Icon = categoryIcons[categoryKey];
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {categoryLabels[categoryKey]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    {item.actionable && item.steps.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Action Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {item.steps.map((step, index) => (
                            <li key={index} className="text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {!item.actionable && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Already configured</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No specific recommendations at this time.</p>
            <p className="text-xs mt-2">
              Continue optimizing your article content and settings for better off-page SEO opportunities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
