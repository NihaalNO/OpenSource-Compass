"use client";

import type { AiContributionPlan } from "@opensource-compass/shared";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { generateContributionPlan } from "@/lib/api/ai";
import { AiResultList } from "./ai-result-list";

export function ContributionPlanPanel() {
  const [repositoryId, setRepositoryId] = useState("");
  const [issueId, setIssueId] = useState("");
  const [plan, setPlan] = useState<AiContributionPlan | null>(null);
  const [cached, setCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runPlan(regenerate = false) {
    setIsLoading(true);
    setError(null);

    try {
      const input: { repositoryId?: string; issueId?: string; regenerate: boolean } = { regenerate };

      if (repositoryId) {
        input.repositoryId = repositoryId;
      }

      if (issueId) {
        input.issueId = issueId;
      }

      const response = await generateContributionPlan(input);
      setPlan(response.analysis);
      setCached(response.cached);
    } catch (planError) {
      setError(planError instanceof Error ? planError.message : "Contribution plan generation failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            AI contribution planner
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Contribution Plan</h1>
        </div>

        <div className="rounded-lg border bg-card p-5 text-card-foreground">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={repositoryId}
              onChange={(event) => setRepositoryId(event.target.value)}
              placeholder="Repository ID"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
            <input
              value={issueId}
              onChange={(event) => setIssueId(event.target.value)}
              placeholder="Issue ID, optional"
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void runPlan(false)}
              disabled={isLoading || (!repositoryId && !issueId)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Generating..." : plan ? "Load cached" : "Generate plan"}
            </button>
            {plan ? (
              <button
                type="button"
                onClick={() => void runPlan(true)}
                disabled={isLoading}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
              >
                Regenerate
              </button>
            ) : null}
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          {cached ? <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Cached result</p> : null}
        </div>

        {plan ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-5 text-card-foreground">
              <AiResultList title="Task plan" items={plan.taskPlan} />
            </div>
            <div className="rounded-lg border bg-card p-5 text-card-foreground">
              <AiResultList title="Setup checklist" items={plan.setupChecklist} />
            </div>
            <div className="rounded-lg border bg-card p-5 text-card-foreground">
              <AiResultList title="Implementation checklist" items={plan.implementationChecklist} />
            </div>
            <div className="rounded-lg border bg-card p-5 text-card-foreground">
              <AiResultList title="Testing checklist" items={plan.testingChecklist} />
            </div>
            <div className="rounded-lg border bg-card p-5 text-card-foreground md:col-span-2">
              <AiResultList title="PR checklist" items={plan.pullRequestChecklist} />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
