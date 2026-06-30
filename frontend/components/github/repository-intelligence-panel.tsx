"use client";

import type { RepositoryKnowledgePackage } from "@openforge/shared";
import { BrainCircuit, Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card } from "@/components/common/ui";
import {
  fetchRepositoryIntelligence,
  generateRepositoryIntelligence
} from "@/lib/api/github";

interface RepositoryIntelligencePanelProps {
  repositoryId: string;
}

function SignalList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[16px] border border-border bg-background p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.slice(0, 10).map((item) => <Badge key={item}>{item}</Badge>)
        ) : (
          <span className="text-sm text-muted-foreground">None detected</span>
        )}
      </div>
    </div>
  );
}

function formatLevel(value: string) {
  return value.replace(/_/g, " ");
}

export function RepositoryIntelligencePanel({ repositoryId }: RepositoryIntelligencePanelProps) {
  const [knowledgePackage, setKnowledgePackage] = useState<RepositoryKnowledgePackage | null>(null);
  const [cached, setCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCached(options: { silentNotFound?: boolean } = {}) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchRepositoryIntelligence(repositoryId);
      setKnowledgePackage(response.knowledgePackage);
      setCached(response.cached);
    } catch (loadError) {
      setKnowledgePackage(null);
      if (!options.silentNotFound) {
        setError(loadError instanceof Error ? loadError.message : "No cached repository intelligence found");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function generate(regenerate = false) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateRepositoryIntelligence(repositoryId, regenerate);
      setKnowledgePackage(response.knowledgePackage);
      setCached(response.cached);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Repository intelligence generation failed");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCached({ silentNotFound: true }).catch(() => undefined);
  }, [repositoryId]);

  const importantDirectories = knowledgePackage?.tree.directories
    .filter((directory) => directory.importance !== "low")
    .map((directory) => directory.path) ?? [];
  const importantFiles = knowledgePackage?.tree.importantFiles
    .filter((file) => file.importance !== "low")
    .map((file) => file.path) ?? [];
  const entryPoints = knowledgePackage?.entryPoints.map((entryPoint) => entryPoint.path) ?? [];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Repository Intelligence</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Deterministic repository context from README, tree, manifests, docs, tests, and CI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void loadCached()} disabled={isLoading}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Load Intelligence
          </Button>
          <Button type="button" onClick={() => void generate(false)} disabled={isLoading} variant="primary">
            <BrainCircuit className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Working..." : "Generate Repository Intelligence"}
          </Button>
          {knowledgePackage ? (
            <Button type="button" onClick={() => void generate(true)} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Regenerate
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-[16px] border border-destructive/30 bg-background p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {cached ? <p className="mt-4 text-xs font-medium uppercase text-muted-foreground">Cached intelligence</p> : null}

      {knowledgePackage ? (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[16px] border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Contribution readiness</p>
              <p className="mt-2 text-2xl font-semibold capitalize">
                {formatLevel(knowledgePackage.contributionReadiness.level)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Score {knowledgePackage.contributionReadiness.score}/100
              </p>
            </div>
            <div className="rounded-[16px] border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Complexity</p>
              <p className="mt-2 text-2xl font-semibold capitalize">
                {formatLevel(knowledgePackage.complexity.level)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Score {knowledgePackage.complexity.score}/100</p>
            </div>
            <div className="rounded-[16px] border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Docs, tests, CI</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{knowledgePackage.docs.hasContributingGuide ? "Contributing" : "No contributing guide"}</Badge>
                <Badge>{knowledgePackage.testStructure.hasTests ? "Tests" : "No tests"}</Badge>
                <Badge>{knowledgePackage.workflowFiles.length > 0 ? "CI" : "No CI"}</Badge>
                <Badge>{knowledgePackage.docs.hasLicense ? "License" : "No license"}</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SignalList
              title="Detected stack"
              items={[
                ...knowledgePackage.detectedStack.languages,
                ...knowledgePackage.detectedStack.frameworks,
                ...knowledgePackage.detectedStack.packageManagers,
                ...knowledgePackage.detectedStack.databases
              ]}
            />
            <SignalList title="Important directories" items={importantDirectories} />
            <SignalList title="Important files" items={importantFiles} />
            <SignalList title="Entry points" items={entryPoints} />
          </div>

          <div className="rounded-[16px] border border-border bg-background p-4 text-sm text-muted-foreground">
            Processed {knowledgePackage.tree.processedEntries} of {knowledgePackage.tree.totalEntries} tree entries.
            {knowledgePackage.sourceLimits.truncated ? " Source limits were applied." : " Source limits were not reached."}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[16px] border border-border bg-background p-5">
          <h3 className="font-semibold">No repository intelligence loaded</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Generate deterministic repository context before using AI planning for this project.
          </p>
        </div>
      )}
    </Card>
  );
}
