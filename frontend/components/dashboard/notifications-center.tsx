"use client";

import type { NotificationItem } from "@opensource-compass/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/lib/api/notifications";

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    const response = await fetchNotifications();
    setNotifications(response.notifications);
  }

  useEffect(() => {
    load()
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Notifications failed to load"))
      .finally(() => setIsLoading(false));
  }, []);

  async function markRead(id: string) {
    await markNotificationRead(id);
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
    );
  }

  async function markAllRead() {
    await markAllNotificationsRead();
    const readAt = new Date().toISOString();
    setNotifications((items) => items.map((item) => ({ ...item, readAt })));
  }

  async function remove(id: string) {
    await deleteNotification(id);
    setNotifications((items) => items.filter((item) => item.id !== id));
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Notifications</p>
          <h1 className="mt-1 text-2xl font-semibold">Notification center</h1>
        </div>
        <button type="button" onClick={() => void markAllRead()} className="linear-button">
          Mark all as read
        </button>
      </div>

      {error ? <div className="linear-card p-4 text-sm text-destructive">{error}</div> : null}

      <div className="linear-card divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${notification.readAt ? "bg-muted" : "bg-primary"}`}
                    aria-hidden="true"
                  />
                  <p className="font-medium">{notification.title}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                {notification.actionUrl ? (
                  <Link href={notification.actionUrl} className="mt-2 inline-flex text-sm text-primary">
                    Open
                  </Link>
                ) : null}
              </div>
              <div className="flex gap-2">
                {!notification.readAt ? (
                  <button type="button" onClick={() => void markRead(notification.id)} className="linear-button">
                    Read
                  </button>
                ) : null}
                <button type="button" onClick={() => void remove(notification.id)} className="linear-button">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
