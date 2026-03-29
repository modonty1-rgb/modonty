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
  return (
    <>
      <div
        className="relative h-24 w-full bg-gradient-to-r from-[#0e065a] to-[#3030ff] md:h-40"
        aria-hidden
      />
      {children}
    </>
  );
}
