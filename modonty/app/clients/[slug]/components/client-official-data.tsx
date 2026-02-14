import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Scale, Building2, Hash, Briefcase, Languages } from "lucide-react";

interface ClientOfficialDataProps {
  client: {
    commercialRegistrationNumber?: string | null;
    legalForm?: string | null;
    vatID?: string | null;
    taxID?: string | null;
    organizationType?: string | null;
    knowsLanguage?: string[] | null;
    addressStreet?: string | null;
    addressBuildingNumber?: string | null;
    addressAdditionalNumber?: string | null;
    addressNeighborhood?: string | null;
    addressCity?: string | null;
    addressRegion?: string | null;
    addressPostalCode?: string | null;
    addressCountry?: string | null;
    licenseNumber?: string | null;
    licenseAuthority?: string | null;
  };
}

function OfficialRow({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`text-base font-medium ${dir === "ltr" ? "font-mono" : ""}`} dir={dir || "rtl"}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ClientOfficialData({ client }: ClientOfficialDataProps) {
  const addressParts = [
    client.addressBuildingNumber && `مبنى ${client.addressBuildingNumber}`,
    client.addressAdditionalNumber && `رقم إضافي ${client.addressAdditionalNumber}`,
    client.addressStreet,
    client.addressNeighborhood,
    client.addressCity,
    client.addressRegion,
    client.addressPostalCode && `الرمز البريدي ${client.addressPostalCode}`,
    client.addressCountry,
  ].filter(Boolean);

  const hasAny =
    client.commercialRegistrationNumber ||
    client.legalForm ||
    client.vatID ||
    client.taxID ||
    client.organizationType ||
    (client.knowsLanguage && client.knowsLanguage.length > 0) ||
    addressParts.length > 0 ||
    client.licenseNumber;

  if (!hasAny) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="البيانات الرسمية" icon={FileCheck} />
      </CardHeader>
      <CardContent className="space-y-4">
        {client.commercialRegistrationNumber && (
          <OfficialRow
            icon={FileCheck}
            label="رقم السجل التجاري"
            value={client.commercialRegistrationNumber}
            dir="ltr"
          />
        )}
        {client.legalForm && (
          <OfficialRow icon={Scale} label="النوع القانوني" value={client.legalForm} />
        )}
        {client.organizationType && (
          <OfficialRow
            icon={Briefcase}
            label="نوع المنظمة"
            value={client.organizationType}
          />
        )}
        {client.knowsLanguage && client.knowsLanguage.length > 0 && (
          <div className="flex items-start gap-3">
            <Languages className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1.5">اللغات</p>
              <div className="flex flex-wrap gap-1">
                {client.knowsLanguage.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        {client.vatID && (
          <OfficialRow icon={Hash} label="الرقم الضريبي" value={client.vatID} dir="ltr" />
        )}
        {client.taxID && (
          <OfficialRow icon={Hash} label="الرقم الضريبي / الزكاة" value={client.taxID} dir="ltr" />
        )}
        {addressParts.length > 0 && (
          <OfficialRow
            icon={Building2}
            label="العنوان"
            value={addressParts.join("، ")}
          />
        )}
        {client.licenseNumber && (
          <OfficialRow
            icon={FileCheck}
            label="رقم الترخيص"
            value={
              client.licenseAuthority
                ? `${client.licenseNumber} (${client.licenseAuthority})`
                : client.licenseNumber
            }
            dir="ltr"
          />
        )}
      </CardContent>
    </Card>
  );
}
