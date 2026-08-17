"use client";

import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RegisterForm } from "./components/register-form";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated") {
    return null;
  }

  return <RegisterForm />;
}
