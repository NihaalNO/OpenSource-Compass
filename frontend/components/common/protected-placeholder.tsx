interface ProtectedPlaceholderProps {
  title: string;
  description: string;
}

export function ProtectedPlaceholder({ title, description }: ProtectedPlaceholderProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-4xl rounded-lg border bg-card p-6 text-card-foreground">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Protected route
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </section>
    </main>
  );
}

