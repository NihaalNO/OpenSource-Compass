"use client";

import type {
  AnalyzeSkillsResponse,
  RecommendedIssuesResponse,
  RecommendedRepositoriesResponse,
  SavedIssueResponse,
  SavedRepositoryResponse,
  SkillProfileResponse
} from "@openforge/shared";
import { apiRequest } from "./client";

interface RecommendationFilters {
  language?: string;
  difficulty?: string;
  health?: string;
  label?: string;
}

function toQueryString(filters: RecommendationFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function analyzeSkills() {
  return apiRequest<AnalyzeSkillsResponse>("/recommendations/analyze-skills", {
    method: "POST"
  });
}

export function fetchSkillProfile() {
  return apiRequest<SkillProfileResponse>("/recommendations/skill-profile");
}

export function fetchRepositoryRecommendations(filters: RecommendationFilters = {}) {
  return apiRequest<RecommendedRepositoriesResponse>(
    `/recommendations/repositories${toQueryString(filters)}`
  );
}

export function fetchIssueRecommendations(filters: RecommendationFilters = {}) {
  return apiRequest<RecommendedIssuesResponse>(`/recommendations/issues${toQueryString(filters)}`);
}

export function saveRecommendedRepository(repositoryId: string) {
  return apiRequest<SavedRepositoryResponse>(`/recommendations/repositories/${repositoryId}/save`, {
    method: "POST"
  });
}

export function unsaveRecommendedRepository(repositoryId: string) {
  return apiRequest<SavedRepositoryResponse>(`/recommendations/repositories/${repositoryId}/save`, {
    method: "DELETE"
  });
}

export function saveRecommendedIssue(issueId: string) {
  return apiRequest<SavedIssueResponse>(`/recommendations/issues/${issueId}/save`, {
    method: "POST"
  });
}

export function unsaveRecommendedIssue(issueId: string) {
  return apiRequest<SavedIssueResponse>(`/recommendations/issues/${issueId}/save`, {
    method: "DELETE"
  });
}
