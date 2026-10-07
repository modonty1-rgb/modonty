import { formatNumber } from "./format-number";

/** «+١٨» · «−٩» · «٠» — the sign is data, not decoration. */
export const signedNumber = (v: number) => (v > 0 ? `+${formatNumber(v)}` : v < 0 ? `−${formatNumber(-v)}` : formatNumber(0));
