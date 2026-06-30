"use client";

import type { AiContributionPlan, GitHubIssueSummary, GitHubRepositorySummary } from "@openforge/shared";
import { RefreshCw, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader } from "@/components/common/ui";
import { generateContributionPlan } from "@/lib/api/ai";
import { fetchGitHubIssues, fetchGitHubRepositories } from "@/lib/api/github";
import { AiResultList } from "./ai-result-list";

export function ContributionPlanPanel() {
  const searchParams = useSearchParams();
  const [repositories, setRepositories] = useState<GitHubRepositorySummary[]>([]);
  const [issues, setIssues] = useState<GitHubIssueSummary[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState("");
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [plan, setPlan] = useState<AiContributionPlan | null>(null);
  const [cached, setCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRepository = useMemo(
    () => repositories.find((repository) => repository.id === selectedRepositoryId) ?? null,
    [repositories, selectedRepositoryId]
  );

  useEffect(() => {
    const initialRepositoryId = searchParams.get("repositoryId");

    fetchGitHubRepositories()
      .then((response) => {
        setRepositories(response.repositories);

        if (initialRepositoryId && response.repositories.some((repository) => repository.id === initialRepositoryId)) {
          setSelectedRepositoryId(initialRepositoryId);
        }
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Repositories failed to load"));
  }, [searchParams]);

  useEffect(() => {
    setSelectedIssueId("");
    setIssues([]);

    if (!selectedRepository) {
      return;
    }

    setIsLoadingIssues(true);
    fetchGitHubIssues(selectedRepository.ownerLogin, selectedRepository.name)
      .then((response) => setIssues(response.issues))
      .catch(() => setIssues([]))
      .finally(() => setIsLoadingIssues(false));
  }, [selectedRepository]);

  async function runPlan(regenerate = false) {
    if (!selectedRepositoryId) {
      setError("Select a repository before generating a contribution plan.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const input: { repositoryId: string; issueId?: string; regenerate: boolean } = {
        repositoryId: selectedRepositoryId,
        regenerate
      };

      if (selectedIssueId) {
        input.issueId = selectedIssueId;
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
      <PageHeader
        eyebrow="Contribution Workspace"
        title="Contribution Plan"
        description="Legacy contribution plan generator used inside the repository workspace when deeper AI planning is needed."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-muted-foreground">Repository</span>
            <select
              value={selectedRepositoryId}
              onChange={(event) => setSelectedRepositoryId(event.target.value)}
              className="openforge-input w-full"
            >
              <option value="">Select a synced repository</option>
              {repositories.map((repository) => (
                <option key={repository.id} value={repository.id}>
                  {repository.fullName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-muted-foreground">Issue optional</span>
            <select
              value={selectedIssueId}
              onChange={(event) => setSelectedIssueId(event.target.value)}
              disabled={!selectedRepository || isLoadingIssues}
              className="openforge-input w-full"
            >
              <option value="">{isLoadingIssues ? "Loading issues..." : "Repository-level plan"}</option>
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  #{issue.number} {issue.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedRepository ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-[24px] border border-border bg-background p-4 text-sm text-muted-foreground">
            <Badge>{selectedRepository.primaryLanguage ?? "Unknown language"}</Badge>
            <span>
              Planning for {selectedRepository.fullName}
              {selectedIssueId ? " with selected issue context." : " at repository level."}
            </span>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void runPlan(false)}
            disabled={isLoading || !selectedRepositoryId}
            variant="primary"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Generating..." : plan ? "Load cached" : "Generate plan"}
          </Button>
          {plan ? (
            <Button type="button" onClick={() => void runPlan(true)} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Regenerate
            </Button>
          ) : null}
        </div>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        {cached ? <p className="mt-4 text-xs font-medium uppercase text-muted-foreground">Cached result</p> : null}
      </Card>

      {plan ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <AiResultList title="Setup" items={plan.setupChecklist} />
          </Card>
          <Card>
            <AiResultList title="Files to inspect" items={plan.taskPlan} />
          </Card>
          <Card>
            <AiResultList title="Implementation steps" items={plan.implementationChecklist} />
          </Card>
          <Card>
            <AiResultList title="Testing checklist" items={plan.testingChecklist} />
          </Card>
          <Card className="md:col-span-2">
            <AiResultList title="Pull request checklist" items={plan.pullRequestChecklist} />
          </Card>
        </div>
      ) : (
        <EmptyState
          title="Generate an AI contribution plan"
          description="Choose a synced repository to receive setup, inspection, implementation, testing, and pull request guidance."
        />
      )}
    </div>
  );
}
