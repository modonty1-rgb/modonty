import QRCode from "qrcode";

/**
 * PNG bytes of the ZATCA QR for an invoice email (attached inline, referenced by cid:).
 * Server-side only — `qrcode` renders through its own PNG encoder, no canvas needed
 * (node-qrcode docs: QRCode.toBuffer → Promise<Buffer>).
 */
export async function renderInvoiceQrPng(payloadBase64: string): Promise<Buffer> {
  return QRCode.toBuffer(payloadBase64, { errorCorrectionLevel: "M", width: 220, margin: 1 });
}
