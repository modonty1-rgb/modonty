import type { Metadata } from "next";
import { HelpLanding } from "./HelpLanding";

export const metadata: Metadata = {
  title: "مركز المساعدة — مودونتي",
  description:
    "دليل شامل لاستخدام بوابة العملاء — اختر بين دليل المنصة العام أو جولة تفاعلية في الكونسول.",
  robots: { index: false, follow: false },
};

export default function HelpPage() {
  return <HelpLanding />;
}
