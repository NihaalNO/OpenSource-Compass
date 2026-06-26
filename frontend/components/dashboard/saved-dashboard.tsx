"use client";

import type { SavedIssueItem, SavedRepositoryItem } from "@opensource-compass/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchSavedIssues, fetchSavedRepositories } from "@/lib/api/dashboard";
import { unsaveRecommendedIssue, unsaveRecommendedRepository } from "@/lib/api/recommendations";

export function SavedDashboard() {
  const [repositories, setRepositories] = useState<SavedRepositoryItem[]>([]);
  const [issues, setIssues] = useState<SavedIssueItem[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    const [repositoryResponse, issueResponse] = await Promise.all([
      fetchSavedRepositories(),
      fetchSavedIssues()
    ]);
    setRepositories(repositoryResponse.repositories);
    setIssues(issueResponse.issues);
  }

  useEffect(() => {
    load()
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Saved items failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRepositories = useMemo(
    () =>
      repositories.filter((item) =>
        item.repository.fullName.toLowerCase().includes(query.toLowerCase())
      ),
    [query, repositories]
  );
  const filteredIssues = useMemo(
    () => issues.filter((item) => item.issue.title.toLowerCase().includes(query.toLowerCase())),
    [issues, query]
  );

  async function removeRepository(repositoryId: string) {
    await unsaveRecommendedRepository(repositoryId);
    setRepositories((items) => items.filter((item) => item.repository.id !== repositoryId));
  }

  async function removeIssue(issueId: string) {
    await unsaveRecommendedIssue(issueId);
    setIssues((items) => items.filter((item) => item.issue.id !== issueId));
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Saved</p>
          <h1 className="mt-1 text-2xl font-semibold">Saved repositories and issues</h1>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search saved items"
          className="linear-input w-full sm:w-72"
        />
      </div>

      {error ? <div className="linear-card p-4 text-sm text-destructive">{error}</div> : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="linear-card p-5">
          <h2 className="text-lg font-semibold">Saved repositories</h2>
          {filteredRepositories.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No saved repositories match your search.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {filteredRepositories.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/app/repositories/${item.repository.ownerLogin}/${item.repository.name}`}
                        className="font-medium hover:underline"
                      >
                        {item.repository.fullName}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{item.repository.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeRepository(item.repository.id)}
                      className="linear-button"
                    >
                      Remove
                    </button>
                  </div>
                  {item.repository.cachedAiSummary ? (
                    <p className="mt-3 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                      {item.repository.cachedAiSummary.summary}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="linear-card p-5">
          <h2 className="text-lg font-semibold">Saved issues</h2>
          {filteredIssues.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No saved issues match your search.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {filteredIssues.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/app/issues/${item.issue.id}`} className="font-medium hover:underline">
                        #{item.issue.number} {item.issue.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{item.issue.repository.fullName}</p>
                    </div>
                    <button type="button" onClick={() => void removeIssue(item.issue.id)} className="linear-button">
                      Remove
                    </button>
                  </div>
                  {item.issue.cachedAiExplanation ? (
                    <p className="mt-3 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                      {item.issue.cachedAiExplanation.summary}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
