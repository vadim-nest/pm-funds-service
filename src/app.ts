import Fastify from "fastify";
import dotenv from "dotenv";
import { registerErrorHandler } from "./lib/error.js";
import { registerSwagger } from "./plugins/swagger.js";

import fundsRoutes from "./routes/funds.js";
import investorsRoutes from "./routes/investors.js";
import investmentsRoutes from "./routes/investments.js";

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

  app.get("/health", async () => ({ status: "ok" }));

  registerErrorHandler(app);
  registerSwagger(app);

  app.register(fundsRoutes);
  app.register(investorsRoutes);
  app.register(investmentsRoutes);

  return app;
}
