"use client";

import { ArrowLeft, Compass, Github, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function redirectAuthenticatedUser() {
      const nextPath = searchParams.get("next") ?? "/app";
      const { data } = await getSupabaseBrowserClient().auth.getSession();

      if (!cancelled && data.session) {
        router.replace(nextPath);
        return;
      }

      if (!cancelled) {
        setIsCheckingSession(false);
      }
    }

    void redirectAuthenticatedUser();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

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
    <main className="dark flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <section className="relative w-full max-w-md">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to product
        </Link>

        <div className="linear-card overflow-hidden p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">OpenSource Compass</span>
          </div>

          <div className="mt-8">
            <p className="text-sm text-muted-foreground">Secure GitHub OAuth</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Continue with GitHub</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Connect your GitHub account to generate personalized open-source recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={isLoading || isCheckingSession}
            className="linear-button-primary mt-6 min-h-11 w-full cursor-pointer"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            {isCheckingSession ? "Checking session..." : isLoading ? "Redirecting..." : "Continue with GitHub"}
          </button>

          {error ? (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex items-start gap-2 rounded-md border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            OpenSource Compass uses GitHub OAuth and keeps AI provider keys on the backend only.
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="dark flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <p className="text-sm text-muted-foreground">Loading sign in...</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
