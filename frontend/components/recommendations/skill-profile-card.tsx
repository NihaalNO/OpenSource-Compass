"use client";

import type { SkillProfileSummary } from "@opensource-compass/shared";

interface SkillProfileCardProps {
  skillProfile: SkillProfileSummary | null;
}

function renderEntries(entries: Record<string, number>) {
  const topEntries = Object.entries(entries).slice(0, 5);

  if (topEntries.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {topEntries.map(([label, score]) => (
        <span key={label} className="rounded-md border px-2 py-1 text-xs">
          {label} · {score}
        </span>
      ))}
    </div>
  );
}

export function SkillProfileCard({ skillProfile }: SkillProfileCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5 text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Skill profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Deterministic analysis from synced repositories, languages, topics, and activity.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{skillProfile?.skillScore ?? 0}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {skillProfile?.experienceLevel ?? "not analyzed"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium">Languages</h3>
          {renderEntries(skillProfile?.languages ?? {})}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Topics</h3>
          {renderEntries(skillProfile?.topics ?? {})}
        </div>
      </div>
    </div>
  );
}
