"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { IconLogin } from "@/lib/icons";

export function LoginButton() {
  return (
    <Button
      onClick={() => signIn()}
      variant="ghost"
      size="icon"
      className="h-11 w-11 rounded-xl"
      aria-label="تسجيل الدخول"
    >
      <IconLogin className="h-5 w-5" />
    </Button>
  );
}
