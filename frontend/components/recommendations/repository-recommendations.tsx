"use client";

import type { RecommendedRepository } from "@opensource-compass/shared";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchRepositoryRecommendations,
  saveRecommendedRepository,
  unsaveRecommendedRepository
} from "@/lib/api/recommendations";
import { SyncRequiredState } from "@/components/github/sync-required-state";
import { fetchGitHubProfile, getGitHubSyncStatus, type GitHubSyncStatus } from "@/lib/api/github";
import {
  RecommendationFilters,
  type RecommendationFilterValues
} from "./recommendation-filters";

export function RepositoryRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendedRepository[]>([]);
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

    const response = await fetchRepositoryRecommendations(nextFilters);
    setRecommendations(response.recommendations);
  }

  async function toggleSave(item: RecommendedRepository) {
    if (item.isSaved) {
      await unsaveRecommendedRepository(item.repository.id);
    } else {
      await saveRecommendedRepository(item.repository.id);
    }

    await loadRecommendations();
  }

  useEffect(() => {
    loadRecommendations()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load recommendations");
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
          <h1 className="mt-2 text-3xl font-semibold">Recommended repositories</h1>
        </div>

        <RecommendationFilters
          language={filters.language}
          difficulty={filters.difficulty}
          health={filters.health}
          showHealth
          onChange={handleFiltersChange}
        />

        {syncStatus !== "synced" ? <SyncRequiredState onSynced={() => loadRecommendations()} /> : null}

        {error ? <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</div> : null}

        {syncStatus !== "synced" ? null : isLoading ? (
          <div className="rounded-lg border bg-card p-5 text-card-foreground">Loading recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-lg border bg-card p-5 text-card-foreground">
            <h2 className="text-lg font-medium">No repository recommendations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sync repositories and run skill analysis from the dashboard.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-5 text-card-foreground">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/app/repositories/${item.repository.ownerLogin}/${item.repository.name}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {item.repository.fullName}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{item.score}%</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">match</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{item.repository.primaryLanguage ?? "Unknown"}</span>
                  <span>{item.repository.difficultyLevel}</span>
                  <span>{item.repository.starsCount} stars</span>
                  <span>{item.repository.openIssuesCount} open issues</span>
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
