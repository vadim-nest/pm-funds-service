import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

export async function registerSecurity(app: FastifyInstance) {
  const isTest = process.env.NODE_ENV === "test";

  await app.register(cors, {
    // reflect request Origin header (fine for local demo)
    origin: true,
  });

  await app.register(helmet, {
    // keep Swagger UI happy in dev; add CSP later with proper directives
    contentSecurityPolicy: false,
  });

  // Only register rate limit outside tests
  if (!isTest) {
    await app.register(rateLimit, {
      global: true,
      max: Number(process.env.RATE_LIMIT_MAX ?? "100"),
      timeWindow: process.env.RATE_LIMIT_WINDOW ?? "1 minute",
      addHeaders: {
        // turn OFF legacy X- headers
        "x-ratelimit-limit": false,
        "x-ratelimit-remaining": false,
        "x-ratelimit-reset": false,
        // turn ON standardized headers
        "retry-after": true,
        "ratelimit-limit": true,
        "ratelimit-remaining": true,
        "ratelimit-reset": true,
      },
      enableDraftSpec: true,
      allowList: [],
    });
  }
}
