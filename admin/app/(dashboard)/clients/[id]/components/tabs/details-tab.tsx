"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  detectPlatform,
  getPlatformName,
  type Platform,
} from "../../../helpers/url-validation";

interface DetailsTabProps {
  client: {
    id: string;
    name: string;
    slug: string;
    legalName: string | null;
    url: string | null;
    logoMedia: {
      url: string;
      altText: string | null;
    } | null;
    ogImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    twitterImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    email: string;
    phone: string | null;
    sameAs: string[];
    seoTitle: string | null;
    seoDescription: string | null;
    description: string | null;
    businessBrief: string | null;
    industry: {
      id: string;
      name: string;
    } | null;
    targetAudience: string | null;
    contentPriorities: string[];
    subscriptionTier: string | null;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    articlesPerMonth: number | null;
    subscriptionTierConfig?: {
      id: string;
      tier: string;
      name: string;
      articlesPerMonth: number;
      price: number;
      isPopular: boolean;
    } | null;
    subscriptionStatus: string;
    paymentStatus: string;
    contactType: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressCountry: string | null;
    addressPostalCode: string | null;
    canonicalUrl: string | null;
    twitterCard: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterSite: string | null;
    gtmId: string | null;
    foundingDate: Date | null;
    _count: {
      articles: number;
    };
  };
}

const getTierName = (tier: string | null): string => {
  if (!tier) return "Not Set";
  switch (tier) {
    case "BASIC":
      return "Basic";
    case "STANDARD":
      return "Standard";
    case "PRO":
      return "Pro";
    case "PREMIUM":
      return "Premium";
    default:
      return tier;
  }
};

