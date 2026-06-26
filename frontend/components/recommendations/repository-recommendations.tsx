"use client";

import type { RecommendedRepository } from "@opensource-compass/shared";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"score" | "stars" | "activity">("score");
  const [page, setPage] = useState(1);
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
    setPage(1);
    loadRecommendations(nextFilters).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to apply filters");
    });
  }

  const visibleRecommendations = useMemo(() => {
    return [...recommendations]
      .filter((item) =>
        item.repository.fullName.toLowerCase().includes(query.toLowerCase()) ||
        item.reason?.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === "stars") {
          return b.repository.starsCount - a.repository.starsCount;
        }
        if (sort === "activity") {
          return b.activityScore - a.activityScore;
        }

        return b.score - a.score;
      });
  }, [query, recommendations, sort]);

  const pagedRecommendations = visibleRecommendations.slice((page - 1) * 8, page * 8);
  const totalPages = Math.max(1, Math.ceil(visibleRecommendations.length / 8));

  return (
    <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Deterministic matching</p>
          <h1 className="mt-1 text-2xl font-semibold">Recommended repositories</h1>
        </div>

        <RecommendationFilters
          language={filters.language}
          difficulty={filters.difficulty}
          health={filters.health}
          showHealth
          onChange={handleFiltersChange}
        />

        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search repositories"
            className="linear-input min-w-0 flex-1"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="linear-input"
          >
            <option value="score">Sort by match</option>
            <option value="stars">Sort by stars</option>
            <option value="activity">Sort by activity</option>
          </select>
        </div>

        {syncStatus !== "synced" ? <SyncRequiredState onSynced={() => loadRecommendations()} /> : null}

        {error ? <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</div> : null}

        {syncStatus !== "synced" ? null : isLoading ? (
          <div className="rounded-lg border bg-card p-5 text-card-foreground">Loading recommendations...</div>
        ) : visibleRecommendations.length === 0 ? (
          <div className="linear-card p-5">
            <h2 className="text-lg font-medium">No repository recommendations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sync repositories, run skill analysis, or adjust your search and filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
            {pagedRecommendations.map((item) => (
              <div key={item.id} className="linear-card p-5">
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
                  <span>Health {item.repository.healthScore ?? 0}%</span>
                  <span>{item.repository.starsCount} stars</span>
                  <span>{item.repository.openIssuesCount} open issues</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.repository.topics.slice(0, 6).map((topic) => (
                    <span key={topic} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                      {topic}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void toggleSave(item)}
                  className="linear-button mt-4"
                >
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  {item.isSaved ? "Unsave" : "Save"}
                </button>
              </div>
            ))}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button type="button" className="linear-button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
                  Previous
                </button>
                <button type="button" className="linear-button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
  );
}
