import type { Metadata } from "next";
import { HelpClient } from "../HelpClient";

export const metadata: Metadata = {
  title: "دليل استخدام بوابة العملاء — مودونتي",
  description:
    "دليل بسيط ومفصّل يأخذك خطوة بخطوة في كل صفحات بوابتك على مودونتي — من تعبئة بياناتك لمتابعة مقالاتك ونتائج موقعك.",
  robots: { index: false, follow: false },
};

export default function HelpPage() {
  return <HelpClient />;
}
