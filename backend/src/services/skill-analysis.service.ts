import type { SkillProfileSummary } from "@opensource-compass/shared";
import { getSupabaseServiceClient } from "../lib/supabase.js";

interface RepositorySkillRow {
  id: string;
  primary_language: string | null;
  languages: Record<string, number> | null;
  topics: string[] | null;
  stars_count: number;
  forks_count: number;
  pushed_at: string | null;
}

interface GitHubAccountRow {
  username: string;
}

interface SkillProfileRow {
  id: string;
  languages: Record<string, number>;
  frameworks: Record<string, number>;
  tools: Record<string, number>;
  topics: Record<string, number>;
  experience_level: "beginner" | "intermediate" | "advanced";
  skill_score: number;
  confidence_score: number;
  analyzed_at: string | null;
}

function normalizeScores(counter: Map<string, number>) {
  const maxScore = Math.max(...counter.values(), 1);
  const entries = [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, value]) => [key, Math.round((value / maxScore) * 100)]);

  return Object.fromEntries(entries) as Record<string, number>;
}

function getExperienceLevel(repositoryCount: number, skillScore: number) {
  if (repositoryCount >= 12 && skillScore >= 70) {
    return "advanced";
  }

  if (repositoryCount >= 5 && skillScore >= 45) {
    return "intermediate";
  }

  return "beginner";
}

function toSkillProfileSummary(row: SkillProfileRow): SkillProfileSummary {
  return {
    id: row.id,
    experienceLevel: row.experience_level,
    skillScore: Number(row.skill_score),
    confidenceScore: Number(row.confidence_score),
    languages: row.languages ?? {},
    frameworks: row.frameworks ?? {},
    tools: row.tools ?? {},
    topics: row.topics ?? {},
    analyzedAt: row.analyzed_at
  };
}

export class SkillAnalysisService {
  private readonly supabase = getSupabaseServiceClient();

  async analyzeUser(userId: string) {
    const account = await this.getGitHubAccount(userId);
    const repositories = await this.getRepositories(account.username);
    const languageCounter = new Map<string, number>();
    const topicCounter = new Map<string, number>();
    const frameworkCounter = new Map<string, number>();

    for (const repository of repositories) {
      if (repository.primary_language) {
        languageCounter.set(
          repository.primary_language,
          (languageCounter.get(repository.primary_language) ?? 0) + 25
        );
      }

      for (const [language, bytes] of Object.entries(repository.languages ?? {})) {
        languageCounter.set(language, (languageCounter.get(language) ?? 0) + Math.log10(bytes + 10));
      }

      for (const topic of repository.topics ?? []) {
        topicCounter.set(topic, (topicCounter.get(topic) ?? 0) + 15);

        if (["react", "nextjs", "express", "nodejs", "tailwindcss", "supabase"].includes(topic)) {
          frameworkCounter.set(topic, (frameworkCounter.get(topic) ?? 0) + 20);
        }
      }
    }

    const languages = normalizeScores(languageCounter);
    const topics = normalizeScores(topicCounter);
    const frameworks = normalizeScores(frameworkCounter);
    const repositoryCount = repositories.length;
    const activityScore = Math.min(30, repositoryCount * 3);
    const diversityScore = Math.min(30, Object.keys(languages).length * 6);
    const popularityScore = Math.min(
      20,
      repositories.reduce((sum, repo) => sum + Math.log10(repo.stars_count + repo.forks_count + 1), 0)
    );
    const topicScore = Math.min(20, Object.keys(topics).length * 2);
    const skillScore = Math.round(activityScore + diversityScore + popularityScore + topicScore);
    const confidenceScore = Math.min(100, Math.round(repositoryCount * 8 + Object.keys(languages).length * 5));
    const experienceLevel = getExperienceLevel(repositoryCount, skillScore);
    const analyzedAt = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("skill_profiles")
      .upsert(
        {
          user_id: userId,
          languages,
          frameworks,
          tools: {},
          topics,
          experience_level: experienceLevel,
          skill_score: skillScore,
          confidence_score: confidenceScore,
          source_snapshot: {
            repositoryCount,
            topRepositoryIds: repositories.slice(0, 20).map((repository) => repository.id)
          },
          analyzed_at: analyzedAt
        },
        {
          onConflict: "user_id"
        }
      )
      .select(
        "id,languages,frameworks,tools,topics,experience_level,skill_score,confidence_score,analyzed_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return toSkillProfileSummary(data as SkillProfileRow);
  }

  async getSkillProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("skill_profiles")
      .select(
        "id,languages,frameworks,tools,topics,experience_level,skill_score,confidence_score,analyzed_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? toSkillProfileSummary(data as SkillProfileRow) : null;
  }

  private async getGitHubAccount(userId: string) {
    const { data, error } = await this.supabase
      .from("github_accounts")
      .select("username")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }

    return data as GitHubAccountRow;
  }

  private async getRepositories(username: string) {
    const { data, error } = await this.supabase
      .from("github_repositories")
      .select("id,primary_language,languages,topics,stars_count,forks_count,pushed_at")
      .eq("owner_login", username);

    if (error) {
      throw error;
    }

    return data as RepositorySkillRow[];
  }
}

export const skillAnalysisService = new SkillAnalysisService();
