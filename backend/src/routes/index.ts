import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { aiRouter } from "./ai.routes.js";
import { githubRouter } from "./github.routes.js";
import { healthRouter } from "./health.routes.js";
import { recommendationsRouter } from "./recommendations.routes.js";

export const apiRouter = Router();

apiRouter.use("/ai", aiRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/github", githubRouter);
apiRouter.use("/health", healthRouter);
apiRouter.use("/recommendations", recommendationsRouter);
