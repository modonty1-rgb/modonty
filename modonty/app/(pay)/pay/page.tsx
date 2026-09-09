import { redirect } from "next/navigation";

/** Local fallback. Vercel's proxy selects the visitor's market in production. */
export default function PayPage() {
  redirect("/pay/sa");
}
