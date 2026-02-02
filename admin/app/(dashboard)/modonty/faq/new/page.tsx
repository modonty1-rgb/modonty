import { redirect } from "next/navigation";

export default function NewFAQPage() {
  // This route is deprecated in favor of the dialog on /modonty/faq
  redirect("/modonty/faq");
}
