import { OTHER_DIAL } from "./dial-codes";

/** E.164: «a maximum of fifteen digits», never starting with 0 — the form WhatsApp's API takes. */
const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * «+966501234567» from what the reader typed: a dial code and the local number (its leading
 * zeros dropped — «0501234567» in Saudi Arabia is +966 501234567), or with «دولة أخرى» the full
 * number typed with its own +code. Spaces, dashes, brackets and RTL marks are ignored.
 * Null when the result is not a plausible international number.
 */
export function toInternationalPhone(dial: string, typed: string): string | null {
  const digits = typed.replace(/[^\d+]/g, "");
  if (!digits) return null;
  const full =
    dial === OTHER_DIAL || digits.startsWith("+") || digits.startsWith("00")
      ? `+${digits.replace(/^\+|^00/, "")}`
      : `+${dial}${digits.replace(/^0+/, "")}`;
  return E164.test(full) ? full : null;
}
