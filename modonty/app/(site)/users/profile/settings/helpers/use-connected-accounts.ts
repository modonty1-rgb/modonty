"use client";

import { useState, useEffect } from "react";
import type { useSession } from "@/components/providers/SessionContext";

/** The reader's linked OAuth accounts and whether a password is set — loaded from the settings API. */
export function useConnectedAccounts(session: ReturnType<typeof useSession>["data"]) {
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  // Start from the session's flag, not `false`: when the accounts fetch failed (a 404 on dev,
  // QA finding #4/#5, 29 Sep 2026) the current-password field stayed hidden while the server
  // still required it — no way to change the password at all.
  const [hasPassword, setHasPassword] = useState<boolean>(Boolean((session?.user as { hasPassword?: boolean } | undefined)?.hasPassword));

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/users/profile/settings/api/${session.user.id}/accounts`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setConnectedAccounts(data.data.accounts || []);
            setHasPassword(data.data.hasPassword || false);
          }
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, [session?.user?.id]);

  return { connectedAccounts, setConnectedAccounts, hasPassword };
}
