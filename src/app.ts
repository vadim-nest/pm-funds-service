import Fastify from "fastify";
import dotenv from "dotenv";

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

  // Basic health route
  app.get("/health", async () => ({ status: "ok" }));

  // Placeholders for future route files (we'll register them later)
  // await app.register(import("./routes/funds.js"));
  // await app.register(import("./routes/investors.js"));
  // await app.register(import("./routes/investments.js"));

  return app;
}
