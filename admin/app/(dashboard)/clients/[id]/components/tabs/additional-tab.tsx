"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface AdditionalTabProps {
  client: {
    alternateName: string | null;
    slogan: string | null;
    keywords: string[];
    knowsLanguage: string[];
    businessActivityCode: string | null;
    isicV4: string | null;
    numberOfEmployees: string | null;
    parentOrganization: {
      id: string;
      name: string;
      url: string | null;
      slug: string;
    } | null;
  };
}

export function AdditionalTab({ client }: AdditionalTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Alternate Name</p>
              <p className="text-sm">{client.alternateName || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Slogan</p>
              <p className="text-sm italic">{client.slogan || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div className="md:col-span-2">
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
            <div className="md:col-span-2">
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
          <CardTitle>Business Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Activity Code</p>
              <p className="text-sm font-medium font-mono">
                {client.businessActivityCode || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">ISIC V4 Code</p>
              <p className="text-sm font-medium font-mono">
                {client.isicV4 || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Number of Employees</p>
              <p className="text-sm font-medium">
                {client.numberOfEmployees || <span className="text-muted-foreground italic">Not set</span>}
              </p>
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
                <Link
                  href={`/clients/${client.parentOrganization.id}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {client.parentOrganization.name}
                </Link>
              )
            ) : (
              <p className="text-sm text-muted-foreground italic">Not set</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
