"use client";

import type {
  DashboardAnalyticsResponse,
  DashboardResponse,
  SavedIssuesResponse,
  SavedRepositoriesResponse
} from "@openforge/shared";
import { apiRequest } from "./client";

let dashboardCache: DashboardResponse | null = null;
let analyticsCache: DashboardAnalyticsResponse | null = null;

export function clearDashboardCache() {
  dashboardCache = null;
  analyticsCache = null;
}

export async function fetchDashboard(options: { force?: boolean } = {}) {
  if (!options.force && dashboardCache) {
    return dashboardCache;
  }

  dashboardCache = await apiRequest<DashboardResponse>("/dashboard");

  return dashboardCache;
}

export async function fetchDashboardAnalytics(options: { force?: boolean } = {}) {
  if (!options.force && analyticsCache) {
    return analyticsCache;
  }

  analyticsCache = await apiRequest<DashboardAnalyticsResponse>("/dashboard/analytics");

  return analyticsCache;
}

export function fetchSavedRepositories() {
  return apiRequest<SavedRepositoriesResponse>("/dashboard/saved-repositories");
}

export function fetchSavedIssues() {
  return apiRequest<SavedIssuesResponse>("/dashboard/saved-issues");
}