export function DetailsTab({ client }: DetailsTabProps) {
  const [basicOpen, setBasicOpen] = useState(true);
  const [businessOpen, setBusinessOpen] = useState(true);
  const [subscriptionOpen, setSubscriptionOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(true);
  const [seoOpen, setSeoOpen] = useState(true);

  return (
    <div className="space-y-4">
      <Collapsible open={basicOpen} onOpenChange={setBasicOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle>Basic Information</CardTitle>
              {basicOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-medium">{client.name}</p>
              </div>
              {client.legalName && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Legal Name</p>
                  <p className="text-sm">{client.legalName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Slug</p>
                <p className="font-mono text-sm">{client.slug}</p>
              </div>
              {client.url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">URL</p>
                  <a
                    href={client.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {client.url}
                  </a>
                </div>
              )}
              {client.logoMedia?.url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Logo</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={client.logoMedia.url}
                      alt={client.logoMedia.altText || `${client.name} logo`}
                      className="h-24 w-24 rounded object-contain"
                    />
                  </div>
                  {client.logoMedia.altText && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Alt: {client.logoMedia.altText}
                    </p>
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Articles</p>
                <Link
                  href={`/articles?clientId=${client.id}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {client._count.articles} {client._count.articles === 1 ? "article" : "articles"}
                </Link>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle>Business Details</CardTitle>
              {businessOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {client.businessBrief && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Business Brief</p>
                  <p className="text-sm whitespace-pre-wrap">{client.businessBrief}</p>
                </div>
              )}
              {client.industry && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Industry</p>
                  <p className="text-sm">{client.industry.name}</p>
                </div>
              )}
              {client.targetAudience && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Target Audience</p>
                  <p className="text-sm whitespace-pre-wrap">{client.targetAudience}</p>
                </div>
              )}
              {client.contentPriorities && client.contentPriorities.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Content Priorities</p>
                  <p className="text-sm">{client.contentPriorities.join(", ")}</p>
                </div>
              )}
              {client.foundingDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Founding Date</p>
                  <p className="text-sm">{format(new Date(client.foundingDate), "MMM d, yyyy")}</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={subscriptionOpen} onOpenChange={setSubscriptionOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle>Subscription & Billing</CardTitle>
              {subscriptionOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {client.subscriptionTier && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Subscription Tier</p>
                  <Badge variant="outline" className="text-sm">
                    {getTierName(client.subscriptionTier)}
                  </Badge>
                </div>
              )}
              {client.subscriptionStartDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Subscription Start Date</p>
                  <p className="text-sm">{format(new Date(client.subscriptionStartDate), "MMM d, yyyy")}</p>
                </div>
              )}
              {client.subscriptionEndDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Subscription End Date</p>
                  <p className="text-sm">{format(new Date(client.subscriptionEndDate), "MMM d, yyyy")}</p>
                </div>
              )}
              {(client.articlesPerMonth !== null || client.subscriptionTierConfig) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Articles Per Month</p>
                  <p className="text-sm">
                    {client.articlesPerMonth !== null
                      ? client.articlesPerMonth
                      : client.subscriptionTierConfig?.articlesPerMonth || 0}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subscription Status</p>
                <Badge
                  variant={
                    client.subscriptionStatus === "ACTIVE"
                      ? "default"
                      : client.subscriptionStatus === "EXPIRED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {client.subscriptionStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <Badge
                  variant={
                    client.paymentStatus === "PAID"
                      ? "default"
                      : client.paymentStatus === "OVERDUE"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {client.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={contactOpen} onOpenChange={setContactOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle>Contact & Branding</CardTitle>
              {contactOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {client.email && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <a
                    href={`tel:${client.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {client.phone}
                  </a>
                </div>
              )}
              {client.contactType && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Type</p>
                  <p className="text-sm">{client.contactType}</p>
                </div>
              )}
              {(client.addressStreet ||
                client.addressCity ||
                client.addressCountry ||
                client.addressPostalCode) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Address</p>
                    <div className="space-y-1">
                      {client.addressStreet && (
                        <p className="text-sm">{client.addressStreet}</p>
                      )}
                      {(client.addressCity || client.addressCountry || client.addressPostalCode) && (
                        <p className="text-sm">
                          {[client.addressCity, client.addressCountry, client.addressPostalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              {client.sameAs && client.sameAs.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Social Profiles</p>
                  <div className="flex flex-col gap-2">
                    {client.sameAs.map((url, index) => {
                      const platform = detectPlatform(url);
                      const platformName = getPlatformName(platform);

                      const platformIcons: Record<
                        Platform,
                        React.ComponentType<{ className?: string }>
                      > = {
                        linkedin: Linkedin,
                        twitter: Twitter,
                        facebook: Facebook,
                        instagram: Instagram,
                        youtube: Youtube,
                        tiktok: Music,
                        other: LinkIcon,
                      };

                      const Icon = platformIcons[platform] || LinkIcon;

                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors group"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-primary group-hover:underline break-all">
                              {url}
                            </p>
                            <p className="text-xs text-muted-foreground">{platformName}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              {client.ogImageMedia?.url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">OG Image</p>
                  <div className="space-y-2">
                    <img
                      src={client.ogImageMedia.url}
                      alt={client.ogImageMedia.altText || `${client.name} OG image`}
                      className="h-32 w-32 rounded object-cover"
                    />
                    <a
                      href={client.ogImageMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block"
                    >
                      {client.ogImageMedia.url}
                    </a>
                    {client.ogImageMedia.altText && (
                      <p className="text-xs text-muted-foreground">Alt: {client.ogImageMedia.altText}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle>SEO & Tracking</CardTitle>
              {seoOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {client.seoTitle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Title</p>
                  <p className="text-sm">{client.seoTitle}</p>
                </div>
              )}
              {client.seoDescription && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SEO Description</p>
                  <p className="text-sm">{client.seoDescription}</p>
                </div>
              )}
              {client.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Organization Description</p>
                  <p className="text-sm whitespace-pre-wrap">{client.description}</p>
                </div>
              )}
              {client.canonicalUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Canonical URL</p>
                  <a
                    href={client.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {client.canonicalUrl}
                  </a>
                </div>
              )}
              {(client.twitterCard ||
                client.twitterTitle ||
                client.twitterDescription ||
                client.twitterImageMedia?.url ||
                client.twitterImageMedia?.altText ||
                client.twitterSite) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Twitter Cards</p>
                    {client.twitterCard && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Twitter Card Type</p>
                        <p className="text-sm">{client.twitterCard}</p>
                      </div>
                    )}
                    {client.twitterTitle && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Twitter Title</p>
                        <p className="text-sm">{client.twitterTitle}</p>
                      </div>
                    )}
                    {client.twitterDescription && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Twitter Description</p>
                        <p className="text-sm">{client.twitterDescription}</p>
                      </div>
                    )}
                    {client.twitterImageMedia?.url && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Twitter Image</p>
                        <a
                          href={client.twitterImageMedia.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {client.twitterImageMedia.url}
                        </a>
                        {client.twitterImageMedia.altText && (
                          <p className="text-xs text-muted-foreground mt-1">Alt: {client.twitterImageMedia.altText}</p>
                        )}
                      </div>
                    )}
                    {client.twitterSite && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Twitter Site</p>
                        <p className="text-sm">{client.twitterSite}</p>
                      </div>
                    )}
                  </div>
                )}
              {client.gtmId && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Google Tag Manager ID</p>
                  <p className="text-sm font-mono">{client.gtmId}</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
