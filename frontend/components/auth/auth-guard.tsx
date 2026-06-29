"use client";

import type { CurrentUserResponse } from "@openforge/shared";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { fetchCurrentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthGuardProps {
  children: ReactNode;
  requireOnboardingComplete?: boolean;
}

export function AuthGuard({ children, requireOnboardingComplete = true }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUserResponse["user"] | null>(null);
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const response = await fetchCurrentUser();

        if (cancelled) {
          return;
        }

        if (requireOnboardingComplete && !response.user.onboardingCompleted) {
          router.replace("/onboarding");
          return;
        }

        setUser(response.user);
        setStatus("ready");
      } catch (error) {
        if (error instanceof ApiClientError && error.statusCode === 401) {
          await supabase.auth.signOut();
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }

        setStatus("error");
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [pathname, requireOnboardingComplete, router]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <p className="text-sm text-muted-foreground">Restoring your session...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md rounded-lg border bg-card p-6 text-card-foreground">
          <h1 className="text-lg font-semibold">Authentication check failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please refresh the page or sign in again.
          </p>
        </div>
      </main>
    );
  }

  return <div data-user-id={user?.id}>{children}</div>;
}

