"use client";

import type { CurrentUserResponse, LogoutResponse, SessionResponse } from "@opensource-compass/shared";
import { apiRequest } from "./client";

export function fetchCurrentUser() {
  return apiRequest<CurrentUserResponse>("/auth/me");
}

export function fetchCurrentSession() {
  return apiRequest<SessionResponse>("/auth/session");
}

export function notifyBackendLogout() {
  return apiRequest<LogoutResponse>("/auth/logout", {
    method: "POST"
  });
}

