import Fastify from "fastify";
import dotenv from "dotenv";
import { registerErrorHandler } from "./lib/error.js";

import fundsRoutes from "./routes/funds.js";
import investorsRoutes from "./routes/investors.js";

dotenv.config();

export function buildApp() {
  const isProd = process.env.NODE_ENV === "production";

  const app = Fastify({
    logger: isProd
      ? true
      : {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "HH:MM:ss Z" },
          },
        },
  });

  // Health
  app.get("/health", async () => ({ status: "ok" }));

  // Error handler
  registerErrorHandler(app);

  app.register(fundsRoutes);
  app.register(investorsRoutes);

  return app;
}
