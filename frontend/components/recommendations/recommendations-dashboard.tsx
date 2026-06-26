"use client";

import type {
  RecommendedIssue,
  RecommendedRepository,
  SkillProfileSummary
} from "@opensource-compass/shared";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  analyzeSkills,
  fetchIssueRecommendations,
  fetchRepositoryRecommendations,
  fetchSkillProfile
} from "@/lib/api/recommendations";
import { fetchGitHubProfile, getGitHubSyncStatus, type GitHubSyncStatus } from "@/lib/api/github";
import { SyncRequiredState } from "@/components/github/sync-required-state";
import { SkillProfileCard } from "./skill-profile-card";

export function RecommendationsDashboard() {
  const [skillProfile, setSkillProfile] = useState<SkillProfileSummary | null>(null);
  const [repositories, setRepositories] = useState<RecommendedRepository[]>([]);
  const [issues, setIssues] = useState<RecommendedIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<GitHubSyncStatus>("not_synced");
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const profileResponse = await fetchGitHubProfile();
    const nextSyncStatus = getGitHubSyncStatus(profileResponse.profile);

    setSyncStatus(nextSyncStatus);

    if (nextSyncStatus !== "synced") {
      setSkillProfile(null);
      setRepositories([]);
      setIssues([]);
      return;
    }

    const [skillResponse, repositoryResponse, issueResponse] = await Promise.all([
      fetchSkillProfile(),
      fetchRepositoryRecommendations(),
      fetchIssueRecommendations()
    ]);

    setSkillProfile(skillResponse.skillProfile);
    setRepositories(repositoryResponse.recommendations);
    setIssues(issueResponse.recommendations);
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError(null);

    try {
      const profileResponse = await fetchGitHubProfile();

      if (getGitHubSyncStatus(profileResponse.profile) !== "synced") {
        setSyncStatus("not_synced");
        return;
      }

      const response = await analyzeSkills();
      setSkillProfile(response.skillProfile);
      await loadData();
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : "Unable to analyze skills");
    } finally {
      setIsAnalyzing(false);
    }
  }

  useEffect(() => {
    loadData()
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load recommendations");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-5 text-card-foreground">
        <p className="text-sm text-muted-foreground">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Recommendations</h2>
          <p className="text-sm text-muted-foreground">
            Analyze synced GitHub data and generate deterministic matches.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {isAnalyzing ? "Analyzing..." : "Analyze skills"}
        </button>
      </div>

      {syncStatus !== "synced" ? <SyncRequiredState onSynced={loadData} /> : null}

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-card p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {syncStatus === "synced" ? <SkillProfileCard skillProfile={skillProfile} /> : null}

      {syncStatus === "synced" ? <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 text-card-foreground">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-medium">Top repositories</h3>
            <Link href="/app/recommendations" className="text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          {repositories.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No repository recommendations yet. Analyze skills after syncing repositories.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {repositories.slice(0, 3).map((item) => (
                <li key={item.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.repository.fullName}</span>
                    <span className="text-sm font-semibold">{item.score}%</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 text-card-foreground">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-medium">Top issues</h3>
            <Link href="/app/issues" className="text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          {issues.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No issue recommendations yet. Sync issues for repositories first.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {issues.slice(0, 3).map((item) => (
                <li key={item.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">#{item.issue.number} {item.issue.title}</span>
                    <span className="text-sm font-semibold">{item.score}%</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.issue.repository.fullName}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div> : null}
    </section>
  );
}
