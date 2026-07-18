import { cache } from "react";

import { getVisitorActionsSummary } from "@/app/(dashboard)/analytics/actions/get-visitor-actions";
import { getClientStatusCounts } from "@/app/(dashboard)/actions/client-status-counts";
import { getArticleStatusCounts } from "@/app/(dashboard)/actions/article-status-counts";
import { getSubscriberCounts } from "@/app/(dashboard)/actions/subscriber-counts";

/**
 * Per-request dedup for the dashboard. The Today strip ranks the same numbers the
 * sections below it display, so both sides MUST come from one fetch — cache() makes
 * the second caller free, and it makes disagreement impossible (the strip saying 16
 * while the card says 15 would be a bug you can never debug).
 */
export const visitorActionsSummary = cache(getVisitorActionsSummary);
export const clientStatusCounts = cache(getClientStatusCounts);
export const articleStatusCounts = cache(getArticleStatusCounts);
export const subscriberCounts = cache(getSubscriberCounts);
