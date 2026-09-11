/**
 * ZATCA e-invoice QR payload — Phase 1 ("generation") fields, tags 1–5.
 *
 * Source: ZATCA «E-invoicing Detailed Technical Guideline», §6 «QR code» (read from the
 * official PDF, 11 Sep 2026):
 *   «It is mandatory to generate and print QR code encoded in Base64 format with up to 700
 *    characters … The QR code fields shall be encoded in Tag-Length-Value (TLV) format …
 *    Tag: one byte · Length: the length of the byte array resulted from the UTF8 encoding of
 *    the field value, stored in one byte · Value: the UTF8 byte array.»
 *   Tag 1 seller's name · 2 VAT registration number of the seller · 3 time stamp of the
 *   invoice (date and time, e.g. 2022-03-13T14:40:40Z) · 4 invoice total (with VAT) ·
 *   5 VAT total. Tags 6–9 (XML hash, ECDSA signature/public key, ZATCA stamp) belong to the
 *   Phase 2 integration with a cryptographic stamp and are deliberately NOT produced here —
 *   Khalid's decision (PAY-E5): an email document now; full ZATCA integration is a separate
 *   project with an approved provider.
 *
 * Pure: bytes in, Base64 out. Verified against the guideline's own worked example in
 * `admin/__tmp-zatca-tlv-check.mjs` (tags 1–5 of «Ahmed Mohamed AL Ahmady»).
 */
export interface ZatcaQrFields {
  sellerName: string;
  vatNumber: string;
  /** Invoice timestamp — formatted as yyyy-MM-ddTHH:mm:ssZ (UTC, no milliseconds). */
  timestamp: Date;
  /** Major units, e.g. 2394 → "2394.00". */
  totalWithVat: number;
  vatTotal: number;
}

const MAX_CHARS = 700; // guideline: «up to 700 characters»

function tlv(tag: number, value: string): Uint8Array {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > 255) throw new Error(`ZATCA TLV: tag ${tag} value exceeds 255 bytes`);
  return new Uint8Array([tag, bytes.length, ...bytes]);
}

/** yyyy-MM-ddTHH:mm:ssZ — the guideline's sample expression, UTC. */
export function formatZatcaTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function buildZatcaQrTlvBase64(f: ZatcaQrFields): string {
  const parts = [
    tlv(1, f.sellerName),
    tlv(2, f.vatNumber),
    tlv(3, formatZatcaTimestamp(f.timestamp)),
    tlv(4, f.totalWithVat.toFixed(2)),
    tlv(5, f.vatTotal.toFixed(2)),
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  const base64 = Buffer.from(out).toString("base64");
  if (base64.length > MAX_CHARS) throw new Error(`ZATCA QR exceeds ${MAX_CHARS} characters`);
  return base64;
}

/** Decode helper for tests/diagnostics: Base64 TLV → [{ tag, value }]. */
export function decodeZatcaQrTlv(base64: string): { tag: number; value: string }[] {
  const bytes = Buffer.from(base64, "base64");
  const out: { tag: number; value: string }[] = [];
  for (let i = 0; i < bytes.length; ) {
    const tag = bytes[i]; const len = bytes[i + 1];
    out.push({ tag, value: new TextDecoder().decode(bytes.subarray(i + 2, i + 2 + len)) });
    i += 2 + len;
  }
  return out;
}
