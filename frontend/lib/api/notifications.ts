"use client";

import type { NotificationMutationResponse, NotificationsResponse } from "@openforge/shared";
import { clearDashboardCache } from "./dashboard";
import { apiRequest } from "./client";

export function fetchNotifications() {
  return apiRequest<NotificationsResponse>("/notifications");
}

export async function markNotificationRead(id: string) {
  const response = await apiRequest<NotificationMutationResponse>(`/notifications/${id}/read`, {
    method: "PATCH"
  });
  clearDashboardCache();

  return response;
}

export async function markAllNotificationsRead() {
  const response = await apiRequest<NotificationMutationResponse>("/notifications/read-all", {
    method: "PATCH"
  });
  clearDashboardCache();

  return response;
}

export async function deleteNotification(id: string) {
  const response = await apiRequest<NotificationMutationResponse>(`/notifications/${id}`, {
    method: "DELETE"
  });
  clearDashboardCache();

  return response;
}
