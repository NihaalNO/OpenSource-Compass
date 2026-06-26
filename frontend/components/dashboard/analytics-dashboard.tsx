"use client";

import type { DashboardAnalyticsResponse } from "@opensource-compass/shared";
import { useEffect, useState } from "react";
import { fetchDashboardAnalytics } from "@/lib/api/dashboard";

function BarList({ title, items }: { title: string; items: Array<{ name: string; value: number }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="linear-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No data synced yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardAnalytics()
      .then(setAnalytics)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Analytics failed to load"));
  }, []);

  if (error) {
    return <div className="linear-card p-5 text-sm text-destructive">{error}</div>;
  }

  if (!analytics) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />;
  }

  const metricCards = [
    ["PRs opened", analytics.totals.pullRequestsOpened],
    ["PRs merged", analytics.totals.pullRequestsMerged],
    ["Issues solved", analytics.totals.issuesSolved],
    ["Repos contributed", analytics.totals.repositoriesContributed],
    ["Streak", `${analytics.totals.contributionStreakDays}d`]
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Analytics</p>
        <h1 className="mt-1 text-2xl font-semibold">Contribution insights</h1>
      </div>

      <section className="grid gap-3 md:grid-cols-5">
        {metricCards.map(([label, value]) => (
          <div key={label} className="linear-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <BarList title="Languages used" items={analytics.languages} />
        <BarList title="Repository contributions" items={analytics.repositories} />
        <BarList
          title="Weekly activity"
          items={analytics.weeklyActivity.map((item) => ({
            name: item.label,
            value: item.prs + item.issues
          }))}
        />
        <BarList
          title="Monthly activity"
          items={analytics.monthlyActivity.map((item) => ({
            name: item.label,
            value: item.prs + item.issues
          }))}
        />
      </section>
    </div>
  );
}
