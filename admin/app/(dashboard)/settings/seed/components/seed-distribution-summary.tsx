/**
 * Seed Distribution Summary Component
 * Displays status, length, and complete data generation summaries
 */

"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface DistributionData {
  total: number;
  statuses: { published: number; draft: number; writing: number; scheduled: number };
  lengths: { short: number; medium: number; long: number };
  core: {
    industries: number;
    clients: number;
    categories: number;
    tags: number;
    authors: number;
  };
  articles: {
    articles: number;
    articleTags: number;
    media: number;
    analytics: number;
    faqs: number;
    relatedArticles: number;
    articleVersions: number;
    articleMedia: number;
  };
  interactions: {
    comments: number;
    clientComments: number;
    articleLikes: number;
    articleDislikes: number;
    clientLikes: number;
    clientDislikes: number;
    commentLikes: number;
    commentDislikes: number;
  };
  tracking: {
    articleViews: number;
    clientViews: number;
    shares: number;
    conversions: number;
    ctaClicks: number;
    campaignTracking: number;
    leadScoring: number;
    engagementDuration: number;
    articleLinkClicks: number;
  };
  other: {
    subscribers: number;
  };
}

interface SeedDistributionSummaryProps {
  distributions: DistributionData;
}

export function SeedDistributionSummary({ distributions }: SeedDistributionSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-lg border">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Complete Data Generation Summary
            </p>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status distribution
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-semibold text-foreground">{distributions.total}</span>
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">Published:</span> {distributions.statuses.published}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Draft:</span> {distributions.statuses.draft}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Writing:</span> {distributions.statuses.writing}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Scheduled:</span> {distributions.statuses.scheduled}
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Length distribution
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">Short:</span> {distributions.lengths.short}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Medium:</span> {distributions.lengths.medium}
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Long:</span> {distributions.lengths.long}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Core Entities</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Industries:</span> {distributions.core.industries}
              </li>
              <li>
                <span className="font-medium text-foreground">Clients:</span> ~{distributions.core.clients}
              </li>
              <li>
                <span className="font-medium text-foreground">Categories:</span> {distributions.core.categories}
              </li>
              <li>
                <span className="font-medium text-foreground">Tags:</span> {distributions.core.tags}
              </li>
              <li>
                <span className="font-medium text-foreground">Authors:</span> {distributions.core.authors}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Article Data</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Articles:</span> {distributions.articles.articles}
              </li>
              <li>
                <span className="font-medium text-foreground">Article Tags:</span> ~{distributions.articles.articleTags}
              </li>
              <li>
                <span className="font-medium text-foreground">Media Files:</span> ~{distributions.articles.media}
              </li>
              <li>
                <span className="font-medium text-foreground">Analytics:</span> ~{distributions.articles.analytics}
              </li>
              <li>
                <span className="font-medium text-foreground">FAQs:</span> ~{distributions.articles.faqs}
              </li>
              <li>
                <span className="font-medium text-foreground">Related Articles:</span> ~{distributions.articles.relatedArticles}
              </li>
              <li>
                <span className="font-medium text-foreground">Article Versions:</span> ~{distributions.articles.articleVersions}
              </li>
              <li>
                <span className="font-medium text-foreground">Article Media:</span> ~{distributions.articles.articleMedia}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Interactions</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Comments:</span> ~{distributions.interactions.comments}
              </li>
              <li>
                <span className="font-medium text-foreground">Client Comments:</span> ~{distributions.interactions.clientComments}
              </li>
              <li>
                <span className="font-medium text-foreground">Article Likes:</span> ~{distributions.interactions.articleLikes}
              </li>
              <li>
                <span className="font-medium text-foreground">Article Dislikes:</span> ~{distributions.interactions.articleDislikes}
              </li>
              <li>
                <span className="font-medium text-foreground">Client Likes:</span> ~{distributions.interactions.clientLikes}
              </li>
              <li>
                <span className="font-medium text-foreground">Client Dislikes:</span> ~{distributions.interactions.clientDislikes}
              </li>
              <li>
                <span className="font-medium text-foreground">Comment Likes:</span> ~{distributions.interactions.commentLikes}
              </li>
              <li>
                <span className="font-medium text-foreground">Comment Dislikes:</span> ~{distributions.interactions.commentDislikes}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Tracking & Analytics</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Article Views:</span> ~{distributions.tracking.articleViews}
              </li>
              <li>
                <span className="font-medium text-foreground">Client Views:</span> ~{distributions.tracking.clientViews}
              </li>
              <li>
                <span className="font-medium text-foreground">Shares:</span> ~{distributions.tracking.shares}
              </li>
              <li>
                <span className="font-medium text-foreground">Conversions:</span> ~{distributions.tracking.conversions}
              </li>
              <li>
                <span className="font-medium text-foreground">CTA Clicks:</span> ~{distributions.tracking.ctaClicks}
              </li>
              <li>
                <span className="font-medium text-foreground">Campaign Tracking:</span> ~{distributions.tracking.campaignTracking}
              </li>
              <li>
                <span className="font-medium text-foreground">Lead Scoring:</span> ~{distributions.tracking.leadScoring}
              </li>
              <li>
                <span className="font-medium text-foreground">Engagement Duration:</span> ~{distributions.tracking.engagementDuration}
              </li>
              <li>
                <span className="font-medium text-foreground">Article Link Clicks:</span> ~{distributions.tracking.articleLinkClicks}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Other</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Subscribers:</span> ~{distributions.other.subscribers}
              </li>
            </ul>
          </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </>
  );
}
