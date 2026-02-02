"use client";

import { useEffect } from "react";
import { pushClientContext, pushPageView } from "@/helpers/gtm/dataLayer";
import type { ClientContextData } from "@/helpers/gtm/dataLayer";

interface GTMClientTrackerProps {
  clientContext: ClientContextData | null;
  articleId?: string;
  pageTitle?: string;
}

export function GTMClientTracker({ clientContext, articleId, pageTitle }: GTMClientTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.dataLayer) {
      return;
    }

    if (clientContext) {
      pushClientContext(clientContext);
    }

    const pageViewData: {
      page_title: string;
      page_location: string;
      client_id?: string;
      article_id?: string;
    } = {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    };

    if (clientContext) {
      pageViewData.client_id = clientContext.client_id;
    }

    if (articleId) {
      pageViewData.article_id = articleId;
    }

    pushPageView(pageViewData);
  }, [clientContext, articleId, pageTitle]);

  return null;
}
