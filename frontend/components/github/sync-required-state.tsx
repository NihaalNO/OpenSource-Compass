"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { syncGitHubData } from "@/lib/api/github";

interface SyncRequiredStateProps {
  onSynced?: () => Promise<void> | void;
}

export function SyncRequiredState({ onSynced }: SyncRequiredStateProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setError(null);

    try {
      await syncGitHubData();
      await onSynced?.();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "GitHub sync failed");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-5 text-card-foreground">
      <h2 className="text-lg font-medium">Sync your GitHub account to generate recommendations.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Recommendations are available after your GitHub profile and repositories have been synced.
      </p>
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        {isSyncing ? "Syncing..." : "Sync GitHub"}
      </button>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
