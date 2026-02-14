import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { ClientAbout } from "../client-about";
import { ClientContact } from "../client-contact";
import { Briefcase, BookOpen, Building2, Calendar, Users as UsersIcon } from "lucide-react";
import type { ClientPageClient } from "./types";

interface ClientPageLeftProps {
  client: ClientPageClient;
}

export function ClientPageLeft({ client }: ClientPageLeftProps) {
  return (
    <div className="w-full min-w-0 order-2 lg:order-1 space-y-4 pt-4">
      {client.businessBrief && (
        <Card>
          <CardHeader>
            <CardTitleWithIcon title="ملخص الأعمال" icon={Briefcase} />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {client.businessBrief}
            </p>
          </CardContent>
        </Card>
      )}

      {(client.description || client.seoDescription) && (
        <Card>
          <CardHeader>
            <CardTitleWithIcon title={`نبذة عن ${client.name}`} icon={BookOpen} />
          </CardHeader>
          <CardContent>
            {client.slogan && (
              <p className="text-primary font-medium mb-3 border-s border-primary ps-3 text-sm" dir="rtl">
                {client.slogan}
              </p>
            )}
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
              {client.description || client.seoDescription}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitleWithIcon title="معلومات الشركة" icon={Building2} />
        </CardHeader>
        <CardContent className="space-y-3">
          {client.legalName && client.legalName !== client.name && (
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">الاسم القانوني</p>
                <p className="text-sm font-medium">{client.legalName}</p>
              </div>
            </div>
          )}
          {client.alternateName && (
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">الاسم التجاري / البديل</p>
                <p className="text-sm font-medium">{client.alternateName}</p>
              </div>
            </div>
          )}
          {client.industry && (
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">الصناعة</p>
                <p className="text-sm font-medium">{client.industry.name}</p>
              </div>
            </div>
          )}
          {client.foundingDate && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">تاريخ التأسيس</p>
                <p className="text-sm font-medium">
                  {new Date(client.foundingDate).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
          {client.numberOfEmployees && (
            <div className="flex items-start gap-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">حجم الشركة</p>
                <p className="text-sm font-medium">{client.numberOfEmployees} موظف</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientContact client={client} />
      <ClientAbout client={client} />
    </div>
  );
}
