import Fastify from "fastify";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";

import { registerErrorHandler } from "./lib/error.js";
import { registerSwagger } from "./plugins/swagger.js";
import { registerSecurity } from "./plugins/security.js";
import { config } from "./config.js";

import fundsRoutes from "./routes/funds.js";
import investorsRoutes from "./routes/investors.js";
import investmentsRoutes from "./routes/investments.js";
import analyticsRoutes from "./routes/analytics.js";

import { ErrorSchema, FundSchema, InvestorSchema, InvestmentSchema } from "./schemas/openapi.js";

dotenv.config();

export function buildApp() {
  const logger = config.isProd
    ? {
        level: "info",
        redact: {
          paths: [
            "req.headers.authorization",
            'req.headers["x-api-key"]',
            "req.headers.cookie",
            'res.headers["set-cookie"]',
            "env.DATABASE_URL",
            "env.POSTGRES_PASSWORD",
          ],
          remove: true,
        },
      }
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss Z" },
        },
        redact: {
          paths: [
            "req.headers.authorization",
            'req.headers["x-api-key"]',
            "req.headers.cookie",
            'res.headers["set-cookie"]',
          ],
          remove: true,
        },
      };

  const app = Fastify({
    logger,
    genReqId: (req) => (req.headers["x-request-id"] as string | undefined) ?? randomUUID(),
  });

  app.addHook("onRequest", (req, reply, done) => {
    reply.header("x-request-id", req.id);
    done();
  });

  app.get("/health", () => ({ status: "ok" }));

  // Plugins
  void registerSecurity(app);
  void registerErrorHandler(app);
  void registerSwagger(app);

  // Component schemas
  app.addSchema(ErrorSchema);
  app.addSchema(FundSchema);
  app.addSchema(InvestorSchema);
  app.addSchema(InvestmentSchema);

  // Routes
  app.register(fundsRoutes);
  app.register(investorsRoutes);
  app.register(investmentsRoutes);
  app.register(analyticsRoutes);

  return app;
}
