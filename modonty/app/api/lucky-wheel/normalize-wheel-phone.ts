/**
 * One number, one spelling — the phone IS the spin limit, so every way of typing the same number
 * must land on the same row. Measured: with a `+` kept, the same number spun twice.
 *
 * Saudi (the wheel was built for Riyadh): «+966 50…», «00966 50…», «966 50…», «050…», «50…» → `05…`.
 * Egypt (Techne Summit, Alexandria, 3–5 Oct 2026): «+20 10…», «0020 10…», «20 10…», «010…»,
 * «10…» → `01…` (11 digits). Before 30 Sep 2026 only the Saudi forms folded, so one Egyptian
 * number typed two ways counted as two people and got twice the spins.
 * Anything else keeps its digits with the international `00`/`+` stripped.
 */
export function normalizeWheelPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Saudi mobile: 966 5XXXXXXXX (12) / 5XXXXXXXX (9) → 05XXXXXXXX
  if (digits.startsWith("966") && digits.length === 12) digits = `0${digits.slice(3)}`;
  if (digits.startsWith("5") && digits.length === 9) digits = `0${digits}`;
  // Egyptian mobile: 20 1XXXXXXXXX (12) / 1XXXXXXXXX (10) → 01XXXXXXXXX
  if (digits.startsWith("201") && digits.length === 12) digits = `0${digits.slice(2)}`;
  if (digits.startsWith("1") && digits.length === 10) digits = `0${digits}`;
  return digits;
}
