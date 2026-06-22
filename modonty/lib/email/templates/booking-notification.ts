import { baseTemplate, ctaButton, heading, paragraph, divider } from "./base";
import { BRAND_AR } from "@/lib/brand";

export interface BookingNotificationEmailParams {
  /** The provider / doctor (Client.name) — the recipient. */
  providerName: string;
  /** The visitor (lead) who submitted the booking. */
  visitorName: string;
  /** E.164 phone, e.g. +9665XXXXXXXX. */
  phone: string;
  /** Visitor email — may be empty (optional field). */
  email?: string;
  /** Pre-formatted preferred contact time, or null. */
  preferredAtLabel?: string | null;
  /** Visitor note, or null. */
  message?: string | null;
  /** Console bookings management URL. */
  bookingsUrl: string;
}

const NAVY = "#0E065A";
const GRAY = "#777777";

/** One label/value row inside the details box. `value` may contain HTML (links). */
function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;font-size:13px;color:${GRAY};white-space:nowrap;vertical-align:top;width:110px;">${label}</td>
    <td style="padding:10px 0;font-size:15px;color:#1a1a1a;font-weight:bold;direction:rtl;">${value}</td>
  </tr>`;
}

export function bookingNotificationEmail({
  providerName,
  visitorName,
  phone,
  email,
  preferredAtLabel,
  message,
  bookingsUrl,
}: BookingNotificationEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const waNumber = phone.replace(/[^0-9]/g, "");
  const phoneCell = `<span dir="ltr">${phone}</span> &nbsp;·&nbsp; <a href="tel:${phone}" style="color:#3030FF;text-decoration:none;">اتصال</a> &nbsp;·&nbsp; <a href="https://wa.me/${waNumber}" style="color:#16a34a;text-decoration:none;">واتساب</a>`;

  const rows = [
    detailRow("العميل", visitorName),
    detailRow("الجوال", phoneCell),
    email ? detailRow("البريد", `<a href="mailto:${email}" style="color:#3030FF;text-decoration:none;direction:ltr;">${email}</a>`) : "",
    preferredAtLabel ? detailRow("الموعد المفضّل", preferredAtLabel) : "",
    message ? detailRow("ملاحظة", message) : "",
  ]
    .filter(Boolean)
    .join("");

  const content = `
    ${heading("📩 وصلك طلب حجز جديد")}
    ${paragraph(`مرحباً ${providerName}،`)}
    ${paragraph(`وصلك طلب حجز جديد من صفحتك على ${BRAND_AR}. تواصل مع العميل بأسرع وقت — السرعة تفرق في إغلاق الطلب.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9ff;border:1px solid #e6e8ff;border-radius:8px;padding:8px 20px;margin:8px 0 8px;">
      ${rows}
    </table>
    ${ctaButton("فتح إدارة الحجوزات", bookingsUrl)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:${GRAY};">وصلك هذا التنبيه لأن نشاطك مُدرَج في ${BRAND_AR}. تابع كل حجوزاتك وغيّر حالتها من لوحة تحكّمك.</span>`)}
  `;

  const textLines = [
    `مرحباً ${providerName}،`,
    "",
    `وصلك طلب حجز جديد من صفحتك على ${BRAND_AR}:`,
    `العميل: ${visitorName}`,
    `الجوال: ${phone}`,
    email ? `البريد: ${email}` : "",
    preferredAtLabel ? `الموعد المفضّل: ${preferredAtLabel}` : "",
    message ? `ملاحظة: ${message}` : "",
    "",
    `إدارة الحجوزات: ${bookingsUrl}`,
    "",
    `— فريق ${BRAND_AR}`,
  ].filter(Boolean);

  return {
    subject: `طلب حجز جديد — ${visitorName}`,
    html: baseTemplate(content, `${visitorName} — ${phone}`),
    text: textLines.join("\n"),
  };
}
