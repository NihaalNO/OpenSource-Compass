"use client";

import type { AppSettings } from "@opensource-compass/shared";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { fetchSettings, updateSettings } from "@/lib/api/settings";

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings()
      .then((response) => setSettings(response.settings))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Settings failed to load"));
  }, []);

  async function save(input: Partial<Pick<AppSettings, "displayName" | "theme" | "timezone">> & {
    ai?: Partial<AppSettings["ai"]>;
  }) {
    setStatus("Saving...");
    setError(null);

    try {
      const response = await updateSettings(input);
      setSettings(response.settings);
      setStatus("Saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Settings save failed");
      setStatus(null);
    }
  }

  if (!settings) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold">Workspace preferences</h1>
      </div>

      {error ? <div className="linear-card p-4 text-sm text-destructive">{error}</div> : null}
      {status ? <div className="linear-card p-4 text-sm text-muted-foreground">{status}</div> : null}

      <section className="linear-card divide-y divide-border">
        <div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]">
          <div>
            <h2 className="font-semibold">General</h2>
            <p className="mt-1 text-sm text-muted-foreground">Display and local preferences.</p>
          </div>
          <div className="grid gap-3">
            <input
              value={settings.displayName ?? ""}
              onChange={(event) => setSettings({ ...settings, displayName: event.target.value })}
              onBlur={() => void save({ displayName: settings.displayName })}
              placeholder="Display name"
              className="linear-input"
            />
            <select
              value={settings.theme}
              onChange={(event) => void save({ theme: event.target.value as AppSettings["theme"] })}
              className="linear-input"
            >
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
            <input
              value={settings.timezone}
              onChange={(event) => setSettings({ ...settings, timezone: event.target.value })}
              onBlur={() => void save({ timezone: settings.timezone })}
              className="linear-input"
            />
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]">
          <div>
            <h2 className="font-semibold">GitHub</h2>
            <p className="mt-1 text-sm text-muted-foreground">Connected account and sync status.</p>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-sm">
            <p>{settings.github.connected ? `@${settings.github.username}` : "Not connected"}</p>
            <p className="mt-1 text-muted-foreground">
              Last sync: {settings.github.lastSyncedAt ?? "Not synced"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]">
          <div>
            <h2 className="font-semibold">AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">Provider preferences for future generations.</p>
          </div>
          <div className="grid gap-3">
            <select
              value={settings.ai.defaultProvider}
              onChange={(event) =>
                void save({ ai: { defaultProvider: event.target.value as AppSettings["ai"]["defaultProvider"] } })
              }
              className="linear-input"
            >
              <option value="openai">OpenAI compatible</option>
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
              <option value="ollama">Ollama</option>
            </select>
            <input
              value={settings.ai.preferredModel ?? ""}
              onChange={(event) =>
                setSettings({ ...settings, ai: { ...settings.ai, preferredModel: event.target.value } })
              }
              onBlur={() => void save({ ai: { preferredModel: settings.ai.preferredModel } })}
              placeholder="Preferred model"
              className="linear-input"
            />
            <select
              value={settings.ai.outputLength}
              onChange={(event) =>
                void save({ ai: { outputLength: event.target.value as AppSettings["ai"]["outputLength"] } })
              }
              className="linear-input"
            >
              <option value="short">Short</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </select>
            <select
              value={settings.ai.cachePreference}
              onChange={(event) =>
                void save({ ai: { cachePreference: event.target.value as AppSettings["ai"]["cachePreference"] } })
              }
              className="linear-input"
            >
              <option value="reuse">Reuse cached results</option>
              <option value="regenerate">Prefer regenerate</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]">
          <div>
            <h2 className="font-semibold">Account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Session and account actions.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LogoutButton />
            <button type="button" className="linear-button" disabled>
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
