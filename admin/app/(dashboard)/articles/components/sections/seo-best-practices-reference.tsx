'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function BestPracticesReference() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sections = [
    {
      id: 'google-updates-2025',
      title: '2025 Google SEO Updates',
      description: 'Latest changes to Google Search algorithms and guidelines',
      content: (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Simplified Search Results</h4>
            <p className="text-muted-foreground mb-2">
              Google has removed support for infrequently used structured data types:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Course Info</li>
              <li>Claim Review</li>
              <li>Estimated Salary</li>
              <li>Learning Video</li>
              <li>Special Announcement</li>
              <li>Vehicle Listing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Helpful Content System</h4>
            <p className="text-muted-foreground">
              The Helpful Content System has been integrated into Google's core ranking systems.
              Focus on creating content that demonstrates first-hand experience and expertise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">JavaScript Execution</h4>
            <p className="text-muted-foreground">
              Google has clarified that pages with non-200 HTTP status codes may not be sent for rendering,
              which can affect indexing.
            </p>
          </div>
          <a
            href="https://developers.google.com/search/updates"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
          >
            Official Google Search Updates
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      id: 'core-web-vitals',
      title: 'Core Web Vitals (2025 Targets)',
      description: 'Performance metrics that affect search rankings',
      content: (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-1">LCP (Largest Contentful Paint)</h4>
              <p className="text-xs text-muted-foreground">
                <Badge variant="default" className="mr-1">Good: &lt; 2.5s</Badge>
                <Badge variant="secondary" className="mr-1">Needs Improvement: &lt; 4.0s</Badge>
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-1">INP (Interaction to Next Paint)</h4>
              <p className="text-xs text-muted-foreground">
                <Badge variant="default" className="mr-1">Good: &lt; 200ms</Badge>
                <Badge variant="secondary" className="mr-1">Needs Improvement: &lt; 500ms</Badge>
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-1">CLS (Cumulative Layout Shift)</h4>
              <p className="text-xs text-muted-foreground">
                <Badge variant="default" className="mr-1">Good: &lt; 0.1</Badge>
                <Badge variant="secondary" className="mr-1">Needs Improvement: &lt; 0.25</Badge>
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-1">TTFB (Time to First Byte)</h4>
              <p className="text-xs text-muted-foreground">
                <Badge variant="default" className="mr-1">Good: &lt; 800ms</Badge>
                <Badge variant="secondary" className="mr-1">Needs Improvement: &lt; 1.8s</Badge>
              </p>
            </div>
          </div>
          <a
            href="https://web.dev/vitals/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
          >
            Core Web Vitals Documentation
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      id: 'schema-org-article',
      title: 'Schema.org Article (2025)',
      description: 'Structured data requirements for articles',
      content: (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Flexible Data Model</h4>
            <p className="text-muted-foreground mb-2">
              Schema.org Article has no strict mandatory fields. However, these key properties are recommended:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li><strong>headline</strong> - Article title</li>
              <li><strong>author</strong> - Article author (Person or Organization)</li>
              <li><strong>datePublished</strong> - Publication date</li>
              <li><strong>dateModified</strong> - Last modified date</li>
              <li><strong>mainEntityOfPage</strong> - Primary URL</li>
              <li><strong>image</strong> - Article image</li>
              <li><strong>publisher</strong> - Publishing organization</li>
              <li><strong>description</strong> - Article summary</li>
            </ul>
          </div>
          <a
            href="https://schema.org/Article"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
          >
            Schema.org Article Documentation
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      id: 'eeat',
      title: 'E-E-A-T Guidelines',
      description: 'Experience, Expertise, Authoritativeness, Trustworthiness',
      content: (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-2">For Authors</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Credentials (degrees, certifications, qualifications)</li>
              <li>Expertise areas (topics of specialization)</li>
              <li>Verification status</li>
              <li>Social profiles (LinkedIn, Twitter, etc.)</li>
              <li>Organization affiliation</li>
              <li>Years of experience</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">For Content</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Author attribution</li>
              <li>Publication date</li>
              <li>Last reviewed date (content freshness)</li>
              <li>Source citations</li>
              <li>Content depth indicators</li>
              <li>Publishing organization</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'mobile-first',
      title: 'Mobile-First Indexing',
      description: 'Requirements for mobile-optimized content',
      content: (
        <div className="space-y-3 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Responsive design (works on all device sizes)</li>
            <li>Mobile content equals desktop content (no content differences)</li>
            <li>Touch-friendly elements (minimum 44x44px touch targets)</li>
            <li>Fast mobile page speed</li>
            <li>No intrusive interstitials</li>
            <li>Mobile-friendly navigation</li>
            <li>Readable text (no horizontal scrolling)</li>
          </ul>
          <a
            href="https://developers.google.com/search/docs/essentials/mobile-friendly"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
          >
            Mobile-Friendly Guidelines
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      id: 'voice-search',
      title: 'Voice Search Optimization',
      description: 'Optimizing for voice search queries',
      content: (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-2">FAQ Schema</h4>
            <p className="text-muted-foreground">
              Use FAQPage schema with 3+ questions to enable FAQ rich results and voice search optimization.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Natural Language</h4>
            <p className="text-muted-foreground">
              Write content in a conversational, natural language style that matches how people speak.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Speakable Schema</h4>
            <p className="text-muted-foreground">
              Consider using Speakable schema to mark content suitable for audio playback.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'ai-search',
      title: 'AI Search Optimization (SGE)',
      description: 'Optimizing for Search Generative Experience',
      content: (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Content Quality</h4>
            <p className="text-muted-foreground">
              Focus on high-quality, comprehensive content that directly answers user questions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Structured Data</h4>
            <p className="text-muted-foreground">
              Use proper structured data (JSON-LD) to help AI understand your content better.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">E-E-A-T Signals</h4>
            <p className="text-muted-foreground">
              Strong E-E-A-T signals help content appear in AI-generated search results.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">
        <p>
          Reference guide for latest 2025 SEO best practices based on official documentation from
          Google, Schema.org, and industry standards.
        </p>
      </div>

      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        return (
          <Card key={section.id}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{section.description}</CardDescription>
                    </div>
                    <ChevronDown
                      className={cn('h-5 w-5 text-muted-foreground transition-transform', {
                        'transform rotate-180': isExpanded,
                      })}
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">{section.content}</CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
