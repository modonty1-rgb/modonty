import { Metadata } from "next";
import { generateMetadataFromSEO } from "@/lib/seo";

export const metadata: Metadata = generateMetadataFromSEO({
  title: "الملف الشخصي",
  description: "عرض وتحديث الملف الشخصي",
  url: "/users/profile",
  type: "profile",
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
