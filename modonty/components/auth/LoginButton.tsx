"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function LoginButton() {
  return (
    <Button
      onClick={() => signIn()}
      variant="outline"
      size="icon"
      className="h-10 w-10"
      aria-label="تسجيل الدخول"
    >
      <LogIn className="h-4 w-4" />
    </Button>
  );
}
