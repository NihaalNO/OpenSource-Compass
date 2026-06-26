"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifyBackendLogout } from "@/lib/api/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await notifyBackendLogout().catch(() => undefined);
      await getSupabaseBrowserClient().auth.signOut();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="osc-button px-4"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
