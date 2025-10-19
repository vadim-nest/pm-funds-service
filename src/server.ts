import { buildApp } from "./app.js";

const app = buildApp();

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

void app
  .listen({ port, host })
  .then((addr) => {
    app.log.info(`Server listening at ${addr}`);
  })
  .catch((err) => {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  });
