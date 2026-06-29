"use client";

import type { AiRepositoryAnalysis } from "@openforge/shared";
import { RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, Card, EmptyState, ErrorState } from "@/components/common/ui";
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
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">AI repository understanding</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a contributor-friendly summary from synced repository metadata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void runAnalysis(false)} disabled={isLoading} variant="primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Generating..." : analysis ? "Load cached" : "Analyze Repository"}
          </Button>
          {analysis ? (
            <Button type="button" onClick={() => void runAnalysis(true)} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Regenerate
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
      {cached ? <p className="mt-4 text-xs font-medium uppercase text-muted-foreground">Cached result</p> : null}

      {analysis ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-[24px] border border-border bg-background p-5">
            <h3 className="font-semibold">Summary</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{analysis.summary}</p>
          </div>
          <AiResultList title="Tech stack" items={analysis.techStack} />
          <div className="rounded-[24px] border border-border bg-background p-5">
            <h3 className="font-semibold">Architecture</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{analysis.architecture}</p>
          </div>
          <AiResultList title="Important files" items={analysis.importantFiles} />
          <AiResultList title="Contribution entry points" items={analysis.contributionEntryPoints} />
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No AI analysis yet"
            description="Run a repository analysis to get a summary, architecture notes, important files, and contribution entry points."
          />
        </div>
      )}
    </Card>
  );
}
