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
      <div className="sticky top-0 z-40 bg-background border-b -mx-6 px-6">
        <div className="flex items-center gap-4 h-12">
          <h1 className="text-base font-semibold leading-tight shrink-0">{title}</h1>
          <div className="flex-1 relative">
            {seoDoctor}
          </div>
          {actionButtons && (
            <div className="flex items-center gap-3 shrink-0">
              {actionButtons}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ClientFormHeader.displayName = "ClientFormHeader";
