import type { FastifyInstance } from "fastify";
import { config as dotenv } from "dotenv";

// Load test env before importing the app
dotenv({ path: ".env.test" });

export async function startTestServer(): Promise<FastifyInstance> {
  const { buildApp } = await import("../../src/app.js"); // dynamic import after env load
  const app = buildApp();
  await app.ready();
  await app.listen({ port: 0, host: "127.0.0.1" });
  return app;
}

export async function stopTestServer(app?: FastifyInstance) {
  if (app) await app.close();
}
