"use client";

import { Github } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGithubLogin() {
    setIsLoading(true);
    setError(null);

    const nextPath = searchParams.get("next") ?? "/app";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "read:user user:email"
      }
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          OpenSource Compass
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Sign in to continue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use GitHub OAuth to connect your developer profile.
        </p>

        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={isLoading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Redirecting..." : "Continue with GitHub"}
        </button>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <p className="text-sm text-muted-foreground">Loading sign in...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
