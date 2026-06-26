import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authMiddleware } from "../middleware/auth.js";

export const settingsRouter = Router();

settingsRouter.use(authMiddleware);
settingsRouter.get("/", asyncHandler(getSettings));
settingsRouter.put("/", asyncHandler(updateSettings));
