"use client";

import type { RecommendedIssue } from "@opensource-compass/shared";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchIssueRecommendations,
  saveRecommendedIssue,
  unsaveRecommendedIssue
} from "@/lib/api/recommendations";
import { SyncRequiredState } from "@/components/github/sync-required-state";
import { fetchGitHubProfile, getGitHubSyncStatus, type GitHubSyncStatus } from "@/lib/api/github";
import {
  RecommendationFilters,
  type RecommendationFilterValues
} from "./recommendation-filters";

export function IssueRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendedIssue[]>([]);
  const [filters, setFilters] = useState<RecommendationFilterValues>({
    language: "",
    difficulty: "",
    health: "",
    label: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<GitHubSyncStatus>("not_synced");
  const [error, setError] = useState<string | null>(null);

  async function loadRecommendations(nextFilters = filters) {
    const profileResponse = await fetchGitHubProfile();
    const nextSyncStatus = getGitHubSyncStatus(profileResponse.profile);

    setSyncStatus(nextSyncStatus);

    if (nextSyncStatus !== "synced") {
      setRecommendations([]);
      return;
    }

    const response = await fetchIssueRecommendations(nextFilters);
    setRecommendations(response.recommendations);
  }

  async function toggleSave(item: RecommendedIssue) {
    if (item.isSaved) {
      await unsaveRecommendedIssue(item.issue.id);
    } else {
      await saveRecommendedIssue(item.issue.id);
    }

    await loadRecommendations();
  }

  useEffect(() => {
    loadRecommendations()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load issue recommendations");
      })
      .finally(() => setIsLoading(false));
  }, []);

  function handleFiltersChange(nextFilters: RecommendationFilterValues) {
    setFilters(nextFilters);
    loadRecommendations(nextFilters).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to apply filters");
    });
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Deterministic matching
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Recommended issues</h1>
        </div>

        <RecommendationFilters
          language={filters.language}
          difficulty={filters.difficulty}
          label={filters.label}
          showLabel
          onChange={handleFiltersChange}
        />

        {syncStatus !== "synced" ? <SyncRequiredState onSynced={() => loadRecommendations()} /> : null}

        {error ? <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</div> : null}

        {syncStatus !== "synced" ? null : isLoading ? (
          <div className="rounded-lg border bg-card p-5 text-card-foreground">Loading issue recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-lg border bg-card p-5 text-card-foreground">
            <h2 className="text-lg font-medium">No issue recommendations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sync issues from repository detail pages and run skill analysis.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-5 text-card-foreground">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <a href={item.issue.htmlUrl} target="_blank" rel="noreferrer" className="text-lg font-medium hover:underline">
                      #{item.issue.number} {item.issue.title}
                    </a>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.issue.repository.fullName} · {item.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{item.score}%</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">match</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.issue.labels.map((label) => (
                    <span key={label} className="rounded-md border px-2 py-1 text-xs">
                      {label}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void toggleSave(item)}
                  className="mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  {item.isSaved ? "Unsave" : "Save"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
