import { buildApp } from "./app.js";

const app = buildApp();
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  });
