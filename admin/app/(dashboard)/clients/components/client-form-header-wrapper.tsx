"use client";

import React, { useRef, createContext, useContext } from "react";
import { ClientFormHeader, ClientFormHeaderRef } from "./client-form-header";

const HeaderRefContext = createContext<React.RefObject<ClientFormHeaderRef | null> | null>(null);

export function useHeaderRef() {
  const ref = useContext(HeaderRefContext);
  if (!ref) {
    throw new Error("useHeaderRef must be used within ClientFormHeaderWrapper");
  }
  return ref;
}

interface ClientFormHeaderWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ClientFormHeaderWrapper({ title, description, children }: ClientFormHeaderWrapperProps) {
  const headerRef = useRef<ClientFormHeaderRef>(null);

  return (
    <HeaderRefContext.Provider value={headerRef}>
      <ClientFormHeader ref={headerRef} title={title} description={description} />
      {children}
    </HeaderRefContext.Provider>
  );
}
