"use client";

import type { AiLearningRoadmap } from "@opensource-compass/shared";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { generateLearningRoadmap } from "@/lib/api/ai";
import { AiResultList } from "./ai-result-list";

export function LearningRoadmapPanel() {
  const [roadmap, setRoadmap] = useState<AiLearningRoadmap | null>(null);
  const [cached, setCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runRoadmap(regenerate = false) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateLearningRoadmap(regenerate);
      setRoadmap(response.analysis);
      setCached(response.cached);
    } catch (roadmapError) {
      setError(roadmapError instanceof Error ? roadmapError.message : "Roadmap generation failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              AI roadmap
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Learning Roadmap</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void runRoadmap(false)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Generating..." : roadmap ? "Load cached" : "Generate roadmap"}
            </button>
            {roadmap ? (
              <button
                type="button"
                onClick={() => void runRoadmap(true)}
                disabled={isLoading}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
              >
                Regenerate
              </button>
            ) : null}
          </div>
        </div>

        {error ? <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</div> : null}
        {cached ? <p className="text-xs uppercase tracking-wide text-muted-foreground">Cached result</p> : null}

        {roadmap ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-5 text-card-foreground">
                <AiResultList title="Current skills" items={roadmap.currentSkills} />
              </div>
              <div className="rounded-lg border bg-card p-5 text-card-foreground">
                <AiResultList title="Missing skills" items={roadmap.missingSkills} />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-5 text-card-foreground">
              <h2 className="text-lg font-medium">Weekly plan</h2>
              <div className="mt-4 grid gap-3">
                {roadmap.weeklyRoadmap.map((week) => (
                  <div key={week.week} className="rounded-md border p-4">
                    <h3 className="font-medium">Week {week.week}: {week.focus}</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {week.tasks.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-5 text-card-foreground">
                <AiResultList title="Suggested repositories" items={roadmap.suggestedRepositories} />
              </div>
              <div className="rounded-lg border bg-card p-5 text-card-foreground">
                <AiResultList title="Suggested issues" items={roadmap.suggestedIssues} />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border bg-card p-5 text-card-foreground">
            <p className="text-sm text-muted-foreground">
              Generate a roadmap after syncing GitHub data and running deterministic recommendations.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
