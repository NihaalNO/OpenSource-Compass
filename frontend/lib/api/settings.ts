"use client";

import type { AppSettings, SettingsResponse } from "@openforge/shared";
import { apiRequest } from "./client";

export function fetchSettings() {
  return apiRequest<SettingsResponse>("/settings");
}

export function updateSettings(input: Partial<Pick<AppSettings, "displayName" | "theme" | "timezone">> & {
  ai?: Partial<AppSettings["ai"]>;
}) {
  return apiRequest<SettingsResponse>("/settings", {
    method: "PUT",
    body: JSON.stringify(input)
  });
}
