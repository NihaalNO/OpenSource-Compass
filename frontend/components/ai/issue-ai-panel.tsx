"use client";

import type { AiIssueExplanation } from "@opensource-compass/shared";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { explainIssue } from "@/lib/api/ai";
import { AiResultList } from "./ai-result-list";

interface IssueAiPanelProps {
  issueId: string;
}

export function IssueAiPanel({ issueId }: IssueAiPanelProps) {
  const [explanation, setExplanation] = useState<AiIssueExplanation | null>(null);
  const [cached, setCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runExplanation(regenerate = false) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await explainIssue(issueId, regenerate);
      setExplanation(response.analysis);
      setCached(response.cached);
    } catch (explainError) {
      setError(explainError instanceof Error ? explainError.message : "Issue explanation failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-4xl rounded-lg border bg-card p-6 text-card-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              AI issue explanation
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Contribution guidance</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void runExplanation(false)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Generating..." : explanation ? "Load cached" : "Explain issue"}
            </button>
            {explanation ? (
              <button
                type="button"
                onClick={() => void runExplanation(true)}
                disabled={isLoading}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
              >
                Regenerate
              </button>
            ) : null}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        {cached ? <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Cached result</p> : null}

        {explanation ? (
          <div className="mt-5 space-y-5">
            <p className="text-sm text-muted-foreground">{explanation.summary}</p>
            <p className="text-sm font-medium">Difficulty: {explanation.difficultyEstimate}</p>
            <AiResultList title="Required knowledge" items={explanation.requiredKnowledge} />
            <AiResultList title="Likely files" items={explanation.likelyFiles} />
            <AiResultList title="Suggested approach" items={explanation.suggestedApproach} />
            <div>
              <h3 className="text-sm font-medium">Expected learning outcome</h3>
              <p className="mt-2 text-sm text-muted-foreground">{explanation.learningOutcome}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Generate an explanation after syncing this issue from a repository detail page.
          </p>
        )}
      </section>
    </main>
  );
}
