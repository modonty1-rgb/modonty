import { signGoogleReportKey } from "./sign-google-report-key";

/**
 * The one Looker Studio report every client opens (owner: modonty1@gmail.com, shared «Unlisted»,
 * view only). Its data source is our community connector
 * (app/api/google-report/looker-connector/Code.gs); the report shows nothing without a valid key.
 */
const GOOGLE_REPORT_ID = "bac9ee3d-7004-422f-8ddf-ed158b823fe3";

/** The report link for one client: his signed key rides in the report's `ds0.key` parameter. */
export function getGoogleReportUrl(clientId: string): string {
  const params = encodeURIComponent(JSON.stringify({ "ds0.key": signGoogleReportKey(clientId) }));
  return `https://lookerstudio.google.com/reporting/${GOOGLE_REPORT_ID}?params=${params}`;
}
