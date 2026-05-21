import type { Metadata } from "next";
import { ConsoleTourClient } from "./ConsoleTourClient";

export const metadata: Metadata = {
  title: "جولة تفاعلية في الكونسول — مودونتي",
  description: "جولة حقيقية تأخذك عبر كل صفحات الكونسول مع شرح بسيط.",
  robots: { index: false, follow: false },
};

export default function ConsoleTourPage() {
  return <ConsoleTourClient />;
}
