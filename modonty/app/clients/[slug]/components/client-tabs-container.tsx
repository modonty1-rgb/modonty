"use client";

import { useState, useEffect } from "react";
import { ClientTabsWrapper } from "./client-tabs-wrapper";

interface ClientTabsContainerProps {
  articles: any[];
  articlesCount: number;
  client: any;
  relatedClients: any[];
}

export function ClientTabsContainer(props: ClientTabsContainerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render nothing on server, render on client after hydration
  if (!isMounted) {
    return (
      <div className="w-full">
        <div className="grid w-full grid-cols-3 mb-6 h-10 bg-muted rounded-md animate-pulse" />
        <div className="space-y-6">
          <div className="h-64 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return <ClientTabsWrapper {...props} />;
}
