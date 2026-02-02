"use client";

export interface ClientContextData {
  client_id: string;
  client_slug: string;
  client_name: string;
}

export interface PageViewData {
  page_title: string;
  page_location: string;
  client_id?: string;
  article_id?: string;
}

export interface CustomEventData {
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

export function pushClientContext(clientData: ClientContextData): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  window.dataLayer.push({
    event: "client_context",
    ...clientData,
  });
}

export function pushPageView(data: PageViewData): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  window.dataLayer.push({
    event: "page_view",
    ...data,
  });
}

export function pushCustomEvent(eventName: string, data: CustomEventData = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  window.dataLayer.push({
    event: eventName,
    ...data,
  });
}