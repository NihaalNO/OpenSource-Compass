import { Router } from "express";
import {
  generateRepositoryIntelligence,
  getRepositoryIntelligence
} from "../controllers/repository-intelligence.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authMiddleware } from "../middleware/auth.js";

export const repositoryIntelligenceRouter = Router();

repositoryIntelligenceRouter.use(authMiddleware);
repositoryIntelligenceRouter.get("/:repositoryId/intelligence", asyncHandler(getRepositoryIntelligence));
repositoryIntelligenceRouter.post("/:repositoryId/intelligence/generate", asyncHandler(generateRepositoryIntelligence));
