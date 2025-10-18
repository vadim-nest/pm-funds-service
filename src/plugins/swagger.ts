import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Titanbay Funds API (Take-home)",
        description: "Private markets funds, investors, and investments",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3000" }],
      tags: [
        { name: "Funds", description: "Fund management" },
        { name: "Investors", description: "Investor management" },
        { name: "Investments", description: "Fund investments" },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  });
}
