import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Users as UsersIcon, MapPin, FileCheck, Scale } from "lucide-react";

interface ClientAboutProps {
  client: {
    name: string;
    description?: string | null;
    seoDescription?: string | null;
    foundingDate?: Date | null;
    industry?: { name: string } | null;
    numberOfEmployees?: string | null;
    legalForm?: string | null;
    commercialRegistrationNumber?: string | null;
    addressCity?: string | null;
    addressRegion?: string | null;
    addressCountry?: string | null;
  };
}

export function ClientAbout({ client }: ClientAboutProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const description = client.description || client.seoDescription;
  const location = [client.addressCity, client.addressRegion, client.addressCountry]
    .filter(Boolean)
    .join('، ');

  return (
    <div className="space-y-6">
      {/* Description */}
      {description && (
        <Card>
          <CardHeader>
            <CardTitle>نبذة عن {client.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Company Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.industry && (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">الصناعة</p>
                <p className="text-base font-medium">{client.industry.name}</p>
              </div>
            </div>
          )}

          {client.foundingDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">تاريخ التأسيس</p>
                <p className="text-base font-medium">{formatDate(client.foundingDate)}</p>
              </div>
            </div>
          )}

          {client.numberOfEmployees && (
            <div className="flex items-start gap-3">
              <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">حجم الشركة</p>
                <p className="text-base font-medium">{client.numberOfEmployees} موظف</p>
              </div>
            </div>
          )}

          {location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">الموقع</p>
                <p className="text-base font-medium">{location}</p>
              </div>
            </div>
          )}

          {client.legalForm && (
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">النوع القانوني</p>
                <p className="text-base font-medium">{client.legalForm}</p>
              </div>
            </div>
          )}

          {client.commercialRegistrationNumber && (
            <div className="flex items-start gap-3">
              <FileCheck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">رقم السجل التجاري</p>
                <p className="text-base font-medium font-mono" dir="ltr">
                  {client.commercialRegistrationNumber}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
