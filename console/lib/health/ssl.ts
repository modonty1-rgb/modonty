/**
 * SSL/TLS certificate check using Node's `tls` module — no external API.
 *
 * Reports:
 *  - Whether HTTPS is reachable
 *  - Days until certificate expiry
 *  - Issuer + subject CN
 */

import * as tls from "node:tls";
import type { HealthCheckResult } from "./types";

interface SslInfo {
  validFrom: Date;
  validTo: Date;
  daysUntilExpiry: number;
  issuer: string;
  subject: string;
}

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fetchCertificate(host: string, port = 443, timeoutMs = 5000): Promise<SslInfo> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
        rejectUnauthorized: true,
        timeout: timeoutMs,
      },
      () => {
        const cert = socket.getPeerCertificate(false);
        socket.end();
        if (!cert || Object.keys(cert).length === 0) {
          reject(new Error("No peer certificate"));
          return;
        }
        const validFrom = parseDate(cert.valid_from);
        const validTo = parseDate(cert.valid_to);
        if (!validFrom || !validTo) {
          reject(new Error("Invalid cert dates"));
          return;
        }
        const daysUntilExpiry = Math.floor(
          (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        resolve({
          validFrom,
          validTo,
          daysUntilExpiry,
          issuer: cert.issuer?.O ?? cert.issuer?.CN ?? "unknown",
          subject: cert.subject?.CN ?? "unknown",
        });
      }
    );
    socket.setTimeout(timeoutMs, () => {
      socket.destroy(new Error("TLS timeout"));
    });
    socket.on("error", reject);
  });
}

/**
 * Run all SSL checks for a domain. Returns 2 metrics:
 *  - ssl_valid (does the cert chain validate?)
 *  - ssl_expiry (days remaining)
 */
export async function checkSsl(host: string): Promise<HealthCheckResult[]> {
  const start = Date.now();
  try {
    const info = await fetchCertificate(host);
    const duration = Date.now() - start;

    const validResult: HealthCheckResult<{ issuer: string; subject: string }> = {
      metric: "ssl_valid",
      status: "pass",
      value: { issuer: info.issuer, subject: info.subject },
      message: `الشهادة سليمة (الجهة المصدرة: ${info.issuer})`,
      durationMs: duration,
    };

    let expiryStatus: HealthCheckResult["status"] = "pass";
    let expiryMessage = `${info.daysUntilExpiry} يوم متبقّي`;
    if (info.daysUntilExpiry < 0) {
      expiryStatus = "fail";
      expiryMessage = `الشهادة منتهية الصلاحية منذ ${Math.abs(info.daysUntilExpiry)} يوم!`;
    } else if (info.daysUntilExpiry <= 14) {
      expiryStatus = "fail";
      expiryMessage = `الشهادة تنتهي خلال ${info.daysUntilExpiry} يوم — جدّد الآن`;
    } else if (info.daysUntilExpiry <= 30) {
      expiryStatus = "warn";
      expiryMessage = `الشهادة تنتهي خلال ${info.daysUntilExpiry} يوم`;
    }

    const expiryResult: HealthCheckResult<{ daysUntilExpiry: number; validTo: string }> =
      {
        metric: "ssl_expiry",
        status: expiryStatus,
        value: {
          daysUntilExpiry: info.daysUntilExpiry,
          validTo: info.validTo.toISOString(),
        },
        message: expiryMessage,
        recommendation:
          expiryStatus === "fail" || expiryStatus === "warn"
            ? "تواصل مع مزوّد استضافتك لتجديد الشهادة"
            : undefined,
        durationMs: duration,
      };

    return [validResult, expiryResult];
  } catch (err) {
    const duration = Date.now() - start;
    const message =
      err instanceof Error ? err.message : "فشل الاتصال الآمن";
    return [
      {
        metric: "ssl_valid",
        status: "fail",
        message: `الاتصال الآمن غير متوفر: ${message}`,
        recommendation: "تأكد من صحة الـ SSL على دومينك",
        durationMs: duration,
      },
      {
        metric: "ssl_expiry",
        status: "skip",
        message: "لا يمكن التحقق — الشهادة غير متاحة",
        durationMs: duration,
      },
    ];
  }
}
