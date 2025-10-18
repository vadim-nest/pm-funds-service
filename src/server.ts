import { buildApp } from "./app.js";

const app = buildApp();

async function start() {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void start();
