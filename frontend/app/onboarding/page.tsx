import { AuthGuard } from "@/components/auth/auth-guard";
import { LogoutButton } from "@/components/auth/logout-button";

export default function OnboardingPage() {
  return (
    <AuthGuard requireOnboardingComplete={false}>
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <section className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Onboarding
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Your profile is connected</h1>
            </div>
            <LogoutButton />
          </div>

          <div className="rounded-lg border bg-card p-5 text-card-foreground">
            <h2 className="text-lg font-medium">Next step</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The full goals and preferences onboarding form will be implemented after the auth
              foundation. New accounts intentionally stay here until onboarding is completed.
            </p>
          </div>
        </section>
      </main>
    </AuthGuard>
  );
}

