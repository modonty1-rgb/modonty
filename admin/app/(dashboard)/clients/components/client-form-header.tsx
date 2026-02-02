"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { PageHeader } from "@/components/shared/page-header";

export interface ClientFormHeaderRef {
  setSEODoctor: (node: React.ReactNode) => void;
  setActionButtons: (buttons: React.ReactNode) => void;
}

interface ClientFormHeaderProps {
  title: string;
  description?: string;
}

export const ClientFormHeader = forwardRef<ClientFormHeaderRef, ClientFormHeaderProps>(
  ({ title, description }, ref) => {
    const [seoDoctor, setSEODoctor] = useState<React.ReactNode>(null);
    const [actionButtons, setActionButtons] = useState<React.ReactNode>(null);

    useImperativeHandle(ref, () => ({
      setSEODoctor,
      setActionButtons,
    }));

    return (
      <div className="sticky top-0 z-40 bg-background border-b pb-6 mb-6 pt-6 -mx-6 px-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Title - 25% (1 column) */}
          <div className="col-span-1">
            <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          
          {/* SEO Doctor - 75% (3 columns) */}
          <div className="col-span-3 relative">
            {seoDoctor}
          </div>
        </div>
      </div>
    );
  }
);

ClientFormHeader.displayName = "ClientFormHeader";
