import type { AppSettings, SettingsResponse } from "@opensource-compass/shared";
import { env } from "../config/env.js";
import { getSupabaseServiceClient } from "../lib/supabase.js";

type SettingsInput = Partial<{
  displayName: string | null;
  theme: AppSettings["theme"];
  timezone: string;
  ai: Partial<AppSettings["ai"]>;
}>;

function normalizeSettings(
  displayName: string | null,
  github: AppSettings["github"],
  stored: Record<string, unknown>
): AppSettings {
  const ai = (stored.ai ?? {}) as Partial<AppSettings["ai"]>;

  return {
    displayName,
    theme: stored.theme === "light" || stored.theme === "dark" ? stored.theme : "system",
    timezone: typeof stored.timezone === "string" ? stored.timezone : "UTC",
    github,
    ai: {
      defaultProvider:
        ai.defaultProvider === "gemini" || ai.defaultProvider === "groq" || ai.defaultProvider === "ollama"
          ? ai.defaultProvider
          : env.AI_PROVIDER,
      preferredModel: typeof ai.preferredModel === "string" && ai.preferredModel ? ai.preferredModel : env.AI_DEFAULT_MODEL ?? null,
      outputLength:
        ai.outputLength === "short" || ai.outputLength === "detailed" ? ai.outputLength : "balanced",
      cachePreference: ai.cachePreference === "regenerate" ? "regenerate" : "reuse"
    }
  };
}

export class SettingsService {
  private readonly supabase = getSupabaseServiceClient();

  async get(userId: string): Promise<SettingsResponse> {
    const [userResult, profileResult, githubResult] = await Promise.all([
      this.supabase.from("users").select("display_name").eq("id", userId).single(),
      this.supabase.from("user_profiles").select("settings").eq("user_id", userId).maybeSingle(),
      this.supabase.from("github_accounts").select("username,last_synced_at").eq("user_id", userId).maybeSingle()
    ]);

    if (userResult.error) {
      throw userResult.error;
    }
    if (profileResult.error) {
      throw profileResult.error;
    }
    if (githubResult.error) {
      throw githubResult.error;
    }

    return {
      settings: normalizeSettings(
        userResult.data.display_name,
        {
          username: githubResult.data?.username ?? null,
          connected: Boolean(githubResult.data?.username),
          lastSyncedAt: githubResult.data?.last_synced_at ?? null
        },
        (profileResult.data?.settings as Record<string, unknown> | null) ?? {}
      )
    };
  }

  async update(userId: string, input: SettingsInput): Promise<SettingsResponse> {
    const current = await this.get(userId);

    if (typeof input.displayName !== "undefined") {
      const { error } = await this.supabase
        .from("users")
        .update({ display_name: input.displayName })
        .eq("id", userId);

      if (error) {
        throw error;
      }
    }

    const mergedSettings = {
      theme: input.theme ?? current.settings.theme,
      timezone: input.timezone ?? current.settings.timezone,
      ai: {
        ...current.settings.ai,
        ...(input.ai ?? {})
      }
    };

    const { error } = await this.supabase
      .from("user_profiles")
      .update({ settings: mergedSettings })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return this.get(userId);
  }
}

export const settingsService = new SettingsService();
