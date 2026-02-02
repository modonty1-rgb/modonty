"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CopyableId } from "./copyable-id";

interface FieldLabelProps {
  label: string;
  fieldPath: string;
  fieldType: string;
  idValue?: string;
  idLabel?: string;
  className?: string;
  value?: string | null;
}

const LICENSE_INFO: Record<string, { name: string; description: string; url: string }> = {
  "CC BY": {
    name: "Attribution (CC BY)",
    description: "Allows distribution, remix, adapt, and build upon your work, even commercially, as long as credit is given. Most accommodating license.",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  "CC BY-SA": {
    name: "Attribution-ShareAlike (CC BY-SA)",
    description: "Allows remix, adapt, and build upon your work commercially, as long as credit is given and new works are licensed under identical terms.",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "CC BY-NC": {
    name: "Attribution-NonCommercial (CC BY-NC)",
    description: "Allows remix, adapt, and build upon your work non-commercially, as long as credit is given.",
    url: "https://creativecommons.org/licenses/by-nc/4.0/",
  },
  "CC BY-ND": {
    name: "Attribution-NoDerivs (CC BY-ND)",
    description: "Allows redistribution, commercial and non-commercial, as long as the work is unchanged and credit is given.",
    url: "https://creativecommons.org/licenses/by-nd/4.0/",
  },
  "CC BY-NC-SA": {
    name: "Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)",
    description: "Allows remix, adapt, and build upon your work non-commercially, as long as credit is given and new works are licensed under identical terms.",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
  "CC BY-NC-ND": {
    name: "Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)",
    description: "Most restrictive license. Allows download and sharing with credit, but no changes or commercial use.",
    url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
  },
  "CC0": {
    name: "CC0 (Public Domain Dedication)",
    description: "Waives all copyright and related rights, placing the work in the public domain. Free for any use without restriction.",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  "All Rights Reserved": {
    name: "All Rights Reserved",
    description: "Copyright holder reserves all rights. No use allowed without explicit permission.",
    url: "",
  },
};

export function FieldLabel({
  label,
  fieldPath,
  fieldType,
  idValue,
  idLabel,
  className,
  value,
}: FieldLabelProps) {
  const isLicenseField = fieldPath === "article.license";
  const licenseValue = value || idValue || "";
  const licenseInfo = isLicenseField && licenseValue ? LICENSE_INFO[licenseValue] : null;

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-muted"
          >
            <Info className="h-3 w-3 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`${isLicenseField ? "w-96" : "w-80"} max-h-[80vh] overflow-y-auto`} align="start" side="right">
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Field Path</p>
                <p className="text-sm font-mono font-medium break-all">{fieldPath}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Type</p>
                <p className="text-sm font-mono break-all">{fieldType}</p>
              </div>
            </div>
            {isLicenseField && licenseInfo && (
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-1">License Information</p>
                <p className="text-sm font-medium mb-1">{licenseInfo.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{licenseInfo.description}</p>
                {licenseInfo.url && (
                  <a
                    href={licenseInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View official documentation →
                  </a>
                )}
              </div>
            )}
            {isLicenseField && !licenseInfo && (
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Common License Types</p>
                <div className="space-y-1 text-xs">
                  <p>• CC BY - Attribution (most open)</p>
                  <p>• CC BY-SA - Attribution-ShareAlike</p>
                  <p>• CC BY-NC - Attribution-NonCommercial</p>
                  <p>• CC0 - Public Domain</p>
                  <p className="text-muted-foreground mt-2">Visit creativecommons.org for full details</p>
                </div>
              </div>
            )}
            {idValue && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {idLabel || "ID"}
                </p>
                <CopyableId id={idValue} label={idLabel || "ID"} variant="compact" />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
