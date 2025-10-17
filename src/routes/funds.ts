import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { FundCreateBody, FundUpdateBody, FundIdParam } from "../lib/validation.js";
import { HttpError } from "../lib/error.js";
import { serializeFund } from "../lib/serializers.js";

export default async function fundsRoutes(app: FastifyInstance) {
  app.get("/funds", async (_req, _reply) => {
    const rows = await prisma.fund.findMany({ orderBy: { created_at: "asc" } });
    return rows.map(serializeFund);
  });

  app.get<{
    Params: { id: string };
  }>("/funds/:id", async (req, reply) => {
    const params = FundIdParam.parse(req.params);
    const row = await prisma.fund.findUnique({ where: { id: params.id } });
    if (!row) {
      throw new HttpError(404, "NOT_FOUND", "Fund not found");
    }
    return serializeFund(row);
  });

  app.post<{
    Body: unknown;
  }>("/funds", async (req, reply) => {
    const body = FundCreateBody.parse(req.body);
    const created = await prisma.fund.create({
      data: {
        name: body.name,
        vintage_year: body.vintage_year,
        // target_size_usd: body.target_size_usd.toFixed(2),
        status: body.status,
      },
    });
    reply.code(201);
    return serializeFund(created);
  });

  // Spec expects PUT /funds with ID in body
  app.put<{
    Body: unknown;
  }>("/funds", async (req, _reply) => {
    const body = FundUpdateBody.parse(req.body);
    const updated = await prisma.fund.update({
      where: { id: body.id },
      data: {
        name: body.name,
        vintage_year: body.vintage_year,
        target_size_usd: body.target_size_usd.toFixed(2),
        status: body.status,
      },
    });
    return serializeFund(updated);
  });
}
