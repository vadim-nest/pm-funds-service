import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { FundCreateBody, FundUpdateBody, FundIdParam } from "../lib/validation.js";
import { HttpError } from "../lib/error.js";
import { serializeFund } from "../lib/serializers.js";
import { FundSchema, FundArraySchema } from "../schemas/openapi.js";

export default async function fundsRoutes(app: FastifyInstance) {
  app.get(
    "/funds",
    {
      schema: {
        tags: ["Funds"],
        summary: "List all funds",
        response: { 200: FundArraySchema },
      },
    },
    async () => {
      const rows = await prisma.fund.findMany({ orderBy: { created_at: "asc" } });
      return rows.map(serializeFund);
    },
  );

  app.get<{ Params: { id: string } }>(
    "/funds/:id",
    {
      schema: {
        tags: ["Funds"],
        summary: "Get a fund by id",
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: FundSchema,
          404: { type: "object", properties: { error: { type: "object" } } },
        },
      },
    },
    async (req) => {
      const params = FundIdParam.parse(req.params);
      const row = await prisma.fund.findUnique({ where: { id: params.id } });
      if (!row) throw new HttpError(404, "NOT_FOUND", "Fund not found");
      return serializeFund(row);
    },
  );

  app.post<{ Body: unknown }>(
    "/funds",
    {
      schema: {
        tags: ["Funds"],
        summary: "Create a fund",
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            vintage_year: { type: "integer" },
            target_size_usd: { type: "number" },
            status: { type: "string", enum: ["Fundraising", "Investing", "Closed"] },
          },
          required: ["name", "vintage_year", "target_size_usd", "status"],
        },
        response: { 201: FundSchema },
      },
    },
    async (req, reply) => {
      const body = FundCreateBody.parse(req.body);
      const created = await prisma.fund.create({
        data: {
          name: body.name,
          vintage_year: body.vintage_year,
          target_size_usd: body.target_size_usd.toFixed(2),
          status: body.status,
        },
      });
      reply.code(201);
      return serializeFund(created);
    },
  );

  app.put<{ Body: unknown }>(
    "/funds",
    {
      schema: {
        tags: ["Funds"],
        summary: "Update a fund (id in body)",
        body: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            vintage_year: { type: "integer" },
            target_size_usd: { type: "number" },
            status: { type: "string", enum: ["Fundraising", "Investing", "Closed"] },
          },
          required: ["id", "name", "vintage_year", "target_size_usd", "status"],
        },
        response: { 200: FundSchema },
      },
    },
    async (req) => {
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
    },
  );
}
