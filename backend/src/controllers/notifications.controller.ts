import type { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../lib/http-error.js";
import { notificationsService } from "../services/notifications.service.js";

function requireUserId(req: Request) {
  if (!req.auth) {
    throw new UnauthorizedError();
  }

  return req.auth.userId;
}

function requireParam(req: Request, name: string) {
  const value = req.params[name];

  if (!value) {
    throw new NotFoundError(`${name} route parameter is required`);
  }

  return value;
}

export async function listNotifications(req: Request, res: Response) {
  res.json(await notificationsService.list(requireUserId(req)));
}

export async function markNotificationRead(req: Request, res: Response) {
  res.json(await notificationsService.markRead(requireUserId(req), requireParam(req, "id")));
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  res.json(await notificationsService.markAllRead(requireUserId(req)));
}

export async function deleteNotification(req: Request, res: Response) {
  res.json(await notificationsService.delete(requireUserId(req), requireParam(req, "id")));
}
