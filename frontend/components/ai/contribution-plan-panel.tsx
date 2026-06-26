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
    <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">AI contribution planner</p>
          <h1 className="mt-1 text-2xl font-semibold">Contribution Plan</h1>
        </div>

        <div className="linear-card p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={repositoryId}
              onChange={(event) => setRepositoryId(event.target.value)}
              placeholder="Repository ID"
              className="linear-input"
            />
            <input
              value={issueId}
              onChange={(event) => setIssueId(event.target.value)}
              placeholder="Issue ID, optional"
              className="linear-input"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void runPlan(false)}
              disabled={isLoading || (!repositoryId && !issueId)}
              className="linear-button-primary"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Generating..." : plan ? "Load cached" : "Generate plan"}
            </button>
            {plan ? (
              <button
                type="button"
                onClick={() => void runPlan(true)}
                disabled={isLoading}
                className="linear-button"
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
            <div className="linear-card p-5">
              <AiResultList title="Task plan" items={plan.taskPlan} />
            </div>
            <div className="linear-card p-5">
              <AiResultList title="Setup checklist" items={plan.setupChecklist} />
            </div>
            <div className="linear-card p-5">
              <AiResultList title="Implementation checklist" items={plan.implementationChecklist} />
            </div>
            <div className="linear-card p-5">
              <AiResultList title="Testing checklist" items={plan.testingChecklist} />
            </div>
            <div className="linear-card p-5 md:col-span-2">
              <AiResultList title="PR checklist" items={plan.pullRequestChecklist} />
            </div>
          </div>
        ) : null}
      </div>
  );
}
