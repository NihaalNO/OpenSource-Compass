import type { HealthResponse } from "@opensource-compass/shared";
import Link from "next/link";

const foundationStatus: HealthResponse = {
  status: "ok",
  service: "frontend",
  version: "0.1.0"
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Phase 1 foundation
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">OpenSource Compass</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A clean Next.js shell is ready for the authentication, GitHub integration,
            recommendation, and AI workflows described in the docs.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-5 text-card-foreground">
          <h2 className="text-lg font-medium">Workspace status</h2>
          <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-sm">
            {JSON.stringify(foundationStatus, null, 2)}
          </pre>
        </div>

        <Link
          href="/login"
          className="inline-flex w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Sign in with GitHub
        </Link>
      </section>
    </main>
  );
}
