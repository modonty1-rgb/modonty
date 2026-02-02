"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pushClientContext, pushPageView } from "../gtm/dataLayer";
import type { ClientContextData, PageViewData } from "../gtm/dataLayer";

interface UseGTMOptions {
  clientContext?: ClientContextData | null;
  articleId?: string;
  pageTitle?: string;
}

export function useGTM(options: UseGTMOptions = {}) {
  const pathname = usePathname();
  const { clientContext, articleId, pageTitle } = options;

  useEffect(() => {
    if (typeof window === "undefined" || !window.dataLayer) {
      return;
    }

    if (clientContext) {
      pushClientContext(clientContext);
    }

    const pageViewData: PageViewData = {
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
  }, [pathname, clientContext, articleId, pageTitle]);
}
