import type { Request, Response } from "express";
import { UnauthorizedError } from "../lib/http-error.js";
import { settingsService } from "../services/settings.service.js";

function requireUserId(req: Request) {
  if (!req.auth) {
    throw new UnauthorizedError();
  }

  return req.auth.userId;
}

export async function getSettings(req: Request, res: Response) {
  res.json(await settingsService.get(requireUserId(req)));
}

export async function updateSettings(req: Request, res: Response) {
  res.json(await settingsService.update(requireUserId(req), req.body ?? {}));
}
