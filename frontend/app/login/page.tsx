"use client";

import { ArrowLeft, Compass, Github, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Card } from "@/components/common/ui";
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to landing page
        </Link>

        <Card className="p-7">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-violet text-white">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-semibold">OpenForge</span>
          </div>

          <div className="mt-9">
            <p className="text-sm font-medium text-muted-foreground">Secure GitHub OAuth</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Continue with GitHub</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Connect your GitHub account to sync repositories and generate AI-powered contribution plans.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={isLoading || isCheckingSession}
            className="openforge-button-primary mt-7 w-full"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            {isCheckingSession ? "Checking session..." : isLoading ? "Redirecting..." : "Continue with GitHub"}
          </button>

          {error ? (
            <div className="mt-4 rounded-[15px] border border-destructive/30 bg-card p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-border bg-background p-4 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-violet" aria-hidden="true" />
            OpenForge uses GitHub OAuth and keeps AI provider keys on the backend only.
          </div>
        </Card>
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
