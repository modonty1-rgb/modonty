import type { Metadata } from "next";
import { LuckyWheelGame } from "./lucky-wheel";

/**
 * A deliberately unlinked activation route. It is reached from the event QR code, not from
 * the site navigation, and stays out of search results.
 */
export const metadata: Metadata = {
  title: "عجلة الحظ",
  robots: { index: false, follow: false },
};

export default function LuckyWheelPage() {
  return <LuckyWheelGame />;
}
