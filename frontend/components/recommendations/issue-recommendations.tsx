"use client";

import type { RecommendedIssue } from "@opensource-compass/shared";
import { Bookmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"score" | "freshness" | "effort">("score");
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
    setPage(1);
    loadRecommendations(nextFilters).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Unable to apply filters");
    });
  }

  const visibleRecommendations = useMemo(() => {
    return [...recommendations]
      .filter((item) =>
        item.issue.title.toLowerCase().includes(query.toLowerCase()) ||
        item.issue.repository.fullName.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === "freshness") {
          return b.freshnessScore - a.freshnessScore;
        }
        if (sort === "effort") {
          return (a.issue.estimatedEffortHours ?? 999) - (b.issue.estimatedEffortHours ?? 999);
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
          <h1 className="mt-1 text-2xl font-semibold">Recommended issues</h1>
        </div>

        <RecommendationFilters
          language={filters.language}
          difficulty={filters.difficulty}
          label={filters.label}
          showLabel
          onChange={handleFiltersChange}
        />

        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search issues"
            className="linear-input min-w-0 flex-1"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="linear-input"
          >
            <option value="score">Sort by match</option>
            <option value="freshness">Sort by freshness</option>
            <option value="effort">Sort by effort</option>
          </select>
        </div>

        {syncStatus !== "synced" ? <SyncRequiredState onSynced={() => loadRecommendations()} /> : null}

        {error ? <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</div> : null}

        {syncStatus !== "synced" ? null : isLoading ? (
          <div className="rounded-lg border bg-card p-5 text-card-foreground">Loading issue recommendations...</div>
        ) : visibleRecommendations.length === 0 ? (
          <div className="linear-card p-5">
            <h2 className="text-lg font-medium">No issue recommendations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sync issues, run skill analysis, or adjust your search and filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
            {pagedRecommendations.map((item) => (
              <div key={item.id} className="linear-card p-5">
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
                    <span key={label} className="rounded-md border border-border px-2 py-1 text-xs">
                      {label}
                    </span>
                  ))}
                  <span className="rounded-md border border-border px-2 py-1 text-xs">
                    {item.issue.difficultyLevel}
                  </span>
                  <span className="rounded-md border border-border px-2 py-1 text-xs">
                    {item.issue.estimatedEffortHours ?? "?"}h
                  </span>
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
