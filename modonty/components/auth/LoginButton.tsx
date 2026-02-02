"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function LoginButton() {
  return (
    <Button
      onClick={() => signIn()}
      variant="outline"
      size="default"
      className="flex items-center gap-2 h-10"
    >
      <LogIn className="h-4 w-4" />
      تسجيل الدخول
    </Button>
  );
}
