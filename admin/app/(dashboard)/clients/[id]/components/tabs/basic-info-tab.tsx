"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Mail, Phone, MapPin, Users } from "lucide-react";
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Link as LinkIcon,
} from "lucide-react";
import {
  detectPlatform,
  getPlatformName,
  type Platform,
} from "../../../helpers/url-validation";

interface BasicInfoTabProps {
  client: {
    id: string;
    name: string;
    slug: string;
    legalName: string | null;
    alternateName: string | null;
    url: string | null;
    slogan: string | null;
    logoMedia: {
      url: string;
      altText: string | null;
    } | null;
    businessBrief: string | null;
    industry: {
      id: string;
      name: string;
    } | null;
    targetAudience: string | null;
    contentPriorities: string[];
    foundingDate: Date | null;
    email: string | null;
    phone: string | null;
    contactType: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressCountry: string | null;
    addressPostalCode: string | null;
    addressRegion: string | null;
    addressNeighborhood: string | null;
    addressBuildingNumber: string | null;
    addressAdditionalNumber: string | null;
    sameAs: string[];
    commercialRegistrationNumber: string | null;
    vatID: string | null;
    taxID: string | null;
    legalForm: string | null;
    businessActivityCode: string | null;
    isicV4: string | null;
    numberOfEmployees: string | null;
    licenseNumber: string | null;
    licenseAuthority: string | null;
    keywords: string[];
    knowsLanguage: string[];
    organizationType: string | null;
    parentOrganization: {
      id: string;
      name: string;
      url: string | null;
      slug: string;
    } | null;
    _count: {
      articles: number;
    };
  };
}

export function BasicInfoTab({ client }: BasicInfoTabProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:gap-6 lg:items-start">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-4 lg:gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Legal Name</p>
              <p className="text-sm">{client.legalName ? client.legalName : <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Alternate Name</p>
              <p className="text-sm">{client.alternateName || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Slogan</p>
              <p className="text-sm italic">{client.slogan || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Slug</p>
              <p className="font-mono text-sm">{client.slug}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Organization Type</p>
              <p className="text-sm font-medium">{client.organizationType || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Website URL</p>
              {client.url ? (
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {client.url}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div className="lg:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Total Articles</p>
              <Link
                href={`/articles?clientId=${client.id}`}
                className="text-sm text-primary hover:underline font-medium"
              >
                {client._count.articles} {client._count.articles === 1 ? "article" : "articles"}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <div className="lg:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Business Brief</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{client.businessBrief || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Industry</p>
              <p className="text-sm font-medium">{client.industry?.name || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div className="lg:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Target Audience</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{client.targetAudience || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div className="lg:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Content Priorities</p>
              {client.contentPriorities && client.contentPriorities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.contentPriorities.map((priority, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {priority}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Founding Date</p>
              <p className="text-sm font-medium">{client.foundingDate ? format(new Date(client.foundingDate), "MMM d, yyyy") : <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Number of Employees</p>
              <p className="text-sm font-medium">{client.numberOfEmployees || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div className="lg:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Keywords</p>
              {client.keywords && client.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div className="lg:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Languages Supported</p>
              {client.knowsLanguage && client.knowsLanguage.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.knowsLanguage.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saudi Arabia Legal & Registration</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Commercial Registration Number (CR)</p>
              <p className="text-sm font-medium font-mono">{client.commercialRegistrationNumber || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Legal Form</p>
              <p className="text-sm font-medium">{client.legalForm || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">VAT ID (ZATCA)</p>
              <p className="text-sm font-medium font-mono">{client.vatID || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tax ID</p>
              <p className="text-sm font-medium font-mono">{client.taxID || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">License Number</p>
              <p className="text-sm font-medium">{client.licenseNumber || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">License Authority</p>
              <p className="text-sm font-medium">{client.licenseAuthority || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Classification</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Activity Code</p>
              <p className="text-sm font-medium font-mono">{client.businessActivityCode || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">ISIC V4 Code</p>
              <p className="text-sm font-medium font-mono">{client.isicV4 || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {client.parentOrganization ? (
              client.parentOrganization.url ? (
                <a
                  href={client.parentOrganization.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {client.parentOrganization.name}
                </a>
              ) : (
                <p className="text-sm font-medium">{client.parentOrganization.name}</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground italic">Not set</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Email</p>
              </div>
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {client.email}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Phone</p>
              </div>
              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {client.phone}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Contact Type</p>
              </div>
              <p className="text-sm font-medium">{client.contactType || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Address</p>
              </div>
              <div className="space-y-1">
                {client.addressStreet ? (
                  <p className="text-sm">{client.addressStreet}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Street: Not set</p>
                )}
                {(client.addressBuildingNumber || client.addressAdditionalNumber) ? (
                  <p className="text-sm text-muted-foreground">
                    Building: {client.addressBuildingNumber || ""}
                    {client.addressAdditionalNumber ? `-${client.addressAdditionalNumber}` : ""}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Building: Not set</p>
                )}
                {client.addressNeighborhood ? (
                  <p className="text-sm text-muted-foreground">Neighborhood: {client.addressNeighborhood}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Neighborhood: Not set</p>
                )}
                {(client.addressCity || client.addressRegion || client.addressCountry || client.addressPostalCode) ? (
                  <p className="text-sm">
                    {[
                      client.addressCity,
                      client.addressRegion,
                      client.addressCountry,
                      client.addressPostalCode
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">City/Region/Country/Postal Code: Not set</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Profiles</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          {client.sameAs && client.sameAs.length > 0 ? (
            <div className="flex flex-col gap-3">
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
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary group-hover:underline break-all font-medium">
                        {url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{platformName}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Not set</p>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
