import { LogoutButton } from "@/components/auth/logout-button";

export default function AppHomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Protected app
            </p>
            <h1 className="mt-2 text-3xl font-semibold">OpenSource Compass Dashboard</h1>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-lg border bg-card p-5 text-card-foreground">
          <h2 className="text-lg font-medium">Phase 2 authentication ready</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This protected route is reserved for the Phase 3 GitHub integration and dashboard work.
          </p>
        </div>
      </section>
    </main>
  );
}

