"use client";

export interface RecommendationFilterValues {
  language: string;
  difficulty: string;
  health: string;
  label: string;
}

interface RecommendationFiltersProps {
  language: string;
  difficulty: string;
  health?: string;
  label?: string;
  onChange: (filters: RecommendationFilterValues) => void;
  showHealth?: boolean;
  showLabel?: boolean;
}

export function RecommendationFilters({
  language,
  difficulty,
  health,
  label,
  onChange,
  showHealth,
  showLabel
}: RecommendationFiltersProps) {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 text-card-foreground md:grid-cols-4">
      <input
        value={language}
        onChange={(event) =>
          onChange({ language: event.target.value, difficulty, health: health ?? "", label: label ?? "" })
        }
        placeholder="Language"
        className="rounded-md border bg-background px-3 py-2 text-sm"
      />
      <select
        value={difficulty}
        onChange={(event) =>
          onChange({ language, difficulty: event.target.value, health: health ?? "", label: label ?? "" })
        }
        className="rounded-md border bg-background px-3 py-2 text-sm"
      >
        <option value="">Any difficulty</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      {showHealth ? (
        <select
          value={health ?? ""}
          onChange={(event) =>
            onChange({ language, difficulty, health: event.target.value, label: label ?? "" })
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Any health</option>
          <option value="high">High health</option>
          <option value="low">Needs attention</option>
        </select>
      ) : null}
      {showLabel ? (
        <input
          value={label ?? ""}
          onChange={(event) =>
            onChange({ language, difficulty, health: health ?? "", label: event.target.value })
          }
          placeholder="Issue label"
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      ) : null}
    </div>
  );
}
