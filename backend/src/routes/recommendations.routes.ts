import { Router } from "express";
import {
  analyzeSkills,
  getIssueRecommendations,
  getRepositoryRecommendations,
  getSkillProfile,
  saveIssue,
  saveRepository,
  unsaveIssue,
  unsaveRepository
} from "../controllers/recommendations.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authMiddleware } from "../middleware/auth.js";

export const recommendationsRouter = Router();

recommendationsRouter.use(authMiddleware);
recommendationsRouter.post("/analyze-skills", asyncHandler(analyzeSkills));
recommendationsRouter.get("/skill-profile", asyncHandler(getSkillProfile));
recommendationsRouter.get("/repositories", asyncHandler(getRepositoryRecommendations));
recommendationsRouter.get("/issues", asyncHandler(getIssueRecommendations));
recommendationsRouter.post("/repositories/:repositoryId/save", asyncHandler(saveRepository));
recommendationsRouter.delete("/repositories/:repositoryId/save", asyncHandler(unsaveRepository));
recommendationsRouter.post("/issues/:issueId/save", asyncHandler(saveIssue));
recommendationsRouter.delete("/issues/:issueId/save", asyncHandler(unsaveIssue));
