import type { JsonLdValidationReport } from "@modonty/shared/lib/seo/client/types";

// Flatten validator errors (Adobe + Ajv + custom) into readable Arabic-friendly strings.
export function reportErrorMessages(report: JsonLdValidationReport | null | undefined): string[] {
  if (!report) return [];
  const groups = [report.adobe, report.ajv, report.custom];
  const out: string[] = [];
  for (const g of groups) {
    const errs = g?.errors;
    if (!Array.isArray(errs)) continue;
    for (const e of errs) {
      if (typeof e === "string") {
        out.push(e);
      } else if (e && typeof e === "object") {
        const o = e as Record<string, unknown>;
        const msg = o.message ?? o.error ?? o.keyword;
        const path = typeof o.instancePath === "string" && o.instancePath ? ` (${o.instancePath})` : "";
        out.push(typeof msg === "string" ? `${msg}${path}` : JSON.stringify(e));
      }
    }
  }
  return out;
}
