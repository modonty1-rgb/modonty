"use client";

import { useState, useEffect } from "react";
import { ShareClientButton } from "./share-client-button";

interface ShareClientButtonWrapperProps {
  clientName: string;
  clientUrl: string;
}

export function ShareClientButtonWrapper(props: ShareClientButtonWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render loading skeleton on server, actual component on client after hydration
  if (!isMounted) {
    return (
      <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
    );
  }

  return <ShareClientButton {...props} />;
}
