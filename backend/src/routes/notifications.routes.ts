import { Router } from "express";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notifications.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authMiddleware } from "../middleware/auth.js";

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);
notificationsRouter.get("/", asyncHandler(listNotifications));
notificationsRouter.patch("/read-all", asyncHandler(markAllNotificationsRead));
notificationsRouter.patch("/:id/read", asyncHandler(markNotificationRead));
notificationsRouter.delete("/:id", asyncHandler(deleteNotification));
