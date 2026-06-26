"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { fetchCurrentUser } from "@/lib/api/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function finishSignIn() {
      try {
        const supabase = getSupabaseBrowserClient();
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }
        }

        const response = await fetchCurrentUser();
        const nextPath = searchParams.get("next") ?? "/app";

        router.replace(response.user.onboardingCompleted ? nextPath : "/onboarding");
      } catch (callbackError) {
        setError(callbackError instanceof Error ? callbackError.message : "Unable to complete sign in");
      }
    }

    void finishSignIn();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md rounded-lg border bg-card p-6 text-card-foreground">
        <h1 className="text-lg font-semibold">Completing sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "Restoring your GitHub session..."}
        </p>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <p className="text-sm text-muted-foreground">Completing sign in...</p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
