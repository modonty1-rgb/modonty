/**
 * DNS records check using Node's `dns` module — no external API.
 *
 * Reports:
 *  - A records present
 *  - MX records present (optional but recommended for email)
 *  - TXT records (looks for SPF + DMARC)
 */

import { promises as dns } from "node:dns";
import type { HealthCheckResult } from "./types";

const TIMEOUT_MS = 4000;

function withTimeout<T>(p: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout`)), TIMEOUT_MS)
    ),
  ]);
}

export async function checkDns(host: string): Promise<HealthCheckResult[]> {
  const cleanHost = host.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

  const [aResult, mxResult, txtResult] = await Promise.allSettled([
    withTimeout(dns.resolve4(cleanHost), "A"),
    withTimeout(dns.resolveMx(cleanHost), "MX"),
    withTimeout(dns.resolveTxt(cleanHost), "TXT"),
  ]);

  // A record
  const aCheck: HealthCheckResult<{ ips: string[] }> =
    aResult.status === "fulfilled" && aResult.value.length > 0
      ? {
          metric: "dns_a_record",
          status: "pass",
          value: { ips: aResult.value },
          message: `${aResult.value.length} عنوان IP مُسجّل`,
        }
      : {
          metric: "dns_a_record",
          status: "fail",
          message: "لا يوجد سجل A — موقعك غير موصول بـ IP",
          recommendation: "اضبط سجل A في مزوّد الـ DNS",
        };

  // MX
  const mxCheck: HealthCheckResult<{ count: number }> =
    mxResult.status === "fulfilled" && mxResult.value.length > 0
      ? {
          metric: "dns_mx_record",
          status: "pass",
          value: { count: mxResult.value.length },
          message: `${mxResult.value.length} خادم بريد مُسجّل`,
        }
      : {
          metric: "dns_mx_record",
          status: "warn",
          message: "لا توجد سجلات MX — لن تستلم بريد على هذا النطاق",
          recommendation: "اضبط MX لو تستخدم بريد الشركة (example@yourdomain)",
        };

  // SPF + DMARC from TXT
  const txtRecords =
    txtResult.status === "fulfilled"
      ? (txtResult.value as string[][]).flat()
      : [];
  const hasSpf = txtRecords.some((r) => r.startsWith("v=spf1"));

  let dmarcCheck: HealthCheckResult;
  try {
    const dmarcRecords = await withTimeout(dns.resolveTxt(`_dmarc.${cleanHost}`), "DMARC");
    const flat = dmarcRecords.flat().join("");
    const hasDmarc = flat.includes("v=DMARC1");
    dmarcCheck = hasDmarc
      ? {
          metric: "dns_dmarc",
          status: "pass",
          message: "DMARC مُفعّل (يحمي من تزوير البريد)",
        }
      : {
          metric: "dns_dmarc",
          status: "warn",
          message: "لا يوجد DMARC — البريد عرضة للتزوير",
          recommendation: "أضف سجل TXT على _dmarc بقيمة v=DMARC1; p=none",
        };
  } catch {
    dmarcCheck = {
      metric: "dns_dmarc",
      status: "warn",
      message: "لا يوجد DMARC",
      recommendation: "أضف سجل TXT على _dmarc بقيمة v=DMARC1; p=none",
    };
  }

  const spfCheck: HealthCheckResult = hasSpf
    ? { metric: "dns_spf", status: "pass", message: "SPF مُفعّل" }
    : {
        metric: "dns_spf",
        status: "warn",
        message: "لا يوجد SPF",
        recommendation: "أضف TXT بقيمة v=spf1 ~all لمنع تزوير بريد عنوانك",
      };

  return [aCheck, mxCheck, spfCheck, dmarcCheck];
}
