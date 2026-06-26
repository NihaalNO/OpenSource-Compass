import { Router } from "express";
import {
  getCurrentAuthenticatedUser,
  getCurrentSession,
  logout
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.get("/me", authMiddleware, getCurrentAuthenticatedUser);
authRouter.get("/session", authMiddleware, getCurrentSession);
authRouter.post("/logout", authMiddleware, logout);

