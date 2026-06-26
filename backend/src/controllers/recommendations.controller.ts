import type { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../lib/http-error.js";
import { recommendationService } from "../services/recommendation.service.js";

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

function getFilters(req: Request) {
  const filters: {
    language?: string;
    difficulty?: string;
    health?: string;
    label?: string;
  } = {};

  if (typeof req.query.language === "string" && req.query.language) {
    filters.language = req.query.language;
  }
  if (typeof req.query.difficulty === "string" && req.query.difficulty) {
    filters.difficulty = req.query.difficulty;
  }
  if (typeof req.query.health === "string" && req.query.health) {
    filters.health = req.query.health;
  }
  if (typeof req.query.label === "string" && req.query.label) {
    filters.label = req.query.label;
  }

  return filters;
}

export async function analyzeSkills(req: Request, res: Response) {
  res.json(await recommendationService.analyzeSkills(requireUserId(req)));
}

export async function getSkillProfile(req: Request, res: Response) {
  res.json(await recommendationService.getSkillProfile(requireUserId(req)));
}

export async function getRepositoryRecommendations(req: Request, res: Response) {
  res.json(await recommendationService.getRepositoryRecommendations(requireUserId(req), getFilters(req)));
}

export async function getIssueRecommendations(req: Request, res: Response) {
  res.json(await recommendationService.getIssueRecommendations(requireUserId(req), getFilters(req)));
}

export async function saveRepository(req: Request, res: Response) {
  res.json(
    await recommendationService.saveRepository(requireUserId(req), requireParam(req, "repositoryId"))
  );
}

export async function unsaveRepository(req: Request, res: Response) {
  res.json(
    await recommendationService.unsaveRepository(requireUserId(req), requireParam(req, "repositoryId"))
  );
}

export async function saveIssue(req: Request, res: Response) {
  res.json(await recommendationService.saveIssue(requireUserId(req), requireParam(req, "issueId")));
}

export async function unsaveIssue(req: Request, res: Response) {
  res.json(await recommendationService.unsaveIssue(requireUserId(req), requireParam(req, "issueId")));
}
