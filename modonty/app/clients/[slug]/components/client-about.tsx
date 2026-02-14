import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { MapPin } from "lucide-react";

interface ClientAboutProps {
  client: {
    name: string;
    addressLatitude?: number | null;
    addressLongitude?: number | null;
  };
}

export function ClientAbout({ client }: ClientAboutProps) {
  return (
    <div className="space-y-6 mt-0">
      {client.addressLatitude != null && client.addressLongitude != null && (
        <Card>
          <CardHeader>
            <CardTitleWithIcon title="خريطة الموقع" icon={MapPin} />
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 md:h-72 rounded-lg overflow-hidden border border-border">
              <iframe
                title={`خريطة موقع ${client.name}`}
                src={`https://www.google.com/maps?q=${client.addressLatitude},${client.addressLongitude}&hl=ar&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
