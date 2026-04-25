export { getGscClient, GSC_PROPERTY } from "./client";
export { queryAnalytics, getTopQueries, getTopPages, getPerformanceByDate, getPerformanceTotals } from "./analytics";
export { inspectUrl } from "./inspection";
export { listSitemaps, submitSitemap, deleteSitemap } from "./sitemaps";
export type {
  GscDimension, GscSearchType, GscDevice, GscOperator,
  GscFilter, GscAnalyticsRequest, GscAnalyticsResponse, GscRow,
  GscSitemap, GscUrlInspectionResult, GscSite,
} from "./types";
