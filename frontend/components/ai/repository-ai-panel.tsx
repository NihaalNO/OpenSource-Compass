"use client";

import type { AiRepositoryAnalysis } from "@opensource-compass/shared";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { analyzeRepository } from "@/lib/api/ai";
import { AiResultList } from "./ai-result-list";

interface RepositoryAiPanelProps {
  repositoryId: string;
}

export function RepositoryAiPanel({ repositoryId }: RepositoryAiPanelProps) {
  const [analysis, setAnalysis] = useState<AiRepositoryAnalysis | null>(null);
  const [cached, setCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(regenerate = false) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeRepository(repositoryId, regenerate);
      setAnalysis(response.analysis);
      setCached(response.cached);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Repository analysis failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">AI repository understanding</h2>
          <p className="text-sm text-muted-foreground">
            Generate a contributor-friendly summary from synced repository metadata.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void runAnalysis(false)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Generating..." : analysis ? "Load cached" : "Analyze"}
          </button>
          {analysis ? (
            <button
              type="button"
              onClick={() => void runAnalysis(true)}
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

      {analysis ? (
        <div className="mt-5 space-y-5">
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          <AiResultList title="Tech stack" items={analysis.techStack} />
          <div>
            <h3 className="text-sm font-medium">Architecture</h3>
            <p className="mt-2 text-sm text-muted-foreground">{analysis.architecture}</p>
          </div>
          <AiResultList title="Important files" items={analysis.importantFiles} />
          <AiResultList title="Contribution entry points" items={analysis.contributionEntryPoints} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No AI analysis yet. Cached results will be reused after the first generation.
        </p>
      )}
    </div>
  );
}
