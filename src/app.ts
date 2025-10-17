import Fastify from "fastify";
import dotenv from "dotenv";
import { registerErrorHandler } from "./lib/error.js";

// ✅ use static imports for route plugins (simpler, safer)
import fundsRoutes from "./routes/funds.js";

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

  // ✅ register routes (no await needed here)
  app.register(fundsRoutes);

  return app;
}
